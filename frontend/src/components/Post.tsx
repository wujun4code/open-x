'use client';

import PostCard from './PostCard';

interface PostProps {
    post: {
        id: string;
        content: string;
        imageUrl?: string;
        createdAt: string;
        user: {
            id: string;
            name?: string;
            username: string;
            avatar?: string;
        };
        likesCount: number;
        commentsCount: number;
        isLiked: boolean;
        isBookmarked?: boolean;
    };
}

export default function Post({ post }: PostProps) {
    return <PostCard post={post} />;
}
