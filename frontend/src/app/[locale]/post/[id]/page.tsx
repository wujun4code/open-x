'use client';

import { useQuery, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import { useRouter } from '@/navigation';
import Post from '@/components/Post';
import CommentSection from '@/components/CommentSection';
import { ArrowLeft } from 'lucide-react';

const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      content
      imageUrl
      createdAt
      user {
        id
        username
        name
        avatar
      }
      likesCount
      commentsCount
      isLiked
      isBookmarked
    }
  }
`;

export default function PostPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params.id as string;

    const { data, loading, error } = useQuery(GET_POST, {
        variables: { id: postId },
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-700 p-8">
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data?.post) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-700 p-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Post not found</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            This post may have been deleted or doesn&apos;t exist.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to home</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>


                {/* Post */}
                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-700 overflow-hidden mb-6">
                    <Post
                        post={data.post}
                        disableInlineComments={true}
                        onPostDeleted={() => router.push('/')}
                    />
                </div>

                {/* Comments Section */}
                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-700 overflow-hidden">
                    <CommentSection postId={postId} />
                </div>
            </div>
        </div>
    );
}
