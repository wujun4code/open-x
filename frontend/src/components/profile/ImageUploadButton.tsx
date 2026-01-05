'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Upload, X, Loader2 } from 'lucide-react';

const GENERATE_UPLOAD_URL = gql`
  mutation GenerateUploadUrl($filename: String!, $contentType: String!) {
    generateUploadUrl(filename: $filename, contentType: $contentType) {
      uploadUrl
      publicUrl
      key
    }
  }
`;

interface ImageUploadButtonProps {
    currentImage?: string | null;
    onImageChange: (url: string | null) => void;
    label: string;
    aspectRatio?: '16:9' | '1:1';
    maxSizeMB?: number;
}

export default function ImageUploadButton({
    currentImage,
    onImageChange,
    label,
    aspectRatio = '1:1',
    maxSizeMB = 5,
}: ImageUploadButtonProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [generateUploadUrl] = useMutation(GENERATE_UPLOAD_URL);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Please select a JPEG, PNG, or WebP image');
            return;
        }

        // Validate file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            setError(`Image must be smaller than ${maxSizeMB}MB`);
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to R2
        try {
            setUploading(true);

            // Generate upload URL
            const { data } = await generateUploadUrl({
                variables: {
                    filename: file.name,
                    contentType: file.type,
                },
            });

            if (!data?.generateUploadUrl) {
                throw new Error('Failed to generate upload URL');
            }

            // Upload file to R2
            const uploadResponse = await fetch(data.generateUploadUrl.uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload image');
            }

            // Update parent component with public URL
            onImageChange(data.generateUploadUrl.publicUrl);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload image. Please try again.');
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onImageChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const displayImage = preview || currentImage;

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>

            {displayImage && (
                <div className="relative inline-block">
                    <img
                        src={displayImage}
                        alt="Preview"
                        className={`object-cover border-2 border-gray-200 dark:border-dark-700 ${aspectRatio === '1:1'
                                ? 'w-32 h-32 rounded-full'
                                : 'w-full max-w-md h-40 rounded-lg'
                            }`}
                    />
                    <button
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                        title="Remove image"
                        type="button"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="flex items-center gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4" />
                            {displayImage ? 'Change' : 'Upload'} {label}
                        </>
                    )}
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {aspectRatio === '16:9' ? '16:9 aspect ratio' : 'Square (1:1)'} • Max {maxSizeMB}MB
                </span>
            </div>

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
}
