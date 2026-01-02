'use client';

import { useQuery } from '@apollo/client';
import { TRENDING_HASHTAGS } from '@/lib/queries';
import Link from 'next/link';

interface Hashtag {
    id: string;
    name: string;
    postsCount: number;
}

export default function TrendingHashtags() {
    const { data, loading } = useQuery(TRENDING_HASHTAGS, {
        variables: { limit: 10 },
    });

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-2xl p-4">
                <h2 className="text-xl font-bold mb-4">Trending</h2>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const hashtags: Hashtag[] = data?.trendingHashtags || [];

    if (hashtags.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-800 rounded-2xl p-4">
            <h2 className="text-xl font-bold mb-4">Trending</h2>
            <div className="space-y-4">
                {hashtags.map((hashtag, index) => (
                    <Link
                        key={hashtag.id}
                        href={`/hashtag/${hashtag.name}`}
                        className="block hover:bg-gray-700 -mx-4 px-4 py-2 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="text-xs text-gray-500 mb-1">
                                    {index + 1} · Trending
                                </div>
                                <div className="font-bold text-white">
                                    #{hashtag.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {hashtag.postsCount.toLocaleString()} {hashtag.postsCount === 1 ? 'post' : 'posts'}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
