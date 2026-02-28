'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
import { APP_NAME } from '@/lib/constants';
import { Sun, Moon, ShoppingBag } from 'lucide-react';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { ToastContainer } from '@/components/ui/toast-container';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { cn } from '@/lib/utils';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currency, toggleCurrency, settings, loading, addToast } = useStore();
    const { darkMode, toggleDarkMode, setDarkMode } = useTheme();
    const { totalItems, setIsOpen } = useCart();
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // Default to Light Mode on public
    useEffect(() => { setDarkMode(false); }, [setDarkMode]);

    // Detect scroll for header elevation
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const year = mounted ? new Date().getFullYear() : 2026;

    const handleCurrencyToggle = () => {
        toggleCurrency();
    };

    return (
        <div className={cn(
            "min-h-screen flex flex-col transition-colors duration-500",
            mounted && darkMode ? 'dark bg-stone-950' : 'bg-stone-50'
        )}>
            {loading && <LoadingScreen />}

            {/* Announcement Bar */}
            {settings?.announcement_text && (
                <div
                    className="w-full py-2 px-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 animate-fade-in-down"
                    style={{
                        backgroundColor: settings.announcement_color || '#b49f4c',
                        color: 'white'
                    }}
                >
                    {settings.announcement_text}
                </div>
            )}

            {/* Header */}
            <header className={cn(
                "sticky top-0 z-40 h-16 flex items-center justify-between px-4 md:px-8 transition-all duration-300",
                scrolled
                    ? "bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl shadow-sm border-b border-stone-100 dark:border-stone-800"
                    : "bg-white/90 dark:bg-stone-900/90 backdrop-blur border-b border-stone-200 dark:border-stone-800"
            )}>
                {/* Logo */}
                <Link href="/" className="group">
                    <h1 className="font-serif text-lg md:text-2xl tracking-[0.3em] text-stone-900 dark:text-gold-200 cursor-pointer select-none uppercase group-hover:text-gold-600 transition-colors duration-300">
                        {settings?.brand_name || APP_NAME}
                    </h1>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-1 md:gap-2">
                    {/* Cart */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="relative p-2.5 md:p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors"
                        aria-label={`Ver cotización, ${totalItems} artículos`}
                    >
                        <ShoppingBag className="w-[18px] h-[18px]" />
                        {totalItems > 0 && (
                            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-gold-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center px-1 animate-scale-in">
                                {totalItems}
                            </span>
                        )}
                    </button>

                    {/* Currency Toggle */}
                    <button
                        onClick={handleCurrencyToggle}
                        className="p-2.5 md:p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors"
                        aria-label={`Moneda actual: ${currency}. Haz clic para cambiar.`}
                    >
                        <span className="font-serif font-bold text-xs">{currency}</span>
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2.5 md:p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors"
                        aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
                    >
                        {mounted && darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                    </button>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 w-full flex flex-col items-center justify-start">
                {children}
            </main>

            {/* Footer */}
            <footer className="relative border-t border-stone-100 dark:border-stone-800 py-12 md:py-20 px-6 bg-white dark:bg-[#0A0A0A]">
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 md:gap-10">
                    <div className="premium-divider w-12 md:w-16" />

                    <h3 className="font-serif text-lg md:text-xl tracking-[0.3em] md:tracking-[0.4em] text-stone-300 dark:text-stone-700 uppercase select-none">
                        {settings?.brand_name || APP_NAME}
                    </h3>

                    {/* Social Links */}
                    <div className="flex items-center gap-6 md:gap-8 flex-wrap justify-center">
                        {settings?.instagram_url && (
                            <a
                                href={settings.instagram_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-stone-400 hover:text-gold-500 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Instagram</span>
                            </a>
                        )}
                        {settings?.tiktok_url && (
                            <a
                                href={settings.tiktok_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-stone-400 hover:text-gold-500 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">TikTok</span>
                            </a>
                        )}
                    </div>

                    {/* Copyright */}
                    <div className="flex flex-col items-center gap-2 md:gap-3 pt-2 md:pt-4">
                        <Link href="/admin">
                            <p className="text-[9px] text-stone-400 uppercase tracking-[0.3em] md:tracking-[0.4em] font-light cursor-pointer hover:text-stone-600 transition-colors">
                                &copy; {year} {settings?.brand_name || APP_NAME}
                            </p>
                        </Link>
                        <p className="text-[8px] text-stone-300 dark:text-stone-800 uppercase tracking-[0.2em]">
                            Santiago, Chile
                        </p>
                    </div>
                </div>
            </footer>

            <CartDrawer />
            <ToastContainer />
        </div>
    );
};
