'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, gql } from '@apollo/client';
import { X, Flag } from 'lucide-react';

const REPORT_POST = gql`
  mutation ReportPost($postId: ID!, $reason: String!, $description: String) {
    reportPost(postId: $postId, reason: $reason, description: $description) {
      id
      status
    }
  }
`;

const REPORT_COMMENT = gql`
  mutation ReportComment($commentId: ID!, $reason: String!, $description: String) {
    reportComment(commentId: $commentId, reason: $reason, description: $description) {
      id
      status
    }
  }
`;

interface ReportDialogProps {
    postId?: string;
    commentId?: string;
    onClose: () => void;
}

export default function ReportDialog({ postId, commentId, onClose }: ReportDialogProps) {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');

    const [reportPost, { loading: reportingPost }] = useMutation(REPORT_POST);
    const [reportComment, { loading: reportingComment }] = useMutation(REPORT_COMMENT);

    const loading = reportingPost || reportingComment;

    const reasons = [
        { value: 'SPAM', label: 'Spam' },
        { value: 'HARASSMENT', label: 'Harassment' },
        { value: 'HATE_SPEECH', label: 'Hate Speech' },
        { value: 'VIOLENCE', label: 'Violence or Threats' },
        { value: 'NUDITY', label: 'Nudity or Sexual Content' },
        { value: 'MISINFORMATION', label: 'Misinformation' },
        { value: 'OTHER', label: 'Other' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason) {
            alert('Please select a reason');
            return;
        }

        try {
            if (postId) {
                await reportPost({
                    variables: { postId, reason, description: description || undefined }
                });
            } else if (commentId) {
                await reportComment({
                    variables: { commentId, reason, description: description || undefined }
                });
            }

            alert('Report submitted successfully. Our moderation team will review it shortly.');
            onClose();
        } catch (err: any) {
            console.error('Error reporting:', err);
            alert(err.message || 'Failed to submit report. Please try again.');
        }
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const modalContent = (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 isolate"
            onClick={onClose}
            style={{ transform: 'translateZ(0)' }}
        >
            <div
                className="bg-white dark:bg-dark-900 rounded-2xl p-6 max-w-md w-full shadow-2xl relative z-[10000] max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                style={{ transform: 'translateZ(0)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Flag className="w-5 h-5 text-red-600" />
                        Report {postId ? 'Post' : 'Comment'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Reason selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                            Reason <span className="text-red-600">*</span>
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            required
                        >
                            <option value="">Select a reason</option>
                            {reasons.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            Additional details (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide more context about why you're reporting this..."
                            className="w-full p-3 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            rows={4}
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
                    </div>

                    {/* Info message */}
                    <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            Your report will be reviewed by our moderation team. We take all reports seriously and will take appropriate action.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!reason || loading}
                            className="px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
