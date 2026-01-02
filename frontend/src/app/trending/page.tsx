'use client';

import { TrendingUp, Hash, Flame, Newspaper, Users, Clock } from 'lucide-react';

// Mock trending data
const trendingTopics = [
    { id: 1, tag: 'Technology', posts: 12500, trend: '+15%' },
    { id: 2, tag: 'AI', posts: 9800, trend: '+22%' },
    { id: 3, tag: 'WebDevelopment', posts: 7600, trend: '+8%' },
    { id: 4, tag: 'React', posts: 6200, trend: '+12%' },
    { id: 5, tag: 'NextJS', posts: 5400, trend: '+18%' },
];

const hotNews = [
    {
        id: 1,
        title: 'Breaking: Major Tech Conference Announced for 2026',
        category: 'Technology',
        time: '2 hours ago',
        engagement: '2.5K',
    },
    {
        id: 2,
        title: 'New AI Model Achieves Breakthrough in Natural Language',
        category: 'AI',
        time: '4 hours ago',
        engagement: '1.8K',
    },
    {
        id: 3,
        title: 'Web Development Trends to Watch This Year',
        category: 'Development',
        time: '6 hours ago',
        engagement: '1.2K',
    },
];

const popularUsers = [
    { id: 1, name: 'Sarah Chen', username: 'sarahtech', followers: '125K', verified: true },
    { id: 2, name: 'Mike Johnson', username: 'mikecodes', followers: '98K', verified: true },
    { id: 3, name: 'Emma Davis', username: 'emmadesigns', followers: '76K', verified: false },
];

export default function TrendingPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Flame className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900">Trending Now</h1>
                    </div>
                    <p className="text-gray-600 text-lg">Discover what's hot and happening right now</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Trending Topics */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Trending Hashtags */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                                    <Hash className="w-6 h-6 text-blue-600" />
                                    <span>Trending Topics</span>
                                </h2>
                                <span className="text-sm text-gray-500">Last 24 hours</span>
                            </div>

                            <div className="space-y-4">
                                {trendingTopics.map((topic, index) => (
                                    <div
                                        key={topic.id}
                                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        #{topic.tag}
                                                    </span>
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                        {topic.trend}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">{topic.posts.toLocaleString()} posts</p>
                                            </div>
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hot News */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                <Newspaper className="w-6 h-6 text-orange-600" />
                                <span>Hot News</span>
                            </h2>

                            <div className="space-y-4">
                                {hotNews.map((news) => (
                                    <div
                                        key={news.id}
                                        className="p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border-l-4 border-orange-500"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors flex-1">
                                                {news.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                                {news.category}
                                            </span>
                                            <div className="flex items-center space-x-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{news.time}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Users className="w-4 h-4" />
                                                <span>{news.engagement} engaged</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Popular Users */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                <Users className="w-6 h-6 text-purple-600" />
                                <span>Popular Users</span>
                            </h2>

                            <div className="space-y-4">
                                {popularUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-1">
                                                    <p className="font-semibold text-gray-900">{user.name}</p>
                                                    {user.verified && (
                                                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">@{user.username}</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                            Follow
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                                Show More
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
