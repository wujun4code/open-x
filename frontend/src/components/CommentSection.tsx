'use client';

import CommentList from './CommentList';
import CreateComment from './CreateComment';

interface CommentSectionProps {
    postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    return (
        <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Comments
            </h3>
            <CreateComment postId={postId} />
            <div className="mt-6">
                <CommentList postId={postId} />
            </div>
        </div>
    );
}
