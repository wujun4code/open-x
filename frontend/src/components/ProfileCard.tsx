'use client';

import { useQuery, gql } from '@apollo/client';
import { User, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      name
      bio
      avatar
      createdAt
      followersCount
      followingCount
      postsCount
    }
  }
`;

export default function ProfileCard() {
    const t = useTranslations('ProfileCard');
    const { data, loading, error } = useQuery(ME_QUERY);

    if (loading) {
        return (
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-dark-700">
                <div className="animate-pulse">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-dark-600 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data?.me) {
        return null;
    }

    const user = data.me;
    const joinDate = new Date(parseInt(user.createdAt)).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
    });

    return (
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-700 overflow-hidden sticky top-24">
            {/* Compact Header with gradient */}
            <div className="h-16 bg-gradient-to-r from-blue-600 to-purple-600"></div>

            {/* Profile Content */}
            <div className="px-4 pb-4">
                {/* Avatar */}
                <div className="flex justify-center -mt-8 mb-3">
                    <Link href="/profile">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full border-4 border-white dark:border-dark-800 flex items-center justify-center shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name || user.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-white" />
                            )}
                        </div>
                    </Link>
                </div>

                {/* User Info */}
                <div className="text-center mb-3">
                    <Link href="/profile" className="hover:underline">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user.name || user.username}</h2>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                </div>

                {/* Join Date */}
                <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{t('joined')} {joinDate}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-around py-3 border-t border-gray-100 dark:border-dark-700">
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{user.postsCount}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{t('posts')}</div>
                    </div>
                    <div className="text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 px-2 py-1 rounded transition-colors">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{user.followersCount}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{t('followers')}</div>
                    </div>
                    <div className="text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 px-2 py-1 rounded transition-colors">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{user.followingCount}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{t('following')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
