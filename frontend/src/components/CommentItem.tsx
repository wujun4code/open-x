'use client';

import { useMutation } from '@apollo/client';
import { Trash2, Flag } from 'lucide-react';
import { DELETE_COMMENT_MUTATION, GET_POST_COMMENTS } from '@/lib/queries';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import ReportDialog from './ReportDialog';

interface CommentItemProps {
    comment: {
        id: string;
        content: string;
        createdAt: string;
        user: {
            id: string;
            name?: string;
            username: string;
            avatar?: string;
        };
    };
    postId: string;
    onDelete?: () => void;
}

export default function CommentItem({ comment, postId, onDelete }: CommentItemProps) {
    const t = useTranslations('Comments');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [showReportDialog, setShowReportDialog] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUserId(user.id);
        }
    }, []);

    const [deleteComment] = useMutation(DELETE_COMMENT_MUTATION, {
        update(cache) {
            try {
                const existingComments: any = cache.readQuery({
                    query: GET_POST_COMMENTS,
                    variables: { postId },
                });

                if (existingComments && existingComments.post) {
                    cache.writeQuery({
                        query: GET_POST_COMMENTS,
                        variables: { postId },
                        data: {
                            post: {
                                ...existingComments.post,
                                comments: existingComments.post.comments.filter(
                                    (c: any) => c.id !== comment.id
                                ),
                                commentsCount: Math.max(0, existingComments.post.commentsCount - 1),
                            },
                        },
                    });
                }
            } catch (error) {
                console.error('Error updating cache after delete:', error);
            }
        },
        onCompleted: () => {
            if (onDelete) {
                onDelete();
            }
        },
    });

    const isOwnComment = currentUserId === comment.user.id;

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(parseInt(timestamp));
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleDelete = async () => {
        // Use the translated confirmation message
        const confirmMessage = t('deleteConfirm');

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            await deleteComment({
                variables: { id: comment.id },
                optimisticResponse: {
                    deleteComment: true
                }
            });
        } catch (error: any) {
            console.error('Error deleting comment:', error);
            alert(t('deleteError') + ': ' + (error.message || 'Unknown error'));
        }
    };

    return (
        <div className="flex space-x-3 py-4 border-b border-gray-100 dark:border-dark-700 last:border-0 group">
            <Link href={`/profile`} className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm hover:shadow-md transition-shadow">
                    {comment.user.avatar ? (
                        <img src={comment.user.avatar} alt={comment.user.name || comment.user.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        comment.user.name?.[0] || comment.user.username[0]
                    )}
                </div>
            </Link>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 flex-wrap">
                        <Link href={`/profile`} className="font-semibold text-gray-900 dark:text-white hover:underline truncate max-w-[150px]">
                            {comment.user.name || comment.user.username}
                        </Link>
                        <span className="text-gray-500 dark:text-gray-400 text-sm truncate max-w-[100px]">@{comment.user.username}</span>
                        <span className="text-gray-400 dark:text-gray-500">·</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">{formatTimestamp(comment.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        {!isOwnComment && (
                            <button
                                onClick={() => setShowReportDialog(true)}
                                className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Report comment"
                            >
                                <Flag className="w-4 h-4" />
                            </button>
                        )}
                        {isOwnComment && (
                            <button
                                onClick={handleDelete}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title={t('delete')}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-wrap break-words">
                    {comment.content}
                </p>
            </div>

            {showReportDialog && (
                <ReportDialog
                    commentId={comment.id}
                    onClose={() => setShowReportDialog(false)}
                />
            )}
        </div>
    );
}
