'use client';

import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { DELETE_MESSAGE } from '@/lib/queries/messages';

const ME_QUERY = gql`
  query Me {
    me {
      id
    }
  }
`;

interface Message {
    id: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
    isDeleted: boolean;
    sender: {
        id: string;
        username: string;
        name: string;
        avatar: string;
    };
}

interface MessageBubbleProps {
    message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const [deleteMessage] = useMutation(DELETE_MESSAGE);
    const { data: userData } = useQuery(ME_QUERY);
    const isCurrentUser = userData?.me?.id === message.sender.id;

    const handleDelete = async () => {
        if (confirm('Delete this message?')) {
            try {
                await deleteMessage({ variables: { messageId: message.id } });
            } catch (error) {
                console.error('Error deleting message:', error);
            }
        }
    };

    if (message.isDeleted) {
        return (
            <div className="flex justify-center">
                <p className="text-sm text-gray-400 italic">Message deleted</p>
            </div>
        );
    }

    return (
        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}>
            <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                {/* Avatar for received messages */}
                {!isCurrentUser && (
                    <div className="flex items-start gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {message.sender.name[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {message.sender.name}
                        </span>
                    </div>
                )}

                {/* Message bubble */}
                <div
                    className={`rounded-2xl px-4 py-2 ${isCurrentUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-dark-800 text-gray-900 dark:text-white rounded-bl-none'
                        }`}
                >
                    {message.imageUrl && (
                        <Image
                            src={message.imageUrl}
                            alt="Message image"
                            width={300}
                            height={200}
                            className="rounded-lg mb-2"
                        />
                    )}
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>

                {/* Timestamp and actions */}
                <div className="flex items-center gap-2 mt-1 px-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                        })}
                    </span>
                    {isCurrentUser && (
                        <button
                            onClick={handleDelete}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
