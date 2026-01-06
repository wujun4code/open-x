'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global error boundary caught:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="mb-8">
                            <svg
                                className="mx-auto h-24 w-24 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Application Error
                        </h1>

                        <p className="text-gray-600 mb-8">
                            A critical error occurred. Please refresh the page or contact support if the problem persists.
                        </p>

                        {error.digest && (
                            <p className="text-sm text-gray-500 mb-6">
                                Error ID: {error.digest}
                            </p>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => reset()}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Try Again
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
