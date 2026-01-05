'use client';

import { useQuery } from '@apollo/client';
import { TRENDING_HASHTAGS } from '@/lib/queries';
import { TrendingUp, Hash, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Hashtag {
    id: string;
    name: string;
    postsCount: number;
    createdAt: string;
}

export default function TrendingPage() {
    const { data, loading, error } = useQuery(TRENDING_HASHTAGS, {
        variables: { limit: 20 },
    });

    const hashtags: Hashtag[] = data?.trendingHashtags || [];

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Home</span>
                </Link>

                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Trending Now</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">Discover what&apos;s hot and happening right now</p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-100 dark:border-dark-700 shadow-lg">
                        <div className="space-y-4">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="animate-pulse flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-dark-700 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-1/3"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
                        Error loading trending topics: {error.message}
                    </div>
                )}

                {/* Trending Hashtags */}
                {!loading && !error && (
                    <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-100 dark:border-dark-700 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center space-x-2 text-gray-900 dark:text-white">
                                <Hash className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <span>Trending Topics</span>
                            </h2>
                            <span className="text-sm text-gray-500 dark:text-gray-400">All time</span>
                        </div>

                        {hashtags.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600 dark:text-gray-300 text-lg">No trending topics yet</p>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Be the first to start a conversation!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {hashtags.map((hashtag, index) => (
                                    <Link
                                        key={hashtag.id}
                                        href={`/hashtag/${hashtag.name}`}
                                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        #{hashtag.name}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {hashtag.postsCount.toLocaleString()} {hashtag.postsCount === 1 ? 'post' : 'posts'}
                                                </p>
                                            </div>
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-green-400 dark:text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
