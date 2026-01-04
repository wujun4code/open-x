'use client';

import { User } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { SEARCH_USERS } from '@/lib/queries';
import { useTranslations } from 'next-intl';

interface MentionListProps {
    query: string;
    onSelect: (user: any) => void;
    position: { top: number; left: number };
}

export default function MentionList({ query, onSelect, position }: MentionListProps) {
    const t = useTranslations('Mention');
    const { data, loading } = useQuery(SEARCH_USERS, {
        variables: { query, limit: 5 },
    });

    const users = data?.searchUsers || [];

    if (loading) {
        return (
            <div
                className="fixed z-50 bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-gray-200 dark:border-dark-700 p-3 min-w-[250px]"
                style={{ top: `${position.top}px`, left: `${position.left}px` }}
            >
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('loading')}</div>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div
                className="fixed z-50 bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-gray-200 dark:border-dark-700 p-3 min-w-[250px]"
                style={{ top: `${position.top}px`, left: `${position.left}px` }}
            >
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('noUsers')}</div>
            </div>
        );
    }

    return (
        <div
            className="fixed z-50 bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-gray-200 dark:border-dark-700 py-2 min-w-[250px] max-h-[300px] overflow-y-auto"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
            {users.map((user: any) => (
                <button
                    key={user.id}
                    onClick={() => onSelect(user)}
                    className="w-full px-4 py-2 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors text-left"
                >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.username}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.name?.[0] || user.username[0]}
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">
                            {user.name || user.username}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            @{user.username}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
