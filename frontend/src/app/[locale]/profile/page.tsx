'use client';

import { useQuery, gql } from '@apollo/client';
import { User, Mail, Calendar } from 'lucide-react';
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
      coverImage
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
        <main className="min-h-screen bg-white dark:bg-dark-950">
            {/* Header / Nav */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border-b border-gray-100 dark:border-dark-800">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center space-x-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name || user.username}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.postsCount} posts</p>
                    </div>
                </div>
            </div>

            {/* Profile Info */}
            <div className="relative max-w-2xl mx-auto">
                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                    {user.coverImage && (
                        <img
                            src={user.coverImage}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                <div className="px-4 pb-4">
                    <div className="flex justify-between items-end -mt-16 mb-4">
                        <div className="relative">
                            <div className="w-32 h-32 bg-gray-300 dark:bg-dark-700 rounded-full border-4 border-white dark:border-dark-950 overflow-hidden">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl font-bold">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button className="px-6 py-2 border border-gray-300 dark:border-dark-700 rounded-full font-bold hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors text-gray-900 dark:text-white">
                            Edit profile
                        </button>
                    </div>

                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name || user.username}</h1>
                        <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
                    </div>

                    {user.bio ? (
                        <p className="text-gray-900 dark:text-gray-100 mb-4 whitespace-pre-wrap">{user.bio}</p>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 mb-4 italic">No bio yet. Click Edit profile to add one!</p>
                    )}

                    <div className="flex flex-wrap text-gray-500 dark:text-gray-400 gap-x-4 gap-y-2 mb-4">
                        <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Joined {joinDate}</span>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <Link href="/following" className="hover:underline">
                            <span className="font-bold text-gray-900 dark:text-white">{user.followingCount}</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">Following</span>
                        </Link>
                        <Link href="/followers" className="hover:underline">
                            <span className="font-bold text-gray-900 dark:text-white">{user.followersCount}</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">Followers</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100 dark:border-dark-800 max-w-2xl mx-auto">
                <div className="flex">
                    <button className="flex-1 py-4 font-bold border-b-4 border-blue-500 text-gray-900 dark:text-white">Posts</button>
                    <button className="flex-1 py-4 font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">Replies</button>
                    <button className="flex-1 py-4 font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">Highlights</button>
                    <button className="flex-1 py-4 font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">Media</button>
                    <button className="flex-1 py-4 font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">Likes</button>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="pb-20 max-w-2xl mx-auto">
                {postsLoading ? (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse flex space-x-4">
                                <div className="rounded-full bg-gray-200 dark:bg-dark-800 h-10 w-10"></div>
                                <div className="flex-1 space-y-4 py-1">
                                    <div className="h-4 bg-gray-200 dark:bg-dark-800 rounded w-3/4"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-dark-800 rounded"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-dark-800 rounded w-5/6"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : postsData?.userPosts?.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-dark-800">
                        {postsData.userPosts.map((post: any) => (
                            <PostCard key={post.id} post={post} onPostDeleted={() => refetchPosts()} />
                        ))}
                    </div>
                ) : (
                    <div className="p-10 text-center">
                        <div className="text-gray-400 dark:text-gray-500 mb-4">
                            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No posts yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">Start sharing your thoughts with the world!</p>
                    </div>
                )}
            </div>
        </main>
    );
}
