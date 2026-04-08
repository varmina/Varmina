'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export const BrandLoader: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Only show if not seen in the last 24 hours
        const lastSeen = localStorage.getItem('varmina_preloader_seen');
        const now = new Date().getTime();
        
        if (typeof window === 'undefined') return;

        if (!lastSeen || now - parseInt(lastSeen) > 24 * 60 * 60 * 1000) {
            setShouldRender(true);
            // Hide after 2.5s total (animation 2s + fade-out 0.5s)
            const timer = setTimeout(() => {
                setIsVisible(false);
                localStorage.setItem('varmina_preloader_seen', now.toString());
                window.scrollTo(0, 0);
                
                // Final cleanup after fade out
                setTimeout(() => {
                    setShouldRender(false);
                    if (onComplete) onComplete();
                }, 1000);
            }, 2500);

            return () => clearTimeout(timer);
        } else {
            if (onComplete) onComplete();
        }
    }, [onComplete]);

    if (!shouldRender) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-[10000] flex items-center justify-center bg-[#0C0A09] transition-all duration-1000 ease-in-out",
            isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/5 blur-[120px] rounded-full animate-pulse" />
            </div>

            <div className="relative flex flex-col items-center gap-12 scale-90 md:scale-100">
                {/* Visual Ornament */}
                <div className="relative w-24 h-24 mb-4">
                    {/* Rotating Rings */}
                    <div className="absolute inset-0 border-t border-gold-400/30 rounded-full animate-[spin_3s_linear_infinite]" />
                    <div className="absolute inset-2 border-b border-gold-500/20 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                    
                    {/* Center Diamond */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-gold-500 rotate-45 shadow-[0_0_20px_rgba(170,140,44,0.6)] animate-pulse" />
                    </div>
                </div>

                {/* Animated Text */}
                <div className="flex flex-col items-center">
                    <div className="overflow-hidden">
                        <h1 className="font-serif text-4xl md:text-6xl tracking-[0.4em] text-white uppercase select-none relative pb-2">
                             Varmina
                            {/* Golden Shine Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite]" />
                        </h1>
                    </div>
                    
                    <div className="w-12 h-[1px] bg-gold-500/60 mt-4 animate-line-expand" />
                    
                    <p className="mt-8 text-[9px] md:text-[10px] tracking-[0.8em] text-gold-200/40 uppercase font-light animate-fade-blur">
                        Joyas que Trascienden
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes shine {
                    0% { transform: translateX(-200%) skewX(-20deg); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(200%) skewX(-20deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
};
