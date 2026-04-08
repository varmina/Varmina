'use client';

import React from 'react';

export const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#0A0A0A] flex flex-col items-center justify-center gap-12 transition-all duration-700 ease-in-out animate-fade-in">
            {/* High-End Jewelry Loader */}
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Rotating Outer Ring (Gold) */}
                <div className="absolute inset-0 border-[1px] border-gold-500/10 rounded-full" />
                <div className="absolute inset-0 border-t-[3px] border-gold-500 rounded-full animate-[spin_3s_linear_infinite] shadow-[0_0_20px_rgba(212,175,55,0.15)]" />
                
                {/* Counter-Rotating Inner Ring (Stone) */}
                <div className="absolute inset-6 border-[1px] border-stone-200 dark:border-stone-800 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
                <div className="absolute inset-6 border-b-[2px] border-stone-400 dark:border-stone-600 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
                
                {/* Center Sparkle / Diamond Core */}
                <div className="relative">
                    <div className="w-3 h-3 bg-gold-400 rotate-45 animate-pulse shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
                    {/* Subtle aura */}
                    <div className="absolute inset-0 w-3 h-3 bg-gold-500/20 blur-md rounded-full animate-pulse scale-150" />
                </div>
            </div>

            {/* Brand Signature */}
            <div className="flex flex-col items-center gap-6">
                <h2 className="font-serif text-3xl md:text-5xl tracking-[0.6em] text-stone-900 dark:text-white uppercase select-none animate-reveal pb-2">
                    Varmina
                </h2>
                <div className="w-16 h-[1px] bg-gold-500 animate-line-expand opacity-50" />
            </div>
        </div>
    );
};
