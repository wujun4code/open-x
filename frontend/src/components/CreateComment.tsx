'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_COMMENT_MUTATION, GET_POST_COMMENTS } from '@/lib/queries';
import { useTranslations } from 'next-intl';
import { Loader2, Send } from 'lucide-react';

interface CreateCommentProps {
    postId: string;
    onCommentAdded?: () => void;
}

export default function CreateComment({ postId, onCommentAdded }: CreateCommentProps) {
    const t = useTranslations('Comments');
    const [content, setContent] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }
    }, []);

    const [createComment, { loading }] = useMutation(CREATE_COMMENT_MUTATION, {
        refetchQueries: [
            {
                query: GET_POST_COMMENTS,
                variables: { postId },
            },
        ],
        awaitRefetchQueries: true,
        onCompleted: () => {
            setContent('');
            if (onCommentAdded) {
                onCommentAdded();
            }
        },
        onError: (error) => {
            alert(`Error adding comment: ${error.message}`);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || loading || !currentUser) return;

        const contentToSubmit = content.trim();

        await createComment({
            variables: {
                postId,
                content: contentToSubmit,
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 pb-4">
            <div className="flex items-start space-x-3">
                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={t('placeholder')}
                        className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                        rows={1}
                        style={{ minHeight: '44px' }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!content.trim() || loading}
                    className="flex-shrink-0 p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition-all active:scale-95"
                    title={t('reply')}
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </button>
            </div>
        </form>
    );
}
