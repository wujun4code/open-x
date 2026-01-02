'use client';

import { useQuery } from '@apollo/client';
import { POSTS_BY_HASHTAG } from '@/lib/queries';
import PostCard from '@/components/PostCard';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Post {
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
}

export default function HashtagPage() {
    const params = useParams();
    const hashtag = params.tag as string;

    const { data, loading, error, refetch } = useQuery(POSTS_BY_HASHTAG, {
        variables: { hashtag, limit: 50 },
    });

    const posts: Post[] = data?.postsByHashtag || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Home</span>
                    </Link>
                    <h1 className="text-4xl font-bold mb-2 text-gray-900">#{hashtag}</h1>
                    <p className="text-gray-600">
                        {loading ? 'Loading...' : `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`}
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-gray-100 shadow-lg">
                                <div className="flex space-x-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-700">
                        Error loading posts: {error.message}
                    </div>
                )}

                {/* Posts */}
                {!loading && !error && (
                    <div className="space-y-4">
                        {posts.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-lg">
                                <p className="text-gray-600 text-lg">No posts found with #{hashtag}</p>
                                <p className="text-gray-500 mt-2">Be the first to post about this topic!</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onPostDeleted={() => refetch()}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
