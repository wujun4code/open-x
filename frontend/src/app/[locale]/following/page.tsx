'use client';

import { useQuery } from '@apollo/client';
import { GET_FOLLOWING_QUERY } from '@/lib/queries';
import UserListItem from '@/components/UserListItem';
import { useRouter } from '@/navigation';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export default function FollowingPage() {
    const t = useTranslations('Follow');
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserId(user.id);
        }
    }, []);

    const { data, loading, error } = useQuery(GET_FOLLOWING_QUERY, {
        variables: { userId },
        skip: !userId,
    });

    if (!userId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl">
                {/* Header */}
                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-700 p-4 sm:p-6 mb-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                                <UserPlus className="w-6 h-6" />
                                <span>{t('following')}</span>
                            </h1>
                            {data?.user && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    @{data.user.username}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Following List */}
                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-700 overflow-hidden">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {error && (
                        <div className="p-8 text-center">
                            <p className="text-red-600 dark:text-red-400">{t('loadError')}</p>
                        </div>
                    )}

                    {data && !loading && (
                        <>
                            {data.user.following.length === 0 ? (
                                <div className="p-12 text-center">
                                    <UserPlus className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {t('noFollowing')}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {t('noFollowingDesc')}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-dark-700">
                                    {data.user.following.map((followingUser: any) => (
                                        <UserListItem key={followingUser.id} user={followingUser} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
