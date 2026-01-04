'use client';

import { Link } from '@/navigation';
import { User } from 'lucide-react';
import FollowButton from './FollowButton';
import { useEffect, useState } from 'react';

interface UserListItemProps {
    user: {
        id: string;
        username: string;
        name?: string;
        avatar?: string;
        bio?: string;
    };
    showFollowButton?: boolean;
}

export default function UserListItem({ user, showFollowButton = true }: UserListItemProps) {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const currentUser = JSON.parse(userStr);
            setCurrentUserId(currentUser.id);
        }
    }, []);

    const isOwnProfile = currentUserId === user.id;

    return (
        <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors rounded-lg">
            {/* Avatar */}
            <Link href={`/profile/${user.username}`} className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name || user.username}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <User className="w-6 h-6" />
                    )}
                </div>
            </Link>

            {/* User Info */}
            <div className="flex-1 min-w-0">
                <Link href={`/profile/${user.username}`} className="block">
                    <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white hover:underline truncate">
                            {user.name || user.username}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        @{user.username}
                    </p>
                </Link>

                {user.bio && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                        {user.bio}
                    </p>
                )}
            </div>

            {/* Follow Button */}
            {showFollowButton && !isOwnProfile && (
                <div className="flex-shrink-0">
                    <FollowButton
                        userId={user.id}
                        initialIsFollowing={isFollowing}
                        onFollowChange={setIsFollowing}
                        size="sm"
                    />
                </div>
            )}
        </div>
    );
}
