'use client';

import { useQuery, gql } from '@apollo/client';
import PostCard from './PostCard';
import { Loader2 } from 'lucide-react';

const POSTS_QUERY = gql`
  query GetPosts($limit: Int, $offset: Int) {
    posts(limit: $limit, offset: $offset) {
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

interface PostFeedProps {
    limit?: number;
    userId?: string;
}

export default function PostFeed({ limit = 20 }: PostFeedProps) {
    const { data, loading, error, refetch } = useQuery(POSTS_QUERY, {
        variables: { limit, offset: 0 },
        fetchPolicy: 'network-only',
    });

    if (loading) {
        return (
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-700 p-12 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-300 font-medium">Loading posts...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-700 p-12 text-center">
                <p className="text-red-600 dark:text-red-400 font-medium mb-2">Error loading posts</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{error.message}</p>
                <button
                    onClick={() => refetch()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const posts = data?.posts || [];

    if (posts.length === 0) {
        return (
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-700 p-12 text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No posts yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Be the first to share something!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post: any) => (
                <PostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={() => refetch()}
                />
            ))}
        </div>
    );
}
