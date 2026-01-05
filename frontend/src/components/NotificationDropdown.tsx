'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_NOTIFICATIONS, MARK_ALL_NOTIFICATIONS_AS_READ, GET_UNREAD_COUNT } from '@/lib/queries';
import NotificationItem from './NotificationItem';
import { Link } from '@/navigation';
import { CheckCheck } from 'lucide-react';

interface NotificationDropdownProps {
    onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
    const { data, loading } = useQuery(GET_NOTIFICATIONS, {
        variables: { limit: 10, offset: 0 },
    });

    const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ, {
        refetchQueries: [
            { query: GET_NOTIFICATIONS, variables: { limit: 10, offset: 0 } },
            { query: GET_UNREAD_COUNT },
        ],
    });

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    if (loading) {
        return (
            <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-gray-200 dark:border-dark-700 z-50">
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    const notifications = data?.notifications || [];
    const hasUnread = notifications.some((n: any) => !n.read);

    return (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-gray-200 dark:border-dark-700 z-50 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h3>
                {hasUnread && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="Mark all as read"
                    >
                        <CheckCheck className="w-4 h-4" />
                        <span>Mark all read</span>
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            When someone interacts with your content, you&apos;ll see it here
                        </p>
                    </div>
                ) : (
                    notifications.map((notification: any) => (
                        <NotificationItem key={notification.id} notification={notification} onClick={onClose} />
                    ))
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="border-t border-gray-200 dark:border-dark-700 p-3">
                    <Link
                        href="/notifications"
                        onClick={onClose}
                        className="block text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                        See all notifications
                    </Link>
                </div>
            )}
        </div>
    );
}
