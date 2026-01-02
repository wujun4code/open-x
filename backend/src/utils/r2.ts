import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Validate required environment variables
function validateR2Config() {
    const required = {
        R2_ENDPOINT: process.env.R2_ENDPOINT,
        R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
        R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    };

    const missing = Object.entries(required)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        throw new Error(
            `Missing required R2 environment variables: ${missing.join(', ')}. ` +
            'Please check your .env file and ensure all R2 credentials are configured.'
        );
    }
}

// Validate configuration on module load
validateR2Config();

// Initialize R2 client
const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT, // e.g., https://<account-id>.r2.cloudflarestorage.com
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'open-x-media';
const PUBLIC_URL = process.env.R2_PUBLIC_URL; // Optional: Custom domain or R2.dev URL

/**
 * Generate a presigned URL for uploading a file to R2
 * @param filename - The name of the file to upload
 * @param contentType - MIME type of the file
 * @returns Presigned upload URL and the public URL where the file will be accessible
 */
export async function generateUploadUrl(filename: string, contentType: string) {
    try {
        // Generate a unique filename to avoid collisions
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const key = `uploads/${timestamp}-${randomString}-${filename}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        // Generate presigned URL (valid for 1 hour)
        const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        // Construct the public URL
        const publicUrl = PUBLIC_URL
            ? `${PUBLIC_URL}/${BUCKET_NAME}/${key}`
            : `https://${BUCKET_NAME}.r2.dev/${key}`;

        console.log(`Generated upload URL for file: ${filename}, key: ${key}`);

        return {
            uploadUrl,
            publicUrl,
            key,
        };
    } catch (error) {
        console.error('Error generating upload URL:', error);
        throw new Error(
            `Failed to generate upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Delete a file from R2
 * @param key - The key (path) of the file to delete
 */
export async function deleteFile(key: string) {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');

    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    await r2Client.send(command);
}
