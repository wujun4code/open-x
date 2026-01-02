'use client';

import { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import ProfileCard from '@/components/ProfileCard';
import CreatePost from '@/components/CreatePost';
import PostFeed from '@/components/PostFeed';
import TrendingHashtags from '@/components/TrendingHashtags';
import Link from 'next/link';

const HELLO_QUERY = gql`
  query Hello {
    hello
  }
`;

export default function Home() {
    const { data, loading, error } = useQuery(HELLO_QUERY);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check authentication status
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                {isAuthenticated ? (
                    // Authenticated User View
                    <div className="grid lg:grid-cols-4 gap-6">
                        {/* Left Sidebar - Profile */}
                        <div className="lg:col-span-1">
                            <ProfileCard />
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Create Post */}
                            <CreatePost onPostCreated={() => window.location.reload()} />

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
                                Welcome to Open X
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                A modern social platform built with cutting-edge technology
                            </p>
                            <div className="flex items-center justify-center space-x-4">
                                <Link
                                    href="/auth"
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    href="/auth"
                                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all font-medium"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid md:grid-cols-3 gap-6 mb-16">
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="text-4xl mb-4">⚡</div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900">Lightning Fast</h3>
                                <p className="text-gray-600">
                                    Built with Next.js 14 and optimized for performance
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="text-4xl mb-4">🎨</div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900">Beautiful Design</h3>
                                <p className="text-gray-600">
                                    Modern UI with TailwindCSS and smooth animations
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="text-4xl mb-4">🔒</div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900">Secure & Scalable</h3>
                                <p className="text-gray-600">
                                    GraphQL API with JWT authentication and PostgreSQL
                                </p>
                            </div>
                        </div>

                        {/* API Status for Guests */}
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                    🚀 GraphQL API Status
                                </h2>

                                {loading && (
                                    <div className="flex items-center space-x-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        <span className="text-gray-600">Connecting to API...</span>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-600">❌ Error: {error.message}</p>
                                        <p className="text-gray-600 text-sm mt-2">
                                            Make sure the backend server is running on port 4000
                                        </p>
                                    </div>
                                )}

                                {data && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-green-700 text-lg font-semibold">
                                            ✅ {data.hello}
                                        </p>
                                        <p className="text-green-600 text-sm mt-2">
                                            Backend is connected and responding!
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
