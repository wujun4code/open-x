'use client';

import { useState } from 'react';
import { Search, MessageCircle, Loader2, Plus } from 'lucide-react';
import ConversationItem from './ConversationItem';
import NewMessageModal from './NewMessageModal';
import { useTranslations } from 'next-intl';

interface Conversation {
    id: string;
    participants: Array<{
        id: string;
        username: string;
        name: string;
        avatar: string;
    }>;
    lastMessage?: {
        id: string;
        content: string;
        createdAt: string;
        sender: {
            id: string;
            username: string;
        };
    };
    unreadCount: number;
    updatedAt: string;
}

interface ConversationListProps {
    conversations: Conversation[];
    loading: boolean;
    selectedConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onRefresh: () => void;
}

export default function ConversationList({
    conversations,
    loading,
    selectedConversationId,
    onSelectConversation,
    onRefresh,
}: ConversationListProps) {
    const t = useTranslations('Messages');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);

    // Filter conversations based on search
    const filteredConversations = conversations.filter((conv) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return conv.participants.some(
            (p) =>
                p.username.toLowerCase().includes(query) ||
                p.name?.toLowerCase().includes(query)
        );
    });

    const handleConversationCreated = (conversationId: string) => {
        onRefresh();
        onSelectConversation(conversationId);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-dark-800">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <button
                        onClick={() => setShowNewMessageModal(true)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="New Message"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {loading && conversations.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                        <MessageCircle className="w-12 h-12 mb-2" />
                        <p className="text-sm">
                            {searchQuery ? t('noResults') : t('noConversations')}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-dark-800">
                        {filteredConversations.map((conversation) => (
                            <ConversationItem
                                key={conversation.id}
                                conversation={conversation}
                                isSelected={conversation.id === selectedConversationId}
                                onClick={() => onSelectConversation(conversation.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* New Message Modal */}
            {showNewMessageModal && (
                <NewMessageModal
                    onClose={() => setShowNewMessageModal(false)}
                    onConversationCreated={handleConversationCreated}
                />
            )}
        </div>
    );
}
