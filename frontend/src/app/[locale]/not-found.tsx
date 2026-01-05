'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

export default function NotFound() {
    const t = useTranslations('NotFound');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-blue-600 dark:text-blue-500">
                        404
                    </h1>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {t('title')}
                </h2>

                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    {t('description')}
                </p>

                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    {t('goHome')}
                </Link>
            </div>
        </div>
    );
}
