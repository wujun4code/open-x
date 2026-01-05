'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Trash2, RotateCcw, MessageSquare, User, Calendar, AlertTriangle } from 'lucide-react';
import { PERMANENTLY_DELETE_POST, PERMANENTLY_DELETE_COMMENT, RESTORE_POST, RESTORE_COMMENT } from '@/lib/queries';
import { useTranslations } from 'next-intl';

interface DeletedContentCardProps {
    content: any;
    type: 'post' | 'comment';
    onActionComplete: () => void;
}

export default function DeletedContentCard({ content, type, onActionComplete }: DeletedContentCardProps) {
    const t = useTranslations('Moderation.deletedContentCard');
    const [showConfirmDialog, setShowConfirmDialog] = useState<'delete' | 'restore' | null>(null);

    const [permanentlyDeletePost] = useMutation(PERMANENTLY_DELETE_POST);
    const [permanentlyDeleteComment] = useMutation(PERMANENTLY_DELETE_COMMENT);
    const [restorePost] = useMutation(RESTORE_POST);
    const [restoreComment] = useMutation(RESTORE_COMMENT);

    const formatDate = (dateString: string | number) => {
        if (!dateString) return t('timeAgo.unknown');

        let timestamp: number;
        if (typeof dateString === 'string') {
            const parsed = Number(dateString);
            if (!isNaN(parsed) && dateString.trim() !== '') {
                timestamp = parsed;
            } else {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) {
                    return t('timeAgo.unknown');
                }
                timestamp = date.getTime();
            }
        } else {
            timestamp = dateString;
        }

        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            return t('timeAgo.unknown');
        }

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return t('timeAgo.justNow');
        if (diffMins < 60) return t('timeAgo.minutesAgo', { count: diffMins });
        if (diffHours < 24) return t('timeAgo.hoursAgo', { count: diffHours });
        if (diffDays < 7) return t('timeAgo.daysAgo', { count: diffDays });
        return date.toLocaleDateString();
    };

    const handlePermanentDelete = async () => {
        try {
            if (type === 'post') {
                await permanentlyDeletePost({ variables: { postId: content.id } });
            } else {
                await permanentlyDeleteComment({ variables: { commentId: content.id } });
            }
            alert(t('alerts.deleteSuccess'));
            setShowConfirmDialog(null);
            onActionComplete();
        } catch (error: any) {
            console.error('Error permanently deleting content:', error);
            alert(error.message || t('alerts.deleteError'));
        }
    };

    const handleRestore = async () => {
        try {
            if (type === 'post') {
                await restorePost({ variables: { postId: content.id } });
            } else {
                await restoreComment({ variables: { commentId: content.id } });
            }
            alert(t('alerts.restoreSuccess'));
            setShowConfirmDialog(null);
            onActionComplete();
        } catch (error: any) {
            console.error('Error restoring content:', error);
            alert(error.message || t('alerts.restoreError'));
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-dark-900 rounded-xl border border-red-200 dark:border-red-800 p-6 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                            {type === 'post' ? (
                                <MessageSquare className="w-5 h-5 text-white" />
                            ) : (
                                <MessageSquare className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{type === 'post' ? t('deletedPost') : t('deletedComment')}</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                                    {t('softDeleted')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="w-4 h-4" />
                                {t('deleted')} {formatDate(content.deletedAt)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Original Author Info */}
                <div className="flex items-center gap-2 mb-4 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">{t('originalAuthor')}</span>
                    <span className="font-medium">@{content.user.username}</span>
                    {content.user.name && (
                        <span className="text-gray-500">({content.user.name})</span>
                    )}
                </div>

                {/* Deleted By Info */}
                {content.deletedBy && (
                    <div className="flex items-center gap-2 mb-4 text-sm p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <User className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-600 dark:text-gray-400">{t('deletedByModerator')}</span>
                        <span className="font-medium text-orange-800 dark:text-orange-200">@{content.deletedBy.username}</span>
                    </div>
                )}

                {/* Content Preview */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-5">
                        {content.content}
                    </p>
                    {type === 'post' && content.imageUrl && (
                        <img
                            src={content.imageUrl}
                            alt="Deleted content"
                            className="mt-2 rounded-lg max-h-40 object-cover"
                        />
                    )}
                    {type === 'comment' && content.post && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-dark-700">
                            <span className="text-xs text-gray-500">{t('onPost')} </span>
                            <span className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                                {content.post.content}
                            </span>
                        </div>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{t('created')} {formatDate(content.createdAt)}</span>
                    {type === 'post' && (
                        <>
                            <span>•</span>
                            <span>{content.likesCount} {t('likes')}</span>
                            <span>•</span>
                            <span>{content.commentsCount} {t('comments')}</span>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowConfirmDialog('restore')}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        {t('restoreContent')}
                    </button>
                    <button
                        onClick={() => setShowConfirmDialog('delete')}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        {t('permanentlyDelete')}
                    </button>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowConfirmDialog(null)}
                >
                    <div
                        className="bg-white dark:bg-dark-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold mb-4">
                            {showConfirmDialog === 'delete' ? t('dialog.deleteTitle') : t('dialog.restoreTitle')}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {showConfirmDialog === 'delete'
                                ? t('dialog.deleteMessage')
                                : t('dialog.restoreMessage')}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmDialog(null)}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-dark-800 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-dark-700 transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={showConfirmDialog === 'delete' ? handlePermanentDelete : handleRestore}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${showConfirmDialog === 'delete'
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                {showConfirmDialog === 'delete' ? t('permanentlyDelete') : t('restore')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
