'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MESSAGES, MARK_MESSAGES_AS_READ, SEND_MESSAGE, GET_UNREAD_MESSAGE_COUNT, GET_CONVERSATIONS } from '@/lib/queries/messages';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface MessageThreadProps {
    conversationId: string;
    onBack: () => void;
}

export default function MessageThread({ conversationId, onBack }: MessageThreadProps) {
    const t = useTranslations('Messages');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesStartRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const lastMarkedMessageId = useRef<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [prevScrollHeight, setPrevScrollHeight] = useState<number | null>(null);

    const { data, loading, fetchMore, refetch } = useQuery(GET_MESSAGES, {
        variables: { conversationId, limit: 50, offset: 0 },
        pollInterval: 3000,
        skip: !conversationId,
        notifyOnNetworkStatusChange: true,
    });

    const [markAsRead] = useMutation(MARK_MESSAGES_AS_READ, {
        refetchQueries: [
            { query: GET_UNREAD_MESSAGE_COUNT },
            { query: GET_CONVERSATIONS, variables: { limit: 50, offset: 0 } },
        ],
    });
    const [sendMessage] = useMutation(SEND_MESSAGE);

    // Initial scroll to bottom and handling scroll anchoring
    const messages = data?.messages || [];

    useEffect(() => {
        if (!isFetchingMore && messages.length > 0 && !prevScrollHeight) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }
    }, [messages.length, isFetchingMore, prevScrollHeight]);

    // Scroll anchoring logic: keep position when prepending messages
    useEffect(() => {
        if (prevScrollHeight && scrollContainerRef.current) {
            const newScrollHeight = scrollContainerRef.current.scrollHeight;
            const heightDiff = newScrollHeight - prevScrollHeight;
            if (heightDiff > 0) {
                scrollContainerRef.current.scrollTop = heightDiff;
                setPrevScrollHeight(null);
            }
        }
    }, [messages.length, prevScrollHeight]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            async (entries) => {
                const first = entries[0];
                if (first.isIntersecting && hasMore && !loading && !isFetchingMore && messages.length >= 50) {
                    setIsFetchingMore(true);
                    setPrevScrollHeight(scrollContainerRef.current?.scrollHeight || null);

                    try {
                        const { data: moreData } = await fetchMore({
                            variables: {
                                offset: messages.length,
                            },
                        });

                        if (moreData.messages.length < 50) {
                            setHasMore(false);
                        }
                    } catch (error) {
                        console.error('Error fetching more messages:', error);
                    } finally {
                        setIsFetchingMore(false);
                    }
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = messagesStartRef.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [fetchMore, hasMore, loading, isFetchingMore, messages.length]);

    // Mark messages as read when viewing conversation or new messages arrive
    useEffect(() => {
        if (conversationId && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];

            if (lastMessage.id !== lastMarkedMessageId.current) {
                markAsRead({ variables: { conversationId } });
                lastMarkedMessageId.current = lastMessage.id;
            }
        }
    }, [conversationId, messages, markAsRead]);

    // Reset state when conversation changes
    useEffect(() => {
        lastMarkedMessageId.current = null;
        setHasMore(true);
        setIsFetchingMore(false);
        setPrevScrollHeight(null);
    }, [conversationId]);

    const handleSendMessage = async (content: string, imageUrl?: string) => {
        try {
            await sendMessage({
                variables: {
                    conversationId,
                    content,
                    imageUrl,
                },
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
                            id: 'current-user',
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
            // Scroll to bottom on new message if user is near bottom
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
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

    return (
        <div className="flex flex-col h-full bg-white dark:bg-dark-900 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-dark-800 flex items-center gap-3 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md z-10">
                <button
                    onClick={onBack}
                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="font-bold text-lg">{t('conversation')}</h2>
            </div>

            {/* Messages */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
                {/* Intersection Observer Trigger */}
                <div ref={messagesStartRef} className="h-4 w-full" />

                {isFetchingMore && (
                    <div className="flex justify-center py-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                )}

                {!hasMore && messages.length > 0 && (
                    <div className="text-center py-4 text-sm text-gray-500 italic">
                        {t('endOfHistory') || 'Beginning of conversation'}
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <p>{t('noMessages')}</p>
                    </div>
                ) : (
                    messages.map((message: any) => (
                        <MessageBubble key={message.id} message={message} />
                    ))
                )}
                <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 dark:border-dark-800 bg-white dark:bg-dark-900">
                <MessageInput onSend={handleSendMessage} />
            </div>
        </div>
    );
}
