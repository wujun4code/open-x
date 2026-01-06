'use client';

import { useQuery } from '@apollo/client';
import { GET_POST_COMMENTS } from '@/lib/queries';
import CommentItem from './CommentItem';
import { useTranslations } from 'next-intl';
import { MessageSquareOff } from 'lucide-react';

interface CommentListProps {
    postId: string;
    onCommentDeleted?: () => void;
}

export default function CommentList({ postId, onCommentDeleted }: CommentListProps) {
    const t = useTranslations('Comments');
    const { data, loading, error } = useQuery(GET_POST_COMMENTS, {
        variables: { postId },
        fetchPolicy: 'cache-and-network', // Fetch from network while showing cached data
    });

    if (loading) {
        return (
            <div className="space-y-4 py-4 animate-pulse">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex space-x-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-dark-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-4 text-center text-red-500 text-sm">
                Error loading comments: {error.message}
            </div>
        );
    }

    const comments = data?.post?.comments || [];

    if (comments.length === 0) {
        return (
            <div className="py-8 text-center bg-gray-50/50 dark:bg-dark-900/50 rounded-xl mt-2 border border-dashed border-gray-200 dark:border-dark-700">
                <MessageSquareOff className="w-8 h-8 mx-auto text-gray-400 mb-2 opacity-50" />
                <h4 className="text-gray-700 dark:text-gray-300 font-medium">{t('noComments')}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('beFirst')}</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100 dark:divide-dark-700">
            {comments.map((comment: any) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    postId={postId}
                    onDelete={onCommentDeleted}
                />
            ))}
        </div>
    );
}
