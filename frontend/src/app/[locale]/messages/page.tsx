'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CONVERSATIONS } from '@/lib/queries/messages';
import ConversationList from '@/components/messages/ConversationList';
import MessageThread from '@/components/messages/MessageThread';
import { useTranslations } from 'next-intl';

export default function MessagesPage() {
    const t = useTranslations('Messages');
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    const { data, loading, refetch } = useQuery(GET_CONVERSATIONS, {
        variables: { limit: 50, offset: 0 },
        pollInterval: 5000, // Poll every 5 seconds for new conversations
        skip: !isAuthenticated, // Skip query if not authenticated
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 h-[calc(100vh-4rem)]">
                    {/* Conversation List - Left Side */}
                    <div className="md:col-span-1 border-r border-gray-200 dark:border-dark-800 bg-white dark:bg-dark-900">
                        <ConversationList
                            conversations={data?.myConversations || []}
                            loading={loading}
                            selectedConversationId={selectedConversationId}
                            onSelectConversation={setSelectedConversationId}
                            onRefresh={refetch}
                        />
                    </div>

                    {/* Message Thread - Right Side */}
                    <div className="md:col-span-2 bg-white dark:bg-dark-900">
                        {selectedConversationId ? (
                            <MessageThread
                                conversationId={selectedConversationId}
                                onBack={() => setSelectedConversationId(null)}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                <div className="text-center">
                                    <svg
                                        className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                        />
                                    </svg>
                                    <p className="text-lg font-medium">{t('selectConversation')}</p>
                                    <p className="text-sm mt-1">{t('selectConversationHint')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
