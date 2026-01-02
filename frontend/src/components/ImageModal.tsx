'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ImageModalProps {
    imageUrl: string;
    onClose: () => void;
}

export default function ImageModal({ imageUrl, onClose }: ImageModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 transition-opacity duration-300"
            onClick={onClose}
        >
            <div className="relative max-w-7xl max-h-[90vh] w-full mx-4 flex items-center justify-center">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors bg-white bg-opacity-10 rounded-full"
                    aria-label="Close modal"
                >
                    <X className="w-8 h-8" />
                </button>

                <div
                    className="relative w-full h-full flex items-center justify-center animate-in zoom-in duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={imageUrl}
                        alt="Full size"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    />
                </div>
            </div>
        </div>
    );
}
