'use client';

import { useQuery, gql } from '@apollo/client';
import { User, Mail, Calendar } from 'lucide-react';
import { useRouter } from '@/navigation';
import PostCard from '@/components/PostCard';
import { Link } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';

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
    const t = useTranslations('Profile');
    const locale = useLocale();
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
    const joinDate = new Date(parseInt(user.createdAt)).toLocaleDateString(locale === 'zh-cn' ? 'zh-CN' : locale === 'es' ? 'es-ES' : 'en-US', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
            {/* Header / Nav */}
            <div className="sticky top-20 z-10 bg-white/85 dark:bg-dark-900/85 backdrop-blur-xl border-b border-gray-200/50 dark:border-dark-700/50 shadow-sm">
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center space-x-4">
                    <div>
                        <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">{user.name || user.username}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.postsCount} {t('posts')}</p>
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

                <div className="px-6 pb-6">
                    <div className="flex justify-between items-end -mt-16 mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-purple-600 rounded-full blur-md opacity-40 w-32 h-32"></div>
                            <div className="relative w-32 h-32 bg-gray-300 dark:bg-dark-700 rounded-full border-4 border-white dark:border-dark-900 overflow-hidden shadow-lg">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-600 to-purple-600 text-white text-4xl font-bold">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Link href="/profile/edit" className="px-6 py-2.5 border-2 border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-400 rounded-full font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 hover-lift">
                            {t('editProfile')}
                        </Link>
                    </div>

                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name || user.username}</h1>
                        <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
                    </div>

                    {user.bio ? (
                        <p className="text-gray-900 dark:text-gray-100 mb-4 whitespace-pre-wrap">{user.bio}</p>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 mb-4 italic">{t('noBio')}</p>
                    )}

                    <div className="flex flex-wrap text-gray-500 dark:text-gray-400 gap-x-4 gap-y-2 mb-4">
                        <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{t('joined')} {joinDate}</span>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <Link href="/following" className="hover:underline">
                            <span className="font-bold text-gray-900 dark:text-white">{user.followingCount}</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">{t('following')}</span>
                        </Link>
                        <Link href="/followers" className="hover:underline">
                            <span className="font-bold text-gray-900 dark:text-white">{user.followersCount}</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">{t('followers')}</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100 dark:border-dark-800 max-w-2xl mx-auto">
                <div className="flex">
                    <button className="flex-1 py-4 font-bold border-b-4 border-blue-500 text-gray-900 dark:text-white">{t('tabPosts')}</button>
                    <button className="flex-1 py-4 font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">{t('tabReplies')}</button>
                    <button className="flex-1 py-4 font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">{t('tabHighlights')}</button>
                    <button className="flex-1 py-4 font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">{t('tabMedia')}</button>
                    <button className="flex-1 py-4 font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">{t('tabLikes')}</button>
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
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('noPosts')}</h3>
                        <p className="text-gray-500 dark:text-gray-400">{t('startSharing')}</p>
                    </div>
                )}
            </div>
        </main>
    );
}
