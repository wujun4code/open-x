'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { FOLLOW_USER_MUTATION, UNFOLLOW_USER_MUTATION } from '@/lib/queries';
import { useTranslations } from 'next-intl';

interface FollowButtonProps {
    userId: string;
    initialIsFollowing: boolean;
    onFollowChange?: (isFollowing: boolean) => void;
    size?: 'sm' | 'md' | 'lg';
}

export default function FollowButton({
    userId,
    initialIsFollowing,
    onFollowChange,
    size = 'md'
}: FollowButtonProps) {
    const t = useTranslations('Follow');
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isHovered, setIsHovered] = useState(false);

    const [followUser, { loading: followLoading }] = useMutation(FOLLOW_USER_MUTATION, {
        variables: { userId },
        onCompleted: () => {
            setIsFollowing(true);
            onFollowChange?.(true);
        },
        onError: (error) => {
            console.error('Error following user:', error);
            alert(t('followError'));
        },
    });

    const [unfollowUser, { loading: unfollowLoading }] = useMutation(UNFOLLOW_USER_MUTATION, {
        variables: { userId },
        onCompleted: () => {
            setIsFollowing(false);
            onFollowChange?.(false);
        },
        onError: (error) => {
            console.error('Error unfollowing user:', error);
            alert(t('unfollowError'));
        },
    });

    const loading = followLoading || unfollowLoading;

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading) return;

        if (isFollowing) {
            await unfollowUser();
        } else {
            await followUser();
        }
    };

    const sizeClasses = {
        sm: 'px-3 py-1 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-2.5 text-base',
    };

    const buttonText = isFollowing
        ? (isHovered ? t('unfollow') : t('following'))
        : t('follow');

    const buttonClasses = isFollowing
        ? 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg';

    return (
        <button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={loading}
            className={`${sizeClasses[size]} ${buttonClasses} rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {loading ? t('loading') : buttonText}
        </button>
    );
}
