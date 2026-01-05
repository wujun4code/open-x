'use client';

import { useState } from 'react';
import { Flag, User, MessageSquare, Calendar, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import ReviewReportDialog from './ReviewReportDialog';
import { useTranslations } from 'next-intl';

interface ReportCardProps {
    report: any;
    onActionComplete: () => void;
}

export default function ReportCard({ report, onActionComplete }: ReportCardProps) {
    const t = useTranslations('Moderation.reportCard');
    const [showReviewDialog, setShowReviewDialog] = useState(false);

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-200', icon: AlertTriangle },
            reviewed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200', icon: CheckCircle },
            actioned: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200', icon: CheckCircle },
            dismissed: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-200', icon: XCircle },
        };

        const badge = badges[status as keyof typeof badges] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
                <Icon className="w-4 h-4" />
                {t(`status.${status}`)}
            </span>
        );
    };

    const getReasonBadge = (reason: string) => {
        const colors = {
            SPAM: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
            HARASSMENT: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
            HATE_SPEECH: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
            VIOLENCE: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
            NUDITY: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200',
            MISINFORMATION: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
            OTHER: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
        };

        return colors[reason as keyof typeof colors] || colors.OTHER;
    };

    const formatDate = (dateString: string | number) => {
        if (!dateString) return 'Unknown';

        // Convert numeric strings to numbers (e.g., "1767569506302" -> 1767569506302)
        let timestamp: number;
        if (typeof dateString === 'string') {
            // Check if it's a numeric string
            const parsed = Number(dateString);
            if (!isNaN(parsed) && dateString.trim() !== '') {
                timestamp = parsed;
            } else {
                // Try parsing as ISO date string
                const date = new Date(dateString);
                if (isNaN(date.getTime())) {
                    return 'Unknown';
                }
                timestamp = date.getTime();
            }
        } else {
            timestamp = dateString;
        }

        const date = new Date(timestamp);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Unknown';
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

    const reportedContent = report.post || report.comment;
    const contentType = report.post ? t('post') : t('comment');

    return (
        <>
            <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 p-6 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Flag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{t('reportNumber')} #{report.id.slice(-8)}</span>
                                {getStatusBadge(report.status)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="w-4 h-4" />
                                {formatDate(report.createdAt)}
                            </div>
                        </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getReasonBadge(report.reason)}`}>
                        {t(`reason.${report.reason}`)}
                    </span>
                </div>

                {/* Reporter Info */}
                <div className="flex items-center gap-2 mb-4 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">{t('reportedBy')}</span>
                    <span className="font-medium">@{report.reporter.username}</span>
                    {report.reporter.name && (
                        <span className="text-gray-500">({report.reporter.name})</span>
                    )}
                </div>

                {/* Report Description */}
                {report.description && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{report.description}</p>
                    </div>
                )}

                {/* Reported Content */}
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800 dark:text-red-200">
                            {t('reportedContent', { type: contentType })}
                        </span>
                        {reportedContent?.user && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {t('by')} @{reportedContent.user.username}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {reportedContent?.content}
                    </p>
                    {report.post?.imageUrl && (
                        <img
                            src={report.post.imageUrl}
                            alt="Reported content"
                            className="mt-2 rounded-lg max-h-40 object-cover"
                        />
                    )}
                </div>

                {/* Reviewed Info */}
                {report.reviewedBy && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                {t('reviewedBy')} @{report.reviewedBy.username}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(report.reviewedAt)}
                            </span>
                        </div>
                        {report.action && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {t('action')} <span className="font-medium">{t(`actionType.${report.action}`)}</span>
                            </p>
                        )}
                        {report.moderatorNotes && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {t('notes')}: {report.moderatorNotes}
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                {report.status === 'pending' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowReviewDialog(true)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            {t('reviewAction')}
                        </button>
                    </div>
                )}
            </div>

            {showReviewDialog && (
                <ReviewReportDialog
                    report={report}
                    onClose={() => setShowReviewDialog(false)}
                    onComplete={() => {
                        setShowReviewDialog(false);
                        onActionComplete();
                    }}
                />
            )}
        </>
    );
}
