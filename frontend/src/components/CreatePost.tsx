'use client';

import { useState, useRef } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Image, Send, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

const GENERATE_UPLOAD_URL = gql`
  mutation GenerateUploadUrl($filename: String!, $contentType: String!) {
    generateUploadUrl(filename: $filename, contentType: $contentType) {
      uploadUrl
      publicUrl
      key
    }
  }
`;

const CREATE_POST_MUTATION = gql`
  mutation CreatePost($content: String!, $imageUrl: String) {
    createPost(content: $content, imageUrl: $imageUrl) {
      id
      content
      imageUrl
      createdAt
      user {
        id
        name
        username
        avatar
      }
      likesCount
      commentsCount
      isLiked
    }
  }
`;

const POSTS_QUERY = gql`
  query GetPosts($limit: Int, $offset: Int) {
    posts(limit: $limit, offset: $offset) {
      id
      content
      imageUrl
      createdAt
      user {
        id
        name
        username
        avatar
      }
      likesCount
      commentsCount
      isLiked
    }
  }
`;

interface CreatePostProps {
    onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
    const t = useTranslations('CreatePost');
    const [content, setContent] = useState('');
    const [user, setUser] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const maxLength = 280;

    const [generateUploadUrl] = useMutation(GENERATE_UPLOAD_URL);
    const [createPost, { loading }] = useMutation(CREATE_POST_MUTATION, {
        update(cache, { data }) {
            if (!data?.createPost) return;

            try {
                // Read the existing posts from cache
                const existingPosts: any = cache.readQuery({
                    query: POSTS_QUERY,
                    variables: { limit: 20, offset: 0 }
                });

                // Write the new post to the cache
                if (existingPosts?.posts) {
                    cache.writeQuery({
                        query: POSTS_QUERY,
                        variables: { limit: 20, offset: 0 },
                        data: {
                            posts: [data.createPost, ...existingPosts.posts]
                        }
                    });
                }
            } catch (error) {
                // Cache might not exist yet, that's okay
                console.log('Cache update skipped:', error);
            }
        },
        onCompleted: () => {
            setContent('');
            setSelectedImage(null);
            setImagePreview(null);
            if (onPostCreated) {
                onPostCreated();
            }
        },
        onError: (error) => {
            alert(`Error creating post: ${error.message}`);
        },
    });

    // Get user from localStorage
    useState(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    });

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        setSelectedImage(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadImageToR2 = async (file: File): Promise<string> => {
        try {
            // Get upload URL from backend
            const { data } = await generateUploadUrl({
                variables: {
                    filename: file.name,
                    contentType: file.type,
                },
            });

            if (!data?.generateUploadUrl) {
                throw new Error('Failed to generate upload URL');
            }

            const { uploadUrl, publicUrl } = data.generateUploadUrl;

            // Upload file to R2
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload image');
            }

            return publicUrl;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || content.length > maxLength) return;

        try {
            setIsUploading(true);
            let imageUrl: string | undefined;

            // Upload image if selected
            if (selectedImage) {
                imageUrl = await uploadImageToR2(selectedImage);
            }

            // Create post with image URL
            await createPost({
                variables: {
                    content: content.trim(),
                    imageUrl,
                },
            });
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const remainingChars = maxLength - content.length;
    const isOverLimit = remainingChars < 0;
    const isNearLimit = remainingChars <= 20 && remainingChars >= 0;
    const isSubmitting = loading || isUploading;

    return (
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-700 p-6">
            <form onSubmit={handleSubmit}>
                <div className="flex space-x-4">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                            {user?.name?.[0] || user?.username?.[0] || 'U'}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={t('placeholder')}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 dark:bg-dark-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg"
                            rows={3}
                            disabled={isSubmitting}
                        />

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="mt-3 relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full max-h-64 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-1 bg-gray-900 bg-opacity-75 text-white rounded-full hover:bg-opacity-90 transition-all"
                                    disabled={isSubmitting}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50"
                                    title={t('addImage')}
                                    disabled={isSubmitting}
                                >
                                    <Image className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center space-x-4">
                                {/* Character Counter */}
                                <div
                                    className={`text-sm font-medium ${isOverLimit
                                        ? 'text-red-600'
                                        : isNearLimit
                                            ? 'text-orange-600'
                                            : 'text-gray-500'
                                        }`}
                                >
                                    {remainingChars}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !content.trim() || isOverLimit}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>
                                        {isUploading ? t('uploading') : loading ? t('posting') : t('post')}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
