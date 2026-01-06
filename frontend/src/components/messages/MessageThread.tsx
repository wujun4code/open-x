'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MESSAGES, MARK_MESSAGES_AS_READ, SEND_MESSAGE } from '@/lib/queries/messages';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface MessageThreadProps {
    conversationId: string;
    onBack: () => void;
}

export default function MessageThread({ conversationId, onBack }: MessageThreadProps) {
    const t = useTranslations('Messages');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);

    const { data, loading, refetch } = useQuery(GET_MESSAGES, {
        variables: { conversationId, limit: 100 },
        pollInterval: 3000, // Poll every 3 seconds for new messages
        skip: !conversationId,
    });

    const [markAsRead] = useMutation(MARK_MESSAGES_AS_READ);
    const [sendMessage] = useMutation(SEND_MESSAGE);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [data?.messages]);

    // Mark messages as read when viewing conversation
    useEffect(() => {
        if (conversationId && !hasMarkedAsRead && data?.messages?.length > 0) {
            markAsRead({ variables: { conversationId } });
            setHasMarkedAsRead(true);
        }
    }, [conversationId, data, hasMarkedAsRead, markAsRead]);

    // Reset hasMarkedAsRead when conversation changes
    useEffect(() => {
        setHasMarkedAsRead(false);
    }, [conversationId]);

    const handleSendMessage = async (content: string, imageUrl?: string) => {
        try {
            await sendMessage({
                variables: {
                    conversationId,
                    content,
                    imageUrl,
                },
                // Optimistically update the UI
                optimisticResponse: {
                    sendMessage: {
                        __typename: 'Message',
                        id: `temp-${Date.now()}`,
                        content,
                        imageUrl: imageUrl || null,
                        createdAt: new Date().toISOString(),
                        isDeleted: false,
                        sender: {
                            __typename: 'User',
                            id: 'current-user', // Will be replaced with actual data
                            username: 'You',
                            name: 'You',
                            avatar: null,
                        },
                        conversation: {
                            __typename: 'Conversation',
                            id: conversationId,
                            updatedAt: new Date().toISOString(),
                        },
                    },
                },
            });
            refetch();
        } catch (error) {
            console.error('Error sending message:', error);
            alert(t('sendError'));
        }
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const messages = data?.messages || [];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-dark-800 flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                {/* Participant info would go here */}
                <h2 className="font-semibold text-lg">{t('conversation')}</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <p>{t('noMessages')}</p>
                    </div>
                ) : (
                    messages.map((message: any) => (
                        <MessageBubble key={message.id} message={message} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <MessageInput onSend={handleSendMessage} />
        </div>
    );
}
