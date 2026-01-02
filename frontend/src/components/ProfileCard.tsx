'use client';

import { useQuery, gql } from '@apollo/client';
import { User, Calendar } from 'lucide-react';
import Link from 'next/link';

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
    const { data, loading, error } = useQuery(ME_QUERY);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="animate-pulse">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
            {/* Compact Header with gradient */}
            <div className="h-16 bg-gradient-to-r from-blue-500 to-purple-600"></div>

            {/* Profile Content */}
            <div className="px-4 pb-4">
                {/* Avatar */}
                <div className="flex justify-center -mt-8 mb-3">
                    <Link href="/profile">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-4 border-white flex items-center justify-center shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
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
                        <h2 className="text-lg font-bold text-gray-900">{user.name || user.username}</h2>
                    </Link>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                </div>

                {/* Join Date */}
                <div className="flex items-center justify-center text-xs text-gray-500 mb-3">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Joined {joinDate}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-around py-3 border-t border-gray-100">
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{user.postsCount}</div>
                        <div className="text-xs text-gray-500">Posts</div>
                    </div>
                    <div className="text-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                        <div className="text-lg font-bold text-gray-900">{user.followersCount}</div>
                        <div className="text-xs text-gray-500">Followers</div>
                    </div>
                    <div className="text-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                        <div className="text-lg font-bold text-gray-900">{user.followingCount}</div>
                        <div className="text-xs text-gray-500">Following</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
