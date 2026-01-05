'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import PostCard from '@/components/PostCard';
import { Link } from '@/navigation';
import { GET_USER_BY_USERNAME, FOLLOW_USER_MUTATION, UNFOLLOW_USER_MUTATION } from '@/lib/queries';

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

const ME_ID_QUERY = gql`
  query MeId {
    me {
      id
    }
  }
`;

export default function UserProfilePage() {
    const router = useRouter();
    const params = useParams();
    const username = params.username as string;

    const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USER_BY_USERNAME, {
        variables: { username },
    });

    const { data: meData } = useQuery(ME_ID_QUERY);

    const user = userData?.userByUsername;
    const userId = user?.id;
    const isMe = meData?.me?.id === userId;
    const isFollowing = user?.isFollowing;

    const { data: postsData, loading: postsLoading, refetch: refetchPosts } = useQuery(USER_POSTS_QUERY, {
        variables: {
            userId,
            limit: 50,
            offset: 0
        },
        skip: !userId,
    });

    const [followUser] = useMutation(FOLLOW_USER_MUTATION);
    const [unfollowUser] = useMutation(UNFOLLOW_USER_MUTATION);

    const handleFollow = async () => {
        if (!userId) return;
        try {
            await followUser({
                variables: { userId },
                refetchQueries: [{ query: GET_USER_BY_USERNAME, variables: { username } }]
            });
        } catch (err) {
            console.error('Error following user:', err);
        }
    };

    const handleUnfollow = async () => {
        if (!userId) return;
        try {
            await unfollowUser({
                variables: { userId },
                refetchQueries: [{ query: GET_USER_BY_USERNAME, variables: { username } }]
            });
        } catch (err) {
            console.error('Error unfollowing user:', err);
        }
    };

    if (userLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-dark-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (userError || !userData?.userByUsername) {
        return (
            <div className="min-h-screen bg-white dark:bg-dark-950 flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">User not found</h1>
                <p className="text-gray-500 mb-6">The account you're looking for doesn't exist.</p>
                <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold">
                    Go Home
                </Link>
            </div>
        );
    }

    const currentUser = userData.userByUsername;
    const joinDate = new Date(parseInt(currentUser.createdAt)).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <main className="min-h-screen bg-white dark:bg-dark-950">
            {/* Header / Nav */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border-b border-gray-100 dark:border-dark-800">
                <div className="max-w-2xl mx-auto px-4 py-2 flex items-center space-x-8">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold">{currentUser.name || currentUser.username}</h2>
                        <p className="text-sm text-gray-500">{currentUser.postsCount} posts</p>
                    </div>
                </div>
            </div>

            {/* Profile Info */}
            <div className="relative max-w-2xl mx-auto">
                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                    {currentUser.coverImage && (
                        <img
                            src={currentUser.coverImage}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                <div className="px-4 pb-4">
                    <div className="flex justify-between items-end -mt-16 mb-4">
                        <div className="relative">
                            <div className="w-32 h-32 bg-gray-300 dark:bg-dark-700 rounded-full border-4 border-white dark:border-950 overflow-hidden">
                                {currentUser.avatar ? (
                                    <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-4xl font-bold">
                                        {currentUser.username[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {isMe ? (
                            <Link href="/profile" className="px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-full font-bold hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors">
                                Edit profile
                            </Link>
                        ) : (
                            <button
                                onClick={isFollowing ? handleUnfollow : handleFollow}
                                className={`px-4 py-2 rounded-full font-bold transition-colors ${isFollowing
                                    ? 'border border-gray-300 dark:border-dark-700 hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 after:content-["Following"] hover:after:content-["Unfollow"]'
                                    : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                                    }`}
                            >
                                {!isFollowing && "Follow"}
                            </button>
                        )}
                    </div>

                    <div className="mb-4">
                        <h1 className="text-2xl font-bold">{currentUser.name || currentUser.username}</h1>
                        <p className="text-gray-500">@{currentUser.username}</p>
                    </div>

                    {currentUser.bio && <p className="text-gray-900 dark:text-gray-100 mb-4 whitespace-pre-wrap">{currentUser.bio}</p>}

                    <div className="flex flex-wrap text-gray-500 gap-x-4 gap-y-2 mb-4">
                        <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {joinDate}</span>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <Link href={`/profile/${username}/following`} className="hover:underline">
                            <span className="font-bold text-black dark:text-white">{currentUser.followingCount}</span>
                            <span className="text-gray-500 ml-1">Following</span>
                        </Link>
                        <Link href={`/profile/${username}/followers`} className="hover:underline">
                            <span className="font-bold text-black dark:text-white">{currentUser.followersCount}</span>
                            <span className="text-gray-500 ml-1">Followers</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100 dark:border-dark-800 max-w-2xl mx-auto">
                <div className="flex">
                    <button className="flex-1 py-4 font-bold border-b-4 border-blue-500 text-black dark:text-white">Posts</button>
                    <button className="flex-1 py-4 font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">Replies</button>
                    <button className="flex-1 py-4 font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">Highlights</button>
                    <button className="flex-1 py-4 font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">Media</button>
                    <button className="flex-1 py-4 font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">Likes</button>
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
                        <p className="text-gray-500">No posts yet.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
