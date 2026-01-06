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
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-dark-800 bg-white dark:bg-dark-900">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('inputPlaceholder')}
                        rows={1}
                        className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none max-h-32 text-[15px] leading-relaxed"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!content.trim() || sending || isOverLimit}
                        className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                        {sending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
                <div className="h-4 flex items-center px-2">
                    {charCount > 0 && (
                        <p className={`text-[10px] font-medium tracking-wider uppercase ${isOverLimit ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            {charCount.toLocaleString()} / {charLimit.toLocaleString()}
                        </p>
                    )}
                </div>
            </div>
        </form>
    );
}
