'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
import { APP_NAME } from '@/lib/constants';
import { Sun, Moon, ShoppingBag } from 'lucide-react';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { ToastContainer } from '@/components/ui/toast-container';
import { LoadingScreen } from '@/components/ui/loading-screen';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currency, toggleCurrency, settings, loading } = useStore();
    const { darkMode, toggleDarkMode, setDarkMode } = useTheme();
    const { totalItems, setIsOpen } = useCart();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // Mark as mounted after first client render
    useEffect(() => {
        setMounted(true);
    }, []);

    // Default to Light Mode on Public Layout
    useEffect(() => {
        setDarkMode(false);
    }, [setDarkMode]);

    // Use a stable year value for SSR consistency
    const year = mounted ? new Date().getFullYear() : 2026;

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-500 ${mounted && darkMode ? 'dark bg-stone-950' : 'bg-stone-50'}`}>
            {loading && <LoadingScreen />}

            {/* Announcement Bar */}
            {settings?.announcement_text && (
                <div
                    className="w-full py-2 px-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500"
                    style={{
                        backgroundColor: settings.announcement_color || '#b49f4c',
                        color: 'white'
                    }}
                >
                    {settings.announcement_text}
                </div>
            )}

            {/* Public Header */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur border-b border-stone-200 dark:border-stone-800 h-16 flex items-center justify-between px-4 md:px-6 transition-colors">

                {/* Logo Area */}
                <div className="flex items-center gap-4 md:gap-8">
                    <Link href="/">
                        <h1
                            className="font-serif text-lg md:text-2xl tracking-widest text-stone-900 dark:text-gold-200 cursor-pointer select-none uppercase"
                        >
                            {settings?.brand_name || APP_NAME}
                        </h1>
                    </Link>
                </div>

                {/* Public Actions */}
                <div className="flex items-center gap-1 md:gap-2">
                    <button onClick={() => setIsOpen(true)} className="relative p-2 md:p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors" title="Ver Cotización">
                        <ShoppingBag className="w-4 h-4" />
                        {totalItems > 0 && (
                            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </button>
                    <button onClick={toggleCurrency} className="p-2 md:p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors" title="Cambiar Moneda">
                        <span className="font-serif font-bold text-xs">{currency}</span>
                    </button>
                    <button onClick={toggleDarkMode} className="p-2 md:p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors" title="Cambiar Tema">
                        {mounted && darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full flex flex-col items-center justify-start">
                {children}
            </main>

            {/* Footer */}
            <footer className="relative border-t border-stone-100 dark:border-stone-800 py-20 px-6 bg-white dark:bg-[#0A0A0A]">
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
                    {/* Premium Divider */}
                    <div className="premium-divider w-16" />

                    {/* Brand Mark */}
                    <h3 className="font-serif text-xl tracking-[0.4em] text-stone-300 dark:text-stone-700 uppercase select-none">
                        {settings?.brand_name || APP_NAME}
                    </h3>

                    {/* Social Links */}
                    <div className="flex items-center gap-8">
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
                    <div className="flex flex-col items-center gap-3 pt-4">
                        <Link href="/admin">
                            <p className="text-[9px] text-stone-400 uppercase tracking-[0.4em] font-light cursor-pointer hover:text-stone-600 transition-colors">
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
