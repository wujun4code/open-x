'use client';

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { X, Search, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SEND_MESSAGE } from '@/lib/queries/messages';

const SEARCH_USERS = gql`
  query SearchUsers($query: String) {
    searchUsers(query: $query, limit: 20) {
      id
      username
      name
      avatar
    }
  }
`;

interface NewMessageModalProps {
    onClose: () => void;
    onConversationCreated: (conversationId: string) => void;
}

export default function NewMessageModal({ onClose, onConversationCreated }: NewMessageModalProps) {
    const t = useTranslations('Messages');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [message, setMessage] = useState('');

    const { data, loading } = useQuery(SEARCH_USERS, {
        variables: { query: searchQuery },
        skip: searchQuery.length < 2,
    });

    const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE);

    const handleSendMessage = async () => {
        if (!selectedUser || !message.trim()) return;

        try {
            const result = await sendMessage({
                variables: {
                    recipientId: selectedUser.id,
                    content: message.trim(),
                },
            });

            const conversationId = result.data?.sendMessage?.conversation?.id;
            if (conversationId) {
                onConversationCreated(conversationId);
                onClose();
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedUser ? `New message to @${selectedUser.username}` : 'New Message'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!selectedUser ? (
                        <>
                            {/* Search */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users by username or name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    autoFocus
                                />
                            </div>

                            {/* User List */}
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                </div>
                            ) : searchQuery.length < 2 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    Type at least 2 characters to search for users
                                </p>
                            ) : data?.searchUsers?.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No users found
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {data?.searchUsers?.map((user: any) => (
                                        <button
                                            key={user.id}
                                            onClick={() => setSelectedUser(user)}
                                            className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-800 rounded-lg transition-colors text-left"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                                {(user.name || user.username)[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                    {user.name || user.username}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                    @{user.username}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Selected User */}
                            <div className="flex items-center gap-3 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                    {(selectedUser.name || selectedUser.username)[0].toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {selectedUser.name || selectedUser.username}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        @{selectedUser.username}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Change
                                </button>
                            </div>

                            {/* Message Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    rows={6}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {message.length} / 10000
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {selectedUser && (
                    <div className="p-6 border-t border-gray-200 dark:border-dark-800 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSendMessage}
                            disabled={!message.trim() || sending}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {sending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Message'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
