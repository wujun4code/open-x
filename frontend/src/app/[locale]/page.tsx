'use client';

import { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import ProfileCard from '@/components/ProfileCard';
import CreatePost from '@/components/CreatePost';
import PostFeed from '@/components/PostFeed';
import TrendingHashtags from '@/components/TrendingHashtags';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

const HELLO_QUERY = gql`
  query Hello {
    hello
  }
`;

export default function Home() {
    const { data, loading, error } = useQuery(HELLO_QUERY);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const t = useTranslations('Home');

    useEffect(() => {
        // Check authentication status
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
                {isAuthenticated ? (
                    // Authenticated User View
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
                        {/* Left Sidebar - Profile */}
                        <div className="hidden lg:block lg:col-span-1">
                            <ProfileCard />
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Create Post */}
                            <CreatePost />

                            {/* Post Feed */}
                            <PostFeed />
                        </div>

                        {/* Right Sidebar - Trending */}
                        <div className="lg:col-span-1 hidden lg:block">
                            <div className="sticky top-8">
                                <TrendingHashtags />
                            </div>
                        </div>
                    </div>
                ) : (
                    // Guest User View
                    <div className="max-w-6xl mx-auto">
                        {/* Hero Section */}
                        <div className="text-center mb-16 pt-8">
                            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {t('heroTitle')}
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                                {t('heroSubtitle')}
                            </p>
                            <div className="flex items-center justify-center space-x-4">
                                <Link
                                    href="/auth"
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl"
                                >
                                    {t('getStarted')}
                                </Link>
                                <Link
                                    href="/auth"
                                    className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-dark-800 dark:hover:border-blue-500 transition-all font-medium"
                                >
                                    {t('signIn')}
                                </Link>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid md:grid-cols-3 gap-6 mb-16">
                            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-dark-700 hover:shadow-xl transition-shadow">
                                <div className="text-4xl mb-4">⚡</div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{t('features.fast')}</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {t('features.fastDesc')}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-dark-700 hover:shadow-xl transition-shadow">
                                <div className="text-4xl mb-4">🎨</div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{t('features.design')}</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {t('features.designDesc')}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-dark-700 hover:shadow-xl transition-shadow">
                                <div className="text-4xl mb-4">🔒</div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{t('features.secure')}</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {t('features.secureDesc')}
                                </p>
                            </div>
                        </div>

                        {/* API Status for Guests */}
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-dark-700">
                                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                    🚀 {t('apiStatus.title')}
                                </h2>

                                {loading && (
                                    <div className="flex items-center space-x-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        <span className="text-gray-600 dark:text-gray-300">{t('apiStatus.connecting')}</span>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                        <p className="text-red-600 dark:text-red-400">❌ {t('apiStatus.error')}: {error.message}</p>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                                            {t('apiStatus.backendTip')}
                                        </p>
                                    </div>
                                )}

                                {data && (
                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                        <p className="text-green-700 dark:text-green-400 text-lg font-semibold">
                                            ✅ {data.hello}
                                        </p>
                                        <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                                            {t('apiStatus.connected')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
