import { Context } from '../context';
import { GraphQLError } from 'graphql';

// Helper function to require authentication
function requireAuth(context: Context): string {
    if (!context.userId) {
        throw new GraphQLError('You must be logged in to perform this action', {
            extensions: { code: 'UNAUTHENTICATED' },
        });
    }
    return context.userId;
}

// Helper to check if user can send DM to another user
async function canUserSendDM(
    context: Context,
    senderId: string,
    recipientId: string
): Promise<{ allowed: boolean; reason?: string }> {
    // Get recipient's DM privacy settings
    const recipient = await context.prisma.user.findUnique({
        where: { id: recipientId },
        select: {
            allowDMsFrom: true,
            blockedUsers: {
                where: { id: senderId },
                select: { id: true },
            },
        },
    });

    if (!recipient) {
        return { allowed: false, reason: 'User not found' };
    }

    // Check if sender is blocked by recipient
    if (recipient.blockedUsers.length > 0) {
        return { allowed: false, reason: 'You are blocked by this user' };
    }

    // Check if recipient is blocked by sender
    const sender = await context.prisma.user.findUnique({
        where: { id: senderId },
        select: {
            blockedUsers: {
                where: { id: recipientId },
                select: { id: true },
            },
        },
    });

    if (sender?.blockedUsers.length) {
        return { allowed: false, reason: 'You have blocked this user' };
    }

    // Check DM privacy settings
    if (recipient.allowDMsFrom === 'NONE') {
        return { allowed: false, reason: 'This user does not accept direct messages' };
    }

    if (recipient.allowDMsFrom === 'FOLLOWERS') {
        // Check if sender follows recipient
        const isFollowing = await context.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: senderId,
                    followingId: recipientId,
                },
            },
        });

        if (!isFollowing) {
            return { allowed: false, reason: 'You must follow this user to send them a message' };
        }
    }

    return { allowed: true };
}

// Get or create conversation between two users
async function getOrCreateConversation(
    context: Context,
    userId1: string,
    userId2: string
) {
    // Find existing conversation
    const existingConversation = await context.prisma.conversation.findFirst({
        where: {
            AND: [
                { participants: { some: { id: userId1 } } },
                { participants: { some: { id: userId2 } } },
            ],
        },
        include: {
            participants: true,
            messages: {
                take: 1,
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (existingConversation) {
        return existingConversation;
    }

    // Create new conversation
    const newConversation = await context.prisma.conversation.create({
        data: {
            participants: {
                connect: [{ id: userId1 }, { id: userId2 }],
            },
        },
        include: {
            participants: true,
            messages: true,
        },
    });

    return newConversation;
}

export const dmResolvers = {
    Query: {
        // Get all conversations for current user
        myConversations: async (
            _: any,
            { limit = 20, offset = 0, search }: { limit?: number; offset?: number; search?: string },
            context: Context
        ) => {
            const userId = requireAuth(context);

            const where: any = {
                participants: {
                    some: { id: userId },
                },
            };

            // Add search filter if provided
            if (search) {
                where.participants = {
                    some: {
                        OR: [
                            { username: { contains: search, mode: 'insensitive' } },
                            { name: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                };
            }

            const conversations = await context.prisma.conversation.findMany({
                where,
                take: limit,
                skip: offset,
                orderBy: { updatedAt: 'desc' },
                include: {
                    participants: true,
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });

            return conversations;
        },

        // Get or create conversation with a user
        conversation: async (_: any, { userId: recipientId }: { userId: string }, context: Context) => {
            const userId = requireAuth(context);

            if (userId === recipientId) {
                throw new GraphQLError('Cannot create conversation with yourself', {
                    extensions: { code: 'BAD_USER_INPUT' },
                });
            }

            // Check if user can send DM
            const permission = await canUserSendDM(context, userId, recipientId);
            if (!permission.allowed) {
                throw new GraphQLError(permission.reason || 'Cannot send message to this user', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }

            return getOrCreateConversation(context, userId, recipientId);
        },

        // Get messages in a conversation
        messages: async (
            _: any,
            { conversationId, limit = 50, offset = 0 }: { conversationId: string; limit?: number; offset?: number },
            context: Context
        ) => {
            const userId = requireAuth(context);

            // Verify user is participant in conversation
            const conversation = await context.prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    participants: {
                        some: { id: userId },
                    },
                },
            });

            if (!conversation) {
                throw new GraphQLError('Conversation not found or access denied', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }

            const messages = await context.prisma.message.findMany({
                where: {
                    conversationId,
                    deletedAt: null, // Only non-deleted messages
                },
                take: limit,
                skip: offset,
                orderBy: { createdAt: 'desc' },
            });

            return messages.reverse(); // Return in chronological order
        },

        // Get total unread message count
        unreadMessageCount: async (_: any, __: any, context: Context) => {
            const userId = requireAuth(context);

            // Get all conversations for user
            const conversations = await context.prisma.conversation.findMany({
                where: {
                    participants: {
                        some: { id: userId },
                    },
                },
                include: {
                    readStatus: {
                        where: { userId },
                    },
                    messages: {
                        where: {
                            senderId: { not: userId }, // Only messages from others
                            deletedAt: null,
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
            });

            let totalUnread = 0;

            for (const conversation of conversations) {
                const readStatus = conversation.readStatus[0];
                const lastMessage = conversation.messages[0];

                if (lastMessage) {
                    const lastReadAt = readStatus?.lastReadAt || new Date(0);
                    if (lastMessage.createdAt > lastReadAt) {
                        // Count unread messages in this conversation
                        const unreadCount = await context.prisma.message.count({
                            where: {
                                conversationId: conversation.id,
                                senderId: { not: userId },
                                createdAt: { gt: lastReadAt },
                                deletedAt: null,
                            },
                        });
                        totalUnread += unreadCount;
                    }
                }
            }

            return totalUnread;
        },

        // Check if user can send DM to another user
        canSendDM: async (_: any, { userId: recipientId }: { userId: string }, context: Context) => {
            const userId = requireAuth(context);
            const permission = await canUserSendDM(context, userId, recipientId);
            return permission.allowed;
        },
    },

    Mutation: {
        // Send a message
        sendMessage: async (
            _: any,
            {
                conversationId,
                recipientId,
                content,
                imageUrl,
            }: { conversationId?: string; recipientId?: string; content: string; imageUrl?: string },
            context: Context
        ) => {
            const userId = requireAuth(context);

            // Validate content
            if (!content || content.trim().length === 0) {
                throw new GraphQLError('Message content cannot be empty', {
                    extensions: { code: 'BAD_USER_INPUT' },
                });
            }

            if (content.length > 10000) {
                throw new GraphQLError('Message content cannot exceed 10,000 characters', {
                    extensions: { code: 'BAD_USER_INPUT' },
                });
            }

            let conversation;

            if (conversationId) {
                // Verify user is participant
                conversation = await context.prisma.conversation.findFirst({
                    where: {
                        id: conversationId,
                        participants: {
                            some: { id: userId },
                        },
                    },
                    include: {
                        participants: true,
                    },
                });

                if (!conversation) {
                    throw new GraphQLError('Conversation not found or access denied', {
                        extensions: { code: 'FORBIDDEN' },
                    });
                }
            } else if (recipientId) {
                // Check permission
                const permission = await canUserSendDM(context, userId, recipientId);
                if (!permission.allowed) {
                    throw new GraphQLError(permission.reason || 'Cannot send message to this user', {
                        extensions: { code: 'FORBIDDEN' },
                    });
                }

                // Get or create conversation
                conversation = await getOrCreateConversation(context, userId, recipientId);
            } else {
                throw new GraphQLError('Either conversationId or recipientId must be provided', {
                    extensions: { code: 'BAD_USER_INPUT' },
                });
            }

            // Create message
            const message = await context.prisma.message.create({
                data: {
                    content: content.trim(),
                    imageUrl,
                    senderId: userId,
                    conversationId: conversation.id,
                },
            });

            // Update conversation updatedAt
            await context.prisma.conversation.update({
                where: { id: conversation.id },
                data: { updatedAt: new Date() },
            });

            return message;
        },

        // Mark all messages in conversation as read
        markMessagesAsRead: async (_: any, { conversationId }: { conversationId: string }, context: Context) => {
            const userId = requireAuth(context);

            // Verify user is participant
            const conversation = await context.prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    participants: {
                        some: { id: userId },
                    },
                },
            });

            if (!conversation) {
                throw new GraphQLError('Conversation not found or access denied', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }

            // Upsert read status
            await context.prisma.messageReadStatus.upsert({
                where: {
                    userId_conversationId: {
                        userId,
                        conversationId,
                    },
                },
                create: {
                    userId,
                    conversationId,
                    lastReadAt: new Date(),
                },
                update: {
                    lastReadAt: new Date(),
                },
            });

            return true;
        },

        // Delete a message (soft delete)
        deleteMessage: async (_: any, { messageId }: { messageId: string }, context: Context) => {
            const userId = requireAuth(context);

            // Find message and verify ownership
            const message = await context.prisma.message.findUnique({
                where: { id: messageId },
            });

            if (!message) {
                throw new GraphQLError('Message not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            if (message.senderId !== userId) {
                throw new GraphQLError('You can only delete your own messages', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }

            // Soft delete
            await context.prisma.message.update({
                where: { id: messageId },
                data: { deletedAt: new Date() },
            });

            return true;
        },

        // Delete entire conversation
        deleteConversation: async (_: any, { conversationId }: { conversationId: string }, context: Context) => {
            const userId = requireAuth(context);

            // Verify user is participant
            const conversation = await context.prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    participants: {
                        some: { id: userId },
                    },
                },
            });

            if (!conversation) {
                throw new GraphQLError('Conversation not found or access denied', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }

            // Delete conversation (cascade will delete messages and read status)
            await context.prisma.conversation.delete({
                where: { id: conversationId },
            });

            return true;
        },

        // Update DM privacy settings
        updateDMPrivacy: async (_: any, { allowDMsFrom }: { allowDMsFrom: string }, context: Context) => {
            const userId = requireAuth(context);

            if (!['ALL', 'FOLLOWERS', 'NONE'].includes(allowDMsFrom)) {
                throw new GraphQLError('Invalid privacy setting. Must be ALL, FOLLOWERS, or NONE', {
                    extensions: { code: 'BAD_USER_INPUT' },
                });
            }

            const user = await context.prisma.user.update({
                where: { id: userId },
                data: { allowDMsFrom: allowDMsFrom as any },
            });

            return user;
        },

        // Block a user
        blockUser: async (_: any, { userId: targetUserId }: { userId: string }, context: Context) => {
            const userId = requireAuth(context);

            if (userId === targetUserId) {
                throw new GraphQLError('Cannot block yourself', {
                    extensions: { code: 'BAD_USER_INPUT' },
                });
            }

            // Add to blocked users
            await context.prisma.user.update({
                where: { id: userId },
                data: {
                    blockedUsers: {
                        connect: { id: targetUserId },
                    },
                },
            });

            return true;
        },

        // Unblock a user
        unblockUser: async (_: any, { userId: targetUserId }: { userId: string }, context: Context) => {
            const userId = requireAuth(context);

            // Remove from blocked users
            await context.prisma.user.update({
                where: { id: userId },
                data: {
                    blockedUsers: {
                        disconnect: { id: targetUserId },
                    },
                },
            });

            return true;
        },
    },

    // Field resolvers for Conversation type
    Conversation: {
        participants: async (parent: any, _: any, context: Context) => {
            return context.prisma.user.findMany({
                where: {
                    conversations: {
                        some: { id: parent.id },
                    },
                },
            });
        },

        messages: async (
            parent: any,
            { limit = 50, offset = 0 }: { limit?: number; offset?: number },
            context: Context
        ) => {
            const messages = await context.prisma.message.findMany({
                where: {
                    conversationId: parent.id,
                    deletedAt: null,
                },
                take: limit,
                skip: offset,
                orderBy: { createdAt: 'desc' },
            });
            return messages.reverse();
        },

        lastMessage: async (parent: any, _: any, context: Context) => {
            return context.prisma.message.findFirst({
                where: {
                    conversationId: parent.id,
                    deletedAt: null,
                },
                orderBy: { createdAt: 'desc' },
            });
        },

        unreadCount: async (parent: any, _: any, context: Context) => {
            if (!context.userId) return 0;

            const readStatus = await context.prisma.messageReadStatus.findUnique({
                where: {
                    userId_conversationId: {
                        userId: context.userId,
                        conversationId: parent.id,
                    },
                },
            });

            const lastReadAt = readStatus?.lastReadAt || new Date(0);

            return context.prisma.message.count({
                where: {
                    conversationId: parent.id,
                    senderId: { not: context.userId },
                    createdAt: { gt: lastReadAt },
                    deletedAt: null,
                },
            });
        },

        createdAt: (parent: any) => parent.createdAt.toISOString(),
        updatedAt: (parent: any) => parent.updatedAt.toISOString(),
    },

    // Field resolvers for Message type
    Message: {
        sender: async (parent: any, _: any, context: Context) => {
            return context.prisma.user.findUnique({
                where: { id: parent.senderId },
            });
        },

        conversation: async (parent: any, _: any, context: Context) => {
            return context.prisma.conversation.findUnique({
                where: { id: parent.conversationId },
            });
        },

        isDeleted: (parent: any) => !!parent.deletedAt,
        createdAt: (parent: any) => parent.createdAt.toISOString(),
    },
};
