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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Close button - top right corner */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="fixed top-6 right-6 p-3 text-white hover:text-gray-300 transition-all duration-200 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full shadow-lg hover:scale-110 z-[101]"
                aria-label="Close modal"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Image container */}
            <div
                className="relative max-w-7xl max-h-[90vh] w-full mx-4 flex items-center justify-center animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    alt="Full size"
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                />
            </div>

            {/* Hint text */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                Press ESC or click outside to close
            </div>
        </div>
    );
}
