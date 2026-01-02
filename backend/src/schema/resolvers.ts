import { Context } from '../context';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import {
    validateEmail,
    validateUsername,
    validatePassword,
    validatePostContent,
    validateCommentContent,
    ValidationError,
} from '../utils/validation';
import { GraphQLError } from 'graphql';
import { generateUploadUrl } from '../utils/r2';

// Helper function to require authentication
function requireAuth(context: Context): string {
    if (!context.userId) {
        throw new GraphQLError('You must be logged in to perform this action', {
            extensions: { code: 'UNAUTHENTICATED' },
        });
    }
    return context.userId;
}

export const resolvers = {
    Query: {
        hello: () => {
            return 'Hello from X API! 🚀';
        },

        // Get current authenticated user
        me: async (_: any, __: any, context: Context) => {
            const userId = requireAuth(context);
            const user = await context.prisma.user.findUnique({
                where: { id: userId },
            });
            return user;
        },

        // Get user by ID
        user: async (_: any, { id }: { id: string }, context: Context) => {
            const user = await context.prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                throw new GraphQLError('User not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }
            return user;
        },

        // List users with pagination
        users: async (_: any, { limit = 20, offset = 0 }: { limit?: number; offset?: number }, context: Context) => {
            return context.prisma.user.findMany({
                take: limit,
                skip: offset,
                orderBy: { createdAt: 'desc' },
            });
        },

        // Get post by ID
        post: async (_: any, { id }: { id: string }, context: Context) => {
            const post = await context.prisma.post.findUnique({
                where: { id },
            });
            if (!post) {
                throw new GraphQLError('Post not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }
            return post;
        },

        // List all posts with pagination
        posts: async (_: any, { limit = 20, offset = 0 }: { limit?: number; offset?: number }, context: Context) => {
            return context.prisma.post.findMany({
                take: limit,
                skip: offset,
                orderBy: { createdAt: 'desc' },
            });
        },

        // Get posts by specific user
        userPosts: async (
            _: any,
            { userId, limit = 20, offset = 0 }: { userId: string; limit?: number; offset?: number },
            context: Context
        ) => {
            return context.prisma.post.findMany({
                where: { userId },
                take: limit,
                skip: offset,
                orderBy: { createdAt: 'desc' },
            });
        },

        // Get personalized feed (posts from followed users)
        feed: async (_: any, { limit = 20, offset = 0 }: { limit?: number; offset?: number }, context: Context) => {
            const userId = requireAuth(context);

            // Get IDs of users that the current user follows
            const following = await context.prisma.follow.findMany({
                where: { followerId: userId },
                select: { followingId: true },
            });

            const followingIds = following.map((f) => f.followingId);

            // Include own posts in the feed
            followingIds.push(userId);

            return context.prisma.post.findMany({
                where: {
                    userId: { in: followingIds },
                },
                take: limit,
                skip: offset,
                orderBy: { createdAt: 'desc' },
            });
        },
    },

    Mutation: {
        // Register new user
        register: async (
            _: any,
            { email, username, password, name }: { email: string; username: string; password: string; name?: string },
            context: Context
        ) => {
            try {
                // Validate inputs
                validateEmail(email);
                validateUsername(username);
                validatePassword(password);

                // Check if email already exists
                const existingEmail = await context.prisma.user.findUnique({
                    where: { email },
                });
                if (existingEmail) {
                    throw new GraphQLError('Email already in use', {
                        extensions: { code: 'BAD_USER_INPUT' },
                    });
                }

                // Check if username already exists
                const existingUsername = await context.prisma.user.findUnique({
                    where: { username },
                });
                if (existingUsername) {
                    throw new GraphQLError('Username already taken', {
                        extensions: { code: 'BAD_USER_INPUT' },
                    });
                }

                // Hash password
                const hashedPassword = await hashPassword(password);

                // Create user
                const user = await context.prisma.user.create({
                    data: {
                        email,
                        username,
                        password: hashedPassword,
                        name,
                    },
                });

                // Generate token
                const token = generateToken({
                    userId: user.id,
                    email: user.email,
                });

                return { token, user };
            } catch (error) {
                if (error instanceof ValidationError) {
                    throw new GraphQLError(error.message, {
                        extensions: { code: 'BAD_USER_INPUT' },
                    });
                }
                throw error;
            }
        },

        // Login user
        login: async (_: any, { email, password }: { email: string; password: string }, context: Context) => {
            // Find user by email
            const user = await context.prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                throw new GraphQLError('Invalid credentials', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            // Verify password
            const isValid = await comparePassword(password, user.password);
            if (!isValid) {
                throw new GraphQLError('Invalid credentials', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            // Generate token
            const token = generateToken({
                userId: user.id,
                email: user.email,
            });

            return { token, user };
        },

        // Complete onboarding
        completeOnboarding: async (_: any, __: any, context: Context) => {
            const userId = requireAuth(context);

            await context.prisma.user.update({
                where: { id: userId },
                data: { onboardingCompleted: true },
            });

            return true;
        },

        // Create a new post
        createPost: async (
            _: any,
            { content, imageUrl }: { content: string; imageUrl?: string },
            context: Context
        ) => {
            const userId = requireAuth(context);

            try {
                validatePostContent(content);

                const post = await context.prisma.post.create({
                    data: {
                        content,
                        imageUrl,
                        userId,
                    },
                });

                return post;
            } catch (error) {
                if (error instanceof ValidationError) {
                    throw new GraphQLError(error.message, {
                        extensions: { code: 'BAD_USER_INPUT' },
                    });
                }
                throw error;
            }
        },

        // Delete a post
        deletePost: async (_: any, { id }: { id: string }, context: Context) => {
            const userId = requireAuth(context);

            const post = await context.prisma.post.findUnique({
                where: { id },
            });

            if (!post) {
                throw new GraphQLError('Post not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            if (post.userId !== userId) {
                throw new GraphQLError('You can only delete your own posts', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }

            await context.prisma.post.delete({
                where: { id },
            });

            return true;
        },

        // Like a post
        likePost: async (_: any, { postId }: { postId: string }, context: Context) => {
            const userId = requireAuth(context);

            // Check if already liked
            const existingLike = await context.prisma.like.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });

            if (existingLike) {
                return true; // Already liked
            }

            await context.prisma.like.create({
                data: {
                    userId,
                    postId,
                },
            });

            return true;
        },

        // Unlike a post
        unlikePost: async (_: any, { postId }: { postId: string }, context: Context) => {
            const userId = requireAuth(context);

            await context.prisma.like.deleteMany({
                where: {
                    userId,
                    postId,
                },
            });

            return true;
        },

        // Create a comment
        createComment: async (
            _: any,
            { postId, content }: { postId: string; content: string },
            context: Context
        ) => {
            const userId = requireAuth(context);

            try {
                validateCommentContent(content);

                const comment = await context.prisma.comment.create({
                    data: {
                        content,
                        userId,
                        postId,
                    },
                });

                return comment;
            } catch (error) {
                if (error instanceof ValidationError) {
                    throw new GraphQLError(error.message, {
                        extensions: { code: 'BAD_USER_INPUT' },
                    });
                }
                throw error;
            }
        },

        // Delete a comment
        deleteComment: async (_: any, { id }: { id: string }, context: Context) => {
            const userId = requireAuth(context);

            const comment = await context.prisma.comment.findUnique({
                where: { id },
            });

            if (!comment) {
                throw new GraphQLError('Comment not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            if (comment.userId !== userId) {
                throw new GraphQLError('You can only delete your own comments', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }

            await context.prisma.comment.delete({
                where: { id },
            });

            return true;
        },

        // Follow a user
        followUser: async (_: any, { userId: targetUserId }: { userId: string }, context: Context) => {
            const userId = requireAuth(context);

            if (userId === targetUserId) {
                throw new GraphQLError('You cannot follow yourself', {
                    extensions: { code: 'BAD_USER_INPUT' },
                });
            }

            // Check if already following
            const existingFollow = await context.prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: targetUserId,
                    },
                },
            });

            if (existingFollow) {
                return true; // Already following
            }

            await context.prisma.follow.create({
                data: {
                    followerId: userId,
                    followingId: targetUserId,
                },
            });

            return true;
        },

        // Unfollow a user
        unfollowUser: async (_: any, { userId: targetUserId }: { userId: string }, context: Context) => {
            const userId = requireAuth(context);

            await context.prisma.follow.deleteMany({
                where: {
                    followerId: userId,
                    followingId: targetUserId,
                },
            });

            return true;
        },

        // Bookmark a post
        bookmarkPost: async (_: any, { postId }: { postId: string }, context: Context) => {
            const userId = requireAuth(context);

            // Check if already bookmarked
            const existingBookmark = await context.prisma.bookmark.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });

            if (existingBookmark) {
                return true; // Already bookmarked
            }

            await context.prisma.bookmark.create({
                data: {
                    userId,
                    postId,
                },
            });

            return true;
        },

        // Remove bookmark
        unbookmarkPost: async (_: any, { postId }: { postId: string }, context: Context) => {
            const userId = requireAuth(context);

            await context.prisma.bookmark.deleteMany({
                where: {
                    userId,
                    postId,
                },
            });

            return true;
        },

        // Generate upload URL for R2
        generateUploadUrl: async (
            _: any,
            { filename, contentType }: { filename: string; contentType: string },
            context: Context
        ) => {
            requireAuth(context); // Must be authenticated to upload

            try {
                const result = await generateUploadUrl(filename, contentType);
                return result;
            } catch (error) {
                console.error('Error generating upload URL:', error);
                throw new GraphQLError('Failed to generate upload URL', {
                    extensions: { code: 'INTERNAL_SERVER_ERROR' },
                });
            }
        },
    },

    // Field resolvers for User type
    User: {
        posts: async (parent: any, _: any, context: Context) => {
            return context.prisma.post.findMany({
                where: { userId: parent.id },
                orderBy: { createdAt: 'desc' },
            });
        },

        followers: async (parent: any, _: any, context: Context) => {
            const follows = await context.prisma.follow.findMany({
                where: { followingId: parent.id },
                include: { follower: true },
            });
            return follows.map((f) => f.follower);
        },

        following: async (parent: any, _: any, context: Context) => {
            const follows = await context.prisma.follow.findMany({
                where: { followerId: parent.id },
                include: { following: true },
            });
            return follows.map((f) => f.following);
        },

        followersCount: async (parent: any, _: any, context: Context) => {
            return context.prisma.follow.count({
                where: { followingId: parent.id },
            });
        },

        followingCount: async (parent: any, _: any, context: Context) => {
            return context.prisma.follow.count({
                where: { followerId: parent.id },
            });
        },

        postsCount: async (parent: any, _: any, context: Context) => {
            return context.prisma.post.count({
                where: { userId: parent.id },
            });
        },
    },

    // Field resolvers for Post type
    Post: {
        user: async (parent: any, _: any, context: Context) => {
            return context.prisma.user.findUnique({
                where: { id: parent.userId },
            });
        },

        likes: async (parent: any, _: any, context: Context) => {
            return context.prisma.like.findMany({
                where: { postId: parent.id },
            });
        },

        comments: async (parent: any, _: any, context: Context) => {
            return context.prisma.comment.findMany({
                where: { postId: parent.id },
                orderBy: { createdAt: 'desc' },
            });
        },

        likesCount: async (parent: any, _: any, context: Context) => {
            return context.prisma.like.count({
                where: { postId: parent.id },
            });
        },

        commentsCount: async (parent: any, _: any, context: Context) => {
            return context.prisma.comment.count({
                where: { postId: parent.id },
            });
        },

        isLiked: async (parent: any, _: any, context: Context) => {
            if (!context.userId) return false;

            const like = await context.prisma.like.findUnique({
                where: {
                    userId_postId: {
                        userId: context.userId,
                        postId: parent.id,
                    },
                },
            });

            return !!like;
        },

        isBookmarked: async (parent: any, _: any, context: Context) => {
            if (!context.userId) return false;

            const bookmark = await context.prisma.bookmark.findUnique({
                where: {
                    userId_postId: {
                        userId: context.userId,
                        postId: parent.id,
                    },
                },
            });

            return !!bookmark;
        },
    },

    // Field resolvers for Comment type
    Comment: {
        user: async (parent: any, _: any, context: Context) => {
            return context.prisma.user.findUnique({
                where: { id: parent.userId },
            });
        },

        post: async (parent: any, _: any, context: Context) => {
            return context.prisma.post.findUnique({
                where: { id: parent.postId },
            });
        },
    },

    // Field resolvers for Like type
    Like: {
        user: async (parent: any, _: any, context: Context) => {
            return context.prisma.user.findUnique({
                where: { id: parent.userId },
            });
        },

        post: async (parent: any, _: any, context: Context) => {
            return context.prisma.post.findUnique({
                where: { id: parent.postId },
            });
        },
    },
};
