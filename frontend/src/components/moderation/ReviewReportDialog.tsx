'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REVIEW_REPORT, DISMISS_REPORT } from '@/lib/queries';
import { X, AlertTriangle, Ban, Trash2, AlertCircle, XCircle } from 'lucide-react';

interface ReviewReportDialogProps {
    report: any;
    onClose: () => void;
    onComplete: () => void;
}

export default function ReviewReportDialog({ report, onClose, onComplete }: ReviewReportDialogProps) {
    const [action, setAction] = useState('');
    const [moderatorNotes, setModeratorNotes] = useState('');
    const [duration, setDuration] = useState('');

    const [reviewReport, { loading: reviewing }] = useMutation(REVIEW_REPORT);
    const [dismissReport, { loading: dismissing }] = useMutation(DISMISS_REPORT);

    const loading = reviewing || dismissing;

    const actions = [
        { value: 'warning', label: 'Warning', icon: AlertTriangle, description: 'Send a warning to the user' },
        { value: 'content_removal', label: 'Remove Content', icon: Trash2, description: 'Delete the reported content' },
        { value: 'temporary_suspension', label: 'Temporary Suspension', icon: Ban, description: 'Suspend user for a period of time', requiresDuration: true },
        { value: 'permanent_ban', label: 'Permanent Ban', icon: XCircle, description: 'Permanently ban the user' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!action) {
            alert('Please select an action');
            return;
        }

        if (action === 'temporary_suspension' && !duration) {
            alert('Please specify duration for temporary suspension');
            return;
        }

        try {
            await reviewReport({
                variables: {
                    reportId: report.id,
                    action,
                    moderatorNotes: moderatorNotes || undefined,
                    duration: duration ? parseInt(duration) : undefined,
                },
            });

            alert('Report reviewed successfully');
            onComplete();
        } catch (err: any) {
            console.error('Error reviewing report:', err);
            alert(err.message || 'Failed to review report');
        }
    };

    const handleDismiss = async () => {
        if (!confirm('Are you sure you want to dismiss this report?')) {
            return;
        }

        try {
            await dismissReport({
                variables: {
                    reportId: report.id,
                    moderatorNotes: moderatorNotes || undefined,
                },
            });

            alert('Report dismissed');
            onComplete();
        } catch (err: any) {
            console.error('Error dismissing report:', err);
            alert(err.message || 'Failed to dismiss report');
        }
    };

    const reportedContent = report.post || report.comment;
    const contentType = report.post ? 'Post' : 'Comment';

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-dark-900 rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                        Review Report
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Report Info */}
                <div className="mb-6 space-y-3">
                    <div className="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reported by</p>
                        <p className="font-medium">@{report.reporter.username}</p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reason</p>
                        <p className="font-medium">{report.reason.replace('_', ' ')}</p>
                    </div>

                    {report.description && (
                        <div className="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Description</p>
                            <p className="text-gray-700 dark:text-gray-300">{report.description}</p>
                        </div>
                    )}
                </div>

                {/* Reported Content */}
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                        Reported {contentType} by @{reportedContent?.user?.username}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {reportedContent?.content}
                    </p>
                    {report.post?.imageUrl && (
                        <img
                            src={report.post.imageUrl}
                            alt="Reported content"
                            className="mt-3 rounded-lg max-h-60 object-cover"
                        />
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Action Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-3">
                            Select Action <span className="text-red-600">*</span>
                        </label>
                        <div className="space-y-2">
                            {actions.map((actionOption) => {
                                const Icon = actionOption.icon;
                                return (
                                    <label
                                        key={actionOption.value}
                                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${action === actionOption.value
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="action"
                                            value={actionOption.value}
                                            checked={action === actionOption.value}
                                            onChange={(e) => setAction(e.target.value)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 font-medium mb-1">
                                                <Icon className="w-5 h-5" />
                                                {actionOption.label}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {actionOption.description}
                                            </p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Duration (for temporary suspension) */}
                    {action === 'temporary_suspension' && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">
                                Suspension Duration (days) <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="e.g., 7"
                                min="1"
                                max="365"
                                className="w-full p-3 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                required
                            />
                        </div>
                    )}

                    {/* Moderator Notes */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            Moderator Notes (optional)
                        </label>
                        <textarea
                            value={moderatorNotes}
                            onChange={(e) => setModeratorNotes(e.target.value)}
                            placeholder="Add any notes about this decision..."
                            className="w-full p-3 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            rows={4}
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">{moderatorNotes.length}/500</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleDismiss}
                            disabled={loading}
                            className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-dark-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors disabled:opacity-50"
                        >
                            {dismissing ? 'Dismissing...' : 'Dismiss Report'}
                        </button>
                        <button
                            type="submit"
                            disabled={!action || loading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {reviewing ? 'Submitting...' : 'Submit Action'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
