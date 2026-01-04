'use client';

import { useQuery, gql } from '@apollo/client';
import { User, Mail, Calendar, Link as LinkIcon, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PostCard from '@/components/PostCard';
import { Link } from '@/navigation';

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      name
      email
      bio
      avatar
      createdAt
      followersCount
      followingCount
      postsCount
    }
  }
`;

const USER_POSTS_QUERY = gql`
  query UserPosts($userId: ID!, $limit: Int, $offset: Int) {
    userPosts(userId: $userId, limit: $limit, offset: $offset) {
      id
      content
      imageUrl
      createdAt
      user {
        id
        name
        username
        avatar
      }
      likesCount
      commentsCount
      isLiked
    }
  }
`;

export default function ProfilePage() {
    const router = useRouter();
    const { data, loading, error } = useQuery(ME_QUERY);

    // Fetch user posts once we have the user ID
    const { data: postsData, loading: postsLoading, refetch: refetchPosts } = useQuery(USER_POSTS_QUERY, {
        variables: {
            userId: data?.me?.id,
            limit: 50,
            offset: 0
        },
        skip: !data?.me?.id, // Skip query until we have user ID
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !data?.me) {
        router.push('/auth');
        return null;
    }

    const user = data.me;
    const joinDate = new Date(parseInt(user.createdAt)).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Profile Header Card */}
                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-700 overflow-hidden mb-6">
                    {/* Cover Image */}
                    <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
                        <button className="absolute top-4 right-4 px-4 py-2 bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors font-medium shadow-md flex items-center space-x-2">
                            <Edit className="w-4 h-4" />
                            <span>Edit Cover</span>
                        </button>
                    </div>

                    {/* Profile Info */}
                    <div className="px-6 pb-6">
                        {/* Avatar */}
                        <div className="flex justify-between items-start -mt-16 mb-4">
                            <div className="relative">
                                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-4 border-white dark:border-dark-800 flex items-center justify-center shadow-xl">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name || user.username} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User className="w-16 h-16 text-white" />
                                    )}
                                </div>
                                <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg">
                                    <Edit className="w-5 h-5" />
                                </button>
                            </div>
                            <button className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-md hover:shadow-lg flex items-center space-x-2">
                                <Edit className="w-4 h-4" />
                                <span>Edit Profile</span>
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{user.name || user.username}</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">@{user.username}</p>
                        </div>

                        {/* Bio */}
                        {user.bio ? (
                            <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">{user.bio}</p>
                        ) : (
                            <p className="text-gray-400 dark:text-gray-500 italic mb-6">No bio yet. Click Edit Profile to add one!</p>
                        )}

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-300 mb-6">
                            <div className="flex items-center space-x-2">
                                <Mail className="w-5 h-5" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5" />
                                <span>Joined {joinDate}</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center space-x-8 py-4 border-t border-gray-100 dark:border-dark-700">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.postsCount}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
                            </div>
                            <Link href="/followers" className="text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 px-4 py-2 rounded-lg transition-colors">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.followersCount}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                            </Link>
                            <Link href="/following" className="text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 px-4 py-2 rounded-lg transition-colors">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.followingCount}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-700 mb-6">
                    <div className="flex border-b border-gray-200 dark:border-dark-700">
                        <button className="flex-1 px-6 py-4 text-blue-600 dark:text-blue-400 font-medium border-b-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            Posts
                        </button>
                        <button className="flex-1 px-6 py-4 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                            Replies
                        </button>
                        <button className="flex-1 px-6 py-4 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                            Media
                        </button>
                        <button className="flex-1 px-6 py-4 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                            Likes
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-6">
                        {postsLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-gray-50 dark:bg-dark-700 rounded-xl p-6 animate-pulse">
                                        <div className="flex space-x-4">
                                            <div className="w-12 h-12 bg-gray-200 dark:bg-dark-600 rounded-full"></div>
                                            <div className="flex-1 space-y-3">
                                                <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-1/4"></div>
                                                <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-3/4"></div>
                                                <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : postsData?.userPosts?.length > 0 ? (
                            <div className="space-y-4">
                                {postsData.userPosts.map((post: any) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onPostDeleted={() => refetchPosts()}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-400 dark:text-gray-500 mb-4">
                                    <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No posts yet</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">Start sharing your thoughts with the world!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
