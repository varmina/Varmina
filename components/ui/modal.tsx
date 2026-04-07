'use client';

import React, { ReactNode, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            return () => {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    // Close on Escape
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const sizeClasses: Record<string, string> = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-[95vw]'
    };

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4"
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Modal'}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                className={cn(
                    "relative bg-white dark:bg-stone-900 w-full flex flex-col shadow-2xl overflow-hidden",
                    "animate-slide-up-mobile md:animate-scale-in",
                    "rounded-t-[2rem] md:rounded-2xl",
                    "max-h-[92vh] md:max-h-[90vh]",
                    "mb-safe-bottom",
                    sizeClasses[size]
                )}
            >
                {title && (
                    <div className="flex items-center justify-between p-6 md:p-8 border-b border-stone-100 dark:border-stone-800 sticky top-0 bg-white dark:bg-stone-900 z-10 rounded-t-3xl md:rounded-t-2xl">
                        <h3 className="font-serif text-sm md:text-xl uppercase tracking-[0.2em] text-stone-900 dark:text-gold-200 font-medium pr-8 line-clamp-1">
                            {title}
                        </h3>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                                aria-label="Cerrar diálogo"
                            >
                                <X className="w-5 h-5 text-stone-400" />
                            </button>
                        )}
                    </div>
                )}

                {showCloseButton && !title && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-[50] p-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md rounded-full shadow-lg hover:rotate-90 transition-all duration-300"
                        aria-label="Cerrar diálogo"
                    >
                        <X className="w-5 h-5 text-stone-900 dark:text-white" />
                    </button>
                )}
                <div className={cn(title ? "" : "", "overflow-y-auto flex-1 h-full pb-10 md:pb-0")}>
                    <div className={title ? "p-6 md:p-8 pt-2 md:pt-8" : "p-0"}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
