'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface MessageInputProps {
    onSend: (content: string, imageUrl?: string) => Promise<void>;
}

export default function MessageInput({ onSend }: MessageInputProps) {
    const t = useTranslations('Messages');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim() || sending) return;

        setSending(true);
        try {
            await onSend(content.trim());
            setContent('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const charCount = content.length;
    const charLimit = 10000;
    const isOverLimit = charCount > charLimit;

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-dark-800">
            <div className="flex items-end gap-2">
                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('inputPlaceholder')}
                        rows={1}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
                        disabled={sending}
                    />
                    {charCount > 0 && (
                        <p className={`text-xs mt-1 ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
                            {charCount} / {charLimit}
                        </p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={!content.trim() || sending || isOverLimit}
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </button>
            </div>
        </form>
    );
}
