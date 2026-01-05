'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_REPORTS, GET_DELETED_POSTS, GET_DELETED_COMMENTS } from '@/lib/queries';
import { useRole } from '@/contexts/RoleContext';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import ReportCard from '@/components/moderation/ReportCard';
import DeletedContentCard from '@/components/moderation/DeletedContentCard';

export default function ModerationPage() {
    const { isModerator, loading: roleLoading } = useRole();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'reports' | 'deleted'>('reports');
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

    const { data, loading, error, refetch } = useQuery(GET_REPORTS, {
        variables: { status: statusFilter, limit: 50 },
        skip: !isModerator || activeTab !== 'reports',
    });

    const { data: deletedPostsData, loading: deletedPostsLoading, error: deletedPostsError, refetch: refetchDeletedPosts } = useQuery(GET_DELETED_POSTS, {
        variables: { limit: 50 },
        skip: !isModerator || activeTab !== 'deleted',
    });

    const { data: deletedCommentsData, loading: deletedCommentsLoading, error: deletedCommentsError, refetch: refetchDeletedComments } = useQuery(GET_DELETED_COMMENTS, {
        variables: { limit: 50 },
        skip: !isModerator || activeTab !== 'deleted',
    });

    // Redirect if not moderator using effect to avoid render issues
    useEffect(() => {
        if (!roleLoading && !isModerator) {
            router.push('/');
        }
    }, [roleLoading, isModerator, router]);

    // Show access denied while redirecting
    if (!roleLoading && !isModerator) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        You don't have permission to access this page.
                    </p>
                </div>
            </div>
        );
    }

    if (roleLoading || (activeTab === 'reports' && loading) || (activeTab === 'deleted' && (deletedPostsLoading || deletedCommentsLoading))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading moderation dashboard...</p>
                </div>
            </div>
        );
    }

    if ((activeTab === 'reports' && error) || (activeTab === 'deleted' && (deletedPostsError || deletedCommentsError))) {
        const currentError = activeTab === 'reports' ? error : (deletedPostsError || deletedCommentsError);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Error Loading Data</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{currentError?.message}</p>
                    <button
                        onClick={() => activeTab === 'reports' ? refetch() : (refetchDeletedPosts(), refetchDeletedComments())}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const reports = data?.reports || [];
    const pendingCount = reports.filter((r: any) => r.status === 'pending').length;

    const statusFilters = [
        { label: 'All', value: undefined, icon: Shield },
        { label: 'Pending', value: 'pending', icon: Clock, count: pendingCount },
        { label: 'Reviewed', value: 'all_reviewed', icon: CheckCircle },
        { label: 'Actioned', value: 'actioned', icon: CheckCircle },
        { label: 'Dismissed', value: 'dismissed', icon: XCircle },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
            {/* Header */}
            <div className="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-8 h-8 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Review and manage user reports and deleted content
                            </p>
                        </div>
                    </div>

                    {/* Main Tabs */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'reports'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700'
                                }`}
                        >
                            <Shield className="w-5 h-5" />
                            Reports
                        </button>
                        <button
                            onClick={() => setActiveTab('deleted')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'deleted'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700'
                                }`}
                        >
                            <Trash2 className="w-5 h-5" />
                            Deleted Content
                        </button>
                    </div>

                    {/* Filter Tabs (only for Reports tab) */}
                    {activeTab === 'reports' && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {statusFilters.map((filter) => {
                                const Icon = filter.icon;
                                const isActive = statusFilter === filter.value;

                                return (
                                    <button
                                        key={filter.label}
                                        onClick={() => setStatusFilter(filter.value)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${isActive
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {filter.label}
                                        {filter.count !== undefined && filter.count > 0 && (
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white text-blue-600' : 'bg-red-600 text-white'
                                                    }`}
                                            >
                                                {filter.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {activeTab === 'reports' ? (
                    reports.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">No Reports Found</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {statusFilter === 'all_reviewed'
                                    ? 'No reviewed reports at this time.'
                                    : statusFilter
                                        ? `No ${statusFilter} reports at this time.`
                                        : 'There are no reports to review.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report: any) => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    onActionComplete={() => refetch()}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    // Deleted Content Tab
                    (() => {
                        const deletedPosts = deletedPostsData?.deletedPosts || [];
                        const deletedComments = deletedCommentsData?.deletedComments || [];
                        const allDeleted = [
                            ...deletedPosts.map((p: any) => ({ ...p, type: 'post' })),
                            ...deletedComments.map((c: any) => ({ ...c, type: 'comment' }))
                        ].sort((a, b) => {
                            const aTime = new Date(Number(a.deletedAt)).getTime();
                            const bTime = new Date(Number(b.deletedAt)).getTime();
                            return bTime - aTime; // Most recent first
                        });

                        return allDeleted.length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-2">No Deleted Content</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    There is no soft-deleted content to review.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {allDeleted.map((item: any) => (
                                    <DeletedContentCard
                                        key={`${item.type}-${item.id}`}
                                        content={item}
                                        type={item.type}
                                        onActionComplete={() => {
                                            refetchDeletedPosts();
                                            refetchDeletedComments();
                                        }}
                                    />
                                ))}
                            </div>
                        );
                    })()
                )}
            </div>
        </div>
    );
}
