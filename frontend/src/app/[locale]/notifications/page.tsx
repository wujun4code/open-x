'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_NOTIFICATIONS, MARK_ALL_NOTIFICATIONS_AS_READ, GET_UNREAD_COUNT } from '@/lib/queries';
import NotificationItem from '@/components/NotificationItem';
import { CheckCheck } from 'lucide-react';
import { useState } from 'react';

export default function NotificationsPage() {
    const [limit] = useState(50);
    const { data, loading, fetchMore } = useQuery(GET_NOTIFICATIONS, {
        variables: { limit, offset: 0 },
    });

    const [markAllAsRead, { loading: markingAllAsRead }] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ, {
        refetchQueries: [
            { query: GET_NOTIFICATIONS, variables: { limit, offset: 0 } },
            { query: GET_UNREAD_COUNT },
        ],
    });

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    const notifications = data?.notifications || [];
    const hasUnread = notifications.some((n: any) => !n.read);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-700 p-8">
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white dark:bg-dark-800 rounded-t-2xl shadow-lg border border-gray-100 dark:border-dark-700 border-b-0 p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                        {hasUnread && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={markingAllAsRead}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CheckCheck className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {markingAllAsRead ? 'Marking...' : 'Mark all as read'}
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white dark:bg-dark-800 rounded-b-2xl shadow-lg border border-gray-100 dark:border-dark-700">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCheck className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No notifications yet
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                When someone interacts with your content, you&apos;ll see it here
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-dark-700">
                            {notifications.map((notification: any) => (
                                <NotificationItem key={notification.id} notification={notification} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Load More (for future pagination) */}
                {notifications.length >= limit && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() =>
                                fetchMore({
                                    variables: { offset: notifications.length },
                                })
                            }
                            className="px-6 py-3 bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors font-medium"
                        >
                            Load more
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
