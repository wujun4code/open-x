'use client';

import { Heart, MessageCircle, UserPlus, AtSign } from 'lucide-react';
import { Link } from '@/navigation';
import { useMutation } from '@apollo/client';
import { MARK_NOTIFICATION_AS_READ, GET_UNREAD_COUNT } from '@/lib/queries';
import { useTranslations } from 'next-intl';

interface NotificationItemProps {
    notification: {
        id: string;
        type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION';
        read: boolean;
        createdAt: string;
        actor: {
            id: string;
            username: string;
            name: string;
            avatar?: string;
        };
        post?: {
            id: string;
            content: string;
        };
        comment?: {
            id: string;
            content: string;
        };
    };
    onClick?: () => void;
}

export default function NotificationItem({ notification, onClick }: NotificationItemProps) {
    const t = useTranslations('Notifications');
    const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ, {
        refetchQueries: [{ query: GET_UNREAD_COUNT }],
    });

    const handleClick = async () => {
        if (!notification.read) {
            await markAsRead({ variables: { id: notification.id } });
        }
        if (onClick) onClick();
    };

    const getIcon = () => {
        switch (notification.type) {
            case 'LIKE':
                return <Heart className="w-8 h-8 text-red-500 fill-red-500" />;
            case 'COMMENT':
                return <MessageCircle className="w-8 h-8 text-blue-500" />;
            case 'FOLLOW':
                return <UserPlus className="w-8 h-8 text-green-500" />;
            case 'MENTION':
                return <AtSign className="w-8 h-8 text-purple-500" />;
        }
    };

    const getMessage = () => {
        const actorName = notification.actor.name || notification.actor.username;
        switch (notification.type) {
            case 'LIKE':
                return `${actorName} ${t('types.likedPost')}`;
            case 'COMMENT':
                return `${actorName} ${t('types.commentedPost')}`;
            case 'FOLLOW':
                return `${actorName} ${t('types.startedFollowing')}`;
            case 'MENTION':
                return `${actorName} ${t('types.mentionedYou')}`;
        }
    };

    const getLink = () => {
        switch (notification.type) {
            case 'LIKE':
            case 'COMMENT':
            case 'MENTION':
                return notification.post ? `/post/${notification.post.id}` : '#';
            case 'FOLLOW':
                return `/profile/${notification.actor.username}`;
            default:
                return '#';
        }
    };

    const getTimeAgo = () => {
        const now = Date.now();
        const createdAt = parseInt(notification.createdAt);
        const diff = now - createdAt;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return t('timeAgo.daysAgo', { count: days });
        if (hours > 0) return t('timeAgo.hoursAgo', { count: hours });
        if (minutes > 0) return t('timeAgo.minutesAgo', { count: minutes });
        return t('timeAgo.justNow');
    };

    return (
        <Link
            href={getLink()}
            onClick={handleClick}
            className={`flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors border-b border-gray-100 dark:border-dark-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
        >
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">{getIcon()}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start space-x-3">
                    {/* Actor Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                            {notification.actor.avatar ? (
                                <img
                                    src={notification.actor.avatar}
                                    alt={notification.actor.name || notification.actor.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                notification.actor.username[0].toUpperCase()
                            )}
                        </div>
                    </div>

                    {/* Message */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-semibold">
                                {notification.actor.name || notification.actor.username}
                            </span>{' '}
                            <span className="text-gray-600 dark:text-gray-400">
                                {getMessage().replace(notification.actor.name || notification.actor.username, '').trim()}
                            </span>
                        </p>
                        {notification.post && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                                {notification.post.content}
                            </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{getTimeAgo()}</p>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.read && (
                        <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
