'use client';

import { useState, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ImageModal from './ImageModal';
import { parseHashtags, getHashtagName } from '@/lib/hashtag';
import CommentList from './CommentList';
import CreateComment from './CreateComment';

const LIKE_POST_MUTATION = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId)
  }
`;

const UNLIKE_POST_MUTATION = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId)
  }
`;

const DELETE_POST_MUTATION = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

interface PostCardProps {
    post: {
        id: string;
        content: string;
        imageUrl?: string;
        createdAt: string;
        user: {
            id: string;
            name?: string;
            username: string;
            avatar?: string;
        };
        likesCount: number;
        commentsCount: number;
        isLiked: boolean;
    };
    onPostDeleted?: () => void;
}

export default function PostCard({ post, onPostDeleted }: PostCardProps) {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentsCount, setCommentsCount] = useState(post.commentsCount);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUserId(user.id);
        }
    }, []);

    useEffect(() => {
        setIsLiked(post.isLiked);
        setLikesCount(post.likesCount);
        setCommentsCount(post.commentsCount);
    }, [post.isLiked, post.likesCount, post.commentsCount]);

    const [likePost] = useMutation(LIKE_POST_MUTATION, {
        onCompleted: () => {
            setIsLiked(true);
            setLikesCount(likesCount + 1);
        },
        onError: (error) => {
            console.error('Error liking post:', error);
        },
    });

    const [unlikePost] = useMutation(UNLIKE_POST_MUTATION, {
        onCompleted: () => {
            setIsLiked(false);
            setLikesCount(likesCount - 1);
        },
        onError: (error) => {
            console.error('Error unliking post:', error);
        },
    });

    const [deletePost] = useMutation(DELETE_POST_MUTATION, {
        onCompleted: () => {
            if (onPostDeleted) {
                onPostDeleted();
            }
        },
        onError: (error) => {
            alert(`Error deleting post: ${error.message}`);
        },
    });

    const handleLikeToggle = async () => {
        if (isLiked) {
            await unlikePost({ variables: { postId: post.id } });
        } else {
            await likePost({ variables: { postId: post.id } });
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this post?')) {
            await deletePost({ variables: { id: post.id } });
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(parseInt(timestamp));
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const renderContent = () => {
        const segments = parseHashtags(post.content);
        return segments.map((segment, index) => {
            if (segment.type === 'hashtag') {
                const hashtagName = getHashtagName(segment.content);
                return (
                    <Link
                        key={index}
                        href={`/hashtag/${hashtagName}`}
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {segment.content}
                    </Link>
                );
            }
            return <span key={index}>{segment.content}</span>;
        });
    };

    const isOwnPost = currentUserId === post.user.id;

    return (
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-700 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex space-x-3 sm:space-x-4">
                {/* User Avatar */}
                <Link href={`/profile`} className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                        {post.user.avatar ? (
                            <img src={post.user.avatar} alt={post.user.name || post.user.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            post.user.name?.[0] || post.user.username[0]
                        )}
                    </div>
                </Link>

                {/* Post Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <Link href={`/profile`} className="font-semibold text-gray-900 dark:text-white hover:underline">
                                {post.user.name || post.user.username}
                            </Link>
                            <span className="text-gray-500 dark:text-gray-400">@{post.user.username}</span>
                            <span className="text-gray-400 dark:text-gray-500">·</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">{formatTimestamp(post.createdAt)}</span>
                        </div>

                        {/* Actions Menu */}
                        {isOwnPost && (
                            <button
                                onClick={handleDelete}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete post"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Post Text */}
                    <p className="text-gray-900 dark:text-white text-lg mb-3 whitespace-pre-wrap break-words">
                        {renderContent()}
                    </p>

                    {/* Post Image */}
                    {post.imageUrl && (
                        <>
                            <div
                                className="mb-3 rounded-lg overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <img
                                    src={post.imageUrl}
                                    alt="Post image"
                                    className="w-full max-h-96 object-cover"
                                />
                            </div>

                            {isModalOpen && (
                                <ImageModal
                                    imageUrl={post.imageUrl}
                                    onClose={() => setIsModalOpen(false)}
                                />
                            )}
                        </>
                    )}

                    {/* Interaction Buttons */}
                    <div className="flex items-center flex-wrap gap-2 sm:gap-0 sm:space-x-6 pt-3 border-t border-gray-100 dark:border-dark-700">
                        {/* Like Button */}
                        <button
                            onClick={handleLikeToggle}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isLiked
                                ? 'text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                                : 'text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            <span className="font-medium">{likesCount}</span>
                        </button>

                        {/* Comment Button */}
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className={`flex items-center space-x-2 px-3 py-2 transition-colors rounded-lg ${showComments
                                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                }`}
                        >
                            <MessageCircle className={`w-5 h-5 ${showComments ? 'fill-current' : ''}`} />
                            <span className="font-medium">{commentsCount}</span>
                        </button>

                        {/* Share Button */}
                        <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Comments Section */}
                    {showComments && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-700">
                            <CreateComment
                                postId={post.id}
                                onCommentAdded={() => setCommentsCount(prev => prev + 1)}
                            />
                            <CommentList
                                postId={post.id}
                                onCommentDeleted={() => setCommentsCount(prev => prev - 1)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
