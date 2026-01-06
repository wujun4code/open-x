'use client';

import { formatDistanceToNow } from 'date-fns';
import { useQuery, gql } from '@apollo/client';

const ME_QUERY = gql`
  query Me {
    me {
      id
    }
  }
`;

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

interface ConversationItemProps {
    conversation: Conversation;
    isSelected: boolean;
    onClick: () => void;
}

export default function ConversationItem({
    conversation,
    isSelected,
    onClick,
}: ConversationItemProps) {
    const { data: userData } = useQuery(ME_QUERY);
    const currentUserId = userData?.me?.id;

    // Get the other participant (not the current user)
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <button
            onClick={onClick}
            className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600' : ''
                }`}
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {(otherParticipant.name || otherParticipant.username)[0].toUpperCase()}
                </div>
                {conversation.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 text-left">
                <div className="flex items-baseline justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {otherParticipant.name || otherParticipant.username}
                    </h3>
                    {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                            {formatDistanceToNow(new Date(parseInt(conversation.lastMessage.createdAt)), {
                                addSuffix: true,
                            })}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    @{otherParticipant.username}
                </p>
                {conversation.lastMessage && (
                    <p
                        className={`text-sm mt-1 truncate ${conversation.unreadCount > 0
                            ? 'font-semibold text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        {truncateText(conversation.lastMessage.content, 50)}
                    </p>
                )}
            </div>
        </button>
    );
}
