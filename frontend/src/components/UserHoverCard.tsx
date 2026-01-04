'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { UserPlus, UserCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from '@/navigation';

const GET_USER_BY_USERNAME = gql`
  query GetUserByUsername($username: String!) {
    searchUsers(query: $username, limit: 1) {
      id
      username
      name
      avatar
      bio
      followersCount
      followingCount
      postsCount
    }
  }
`;

const FOLLOW_USER = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId)
  }
`;

const UNFOLLOW_USER = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId)
  }
`;

interface UserHoverCardProps {
    username: string;
    position: { x: number; y: number };
    onClose: () => void;
}

export default function UserHoverCard({ username, position, onClose }: UserHoverCardProps) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const { data, loading } = useQuery(GET_USER_BY_USERNAME, {
        variables: { username },
        skip: !username,
    });

    const [followUser] = useMutation(FOLLOW_USER);
    const [unfollowUser] = useMutation(UNFOLLOW_USER);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUserId(user.id);
        }
    }, []);

    useEffect(() => {
        // Fade in animation
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const user = data?.searchUsers?.[0];

    if (loading || !user) {
        return (
            <div
                className="fixed z-[100] bg-white dark:bg-dark-800 rounded-xl shadow-2xl border border-gray-200 dark:border-dark-700 p-4 w-80"
                style={{
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                    opacity: 0.5,
                }}
                onMouseEnter={(e) => e.stopPropagation()}
                onMouseLeave={onClose}
            >
                <div className="animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-dark-700 rounded-full mb-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUserId === user.id;

    const handleFollowToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isFollowing) {
            await unfollowUser({ variables: { userId: user.id } });
            setIsFollowing(false);
        } else {
            await followUser({ variables: { userId: user.id } });
            setIsFollowing(true);
        }
    };

    return (
        <div
            className={`fixed z-[100] bg-white/95 dark:bg-dark-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-dark-700/50 p-5 w-80 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                }`}
            style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
            }}
            onMouseEnter={(e) => e.stopPropagation()}
            onMouseLeave={onClose}
        >
            {/* Gradient Background Accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 rounded-2xl pointer-events-none"></div>

            <div className="relative">
                {/* User Avatar */}
                <Link href={`/profile/${user.username}`} className="block">
                    <div className="mb-4">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name || user.username}
                                className="w-16 h-16 rounded-full object-cover ring-4 ring-white dark:ring-dark-900 shadow-lg hover:scale-105 transition-transform"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl ring-4 ring-white dark:ring-dark-900 shadow-lg hover:scale-105 transition-transform">
                                {user.name?.[0] || user.username[0]}
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="mb-3">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white hover:underline">
                            {user.name || user.username}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            @{user.username}
                        </p>
                    </div>
                </Link>

                {/* Bio */}
                {user.bio && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {user.bio}
                    </p>
                )}

                {/* Stats */}
                <div className="flex items-center space-x-4 mb-4 text-sm">
                    <div>
                        <span className="font-bold text-gray-900 dark:text-white">
                            {user.postsCount || 0}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">
                            Posts
                        </span>
                    </div>
                    <div>
                        <span className="font-bold text-gray-900 dark:text-white">
                            {user.followersCount || 0}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">
                            Followers
                        </span>
                    </div>
                    <div>
                        <span className="font-bold text-gray-900 dark:text-white">
                            {user.followingCount || 0}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">
                            Following
                        </span>
                    </div>
                </div>

                {/* Follow Button */}
                {!isOwnProfile && (
                    <button
                        onClick={handleFollowToggle}
                        className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${isFollowing
                            ? 'bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-dark-600'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {isFollowing ? (
                            <>
                                <UserCheck className="w-4 h-4" />
                                <span>Following</span>
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" />
                                <span>Follow</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
