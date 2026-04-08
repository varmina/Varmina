/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
import { APP_NAME } from '@/lib/constants';
import { Sun, Moon, ShoppingBag, Menu, X, Instagram, Facebook } from 'lucide-react';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { cn } from '@/lib/utils';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currency, toggleCurrency, settings, loading, addToast } = useStore();
    const { darkMode, toggleDarkMode, setDarkMode } = useTheme();
    const { totalItems, setIsOpen } = useCart();
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                "sticky top-0 z-50 h-16 md:h-24 flex items-center justify-between px-6 md:px-16 transition-all duration-300",
                scrolled
                    ? "bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl shadow-sm border-b border-stone-100 dark:border-stone-800"
                    : "bg-white/90 dark:bg-stone-900/90 backdrop-blur border-b border-stone-200 dark:border-stone-800"
            )}>
                {/* Mobile Menu Button */}
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden p-2 text-stone-600 dark:text-stone-400 hover:text-gold-600 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Logo */}
                <Link href="/" className="group absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
                    <h1 className="font-serif text-xl md:text-2xl tracking-[0.3em] text-stone-900 dark:text-gold-200 cursor-pointer select-none uppercase group-hover:text-gold-600 transition-colors duration-300">
                        {settings?.brand_name || APP_NAME}
                    </h1>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-10">
                    {['INICIO', 'ANILLOS', 'COLLARES', 'PENDIENTES', 'COLECCIONES'].map((item) => (
                        <Link 
                            key={item} 
                            href={item === 'INICIO' ? '/' : `/category/${item.toLowerCase()}`}
                            className="text-[10px] font-bold tracking-[0.25em] text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all hover:-translate-y-0.5"
                        >
                            {item}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-1 md:gap-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="hidden md:flex p-2.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors"
                    >
                        {mounted && darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Currency Toggle */}
                    <button
                        onClick={handleCurrencyToggle}
                        className="p-2.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors"
                    >
                        <span className="font-serif font-bold text-xs uppercase">{currency}</span>
                    </button>

                    {/* Cart */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="relative p-2.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        {totalItems > 0 && (
                            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-gold-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center px-1">
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Drawer */}
            <div className={cn(
                "fixed inset-0 z-[60] lg:hidden transition-all duration-500",
                isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <div 
                    className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
                <div className={cn(
                    "absolute top-0 left-0 bottom-0 w-80 bg-white dark:bg-stone-950 shadow-2xl transition-transform duration-500 ease-out flex flex-col",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="p-6 flex items-center justify-between border-b border-stone-100 dark:border-stone-900">
                        <span className="font-serif text-lg tracking-[0.2em] uppercase">{settings?.brand_name}</span>
                        <button onClick={() => setIsMobileMenuOpen(false)}>
                            <X className="w-6 h-6 text-stone-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        <div className="space-y-6">
                            {['INICIO', 'ANILLOS', 'COLLARES', 'PENDIENTES', 'COLECCIONES'].map((item) => (
                                <Link 
                                    key={item} 
                                    href={item === 'INICIO' ? '/' : `/category/${item.toLowerCase()}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-lg font-serif tracking-[0.1em] text-stone-900 dark:text-white"
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>

                        <div className="h-px bg-stone-100 dark:bg-stone-900" />

                        <div className="space-y-4">
                            <button 
                                onClick={toggleDarkMode}
                                className="flex items-center gap-3 text-sm font-bold tracking-widest text-stone-400"
                            >
                                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                {darkMode ? 'MODO CLARO' : 'MODO OSCURO'}
                            </button>
                            <button 
                                onClick={handleCurrencyToggle}
                                className="flex items-center gap-3 text-sm font-bold tracking-widest text-stone-400 uppercase"
                            >
                                <span className="font-serif text-stone-900 dark:text-white">{currency}</span>
                                CAMBIAR MONEDA
                            </button>
                        </div>
                    </div>

                    <div className="p-8 border-t border-stone-100 dark:border-stone-900">
                        <div className="flex items-center gap-6 mb-4">
                            {settings?.instagram_url && <Instagram className="w-5 h-5 text-stone-400" />}
                            {settings?.facebook_url && <Facebook className="w-5 h-5 text-stone-400" />}
                        </div>
                        <p className="text-[10px] text-stone-400 tracking-[0.2em]">SANTIAGO, CHILE</p>
                    </div>
                </div>
            </div>

            {/* Main */}
            <main className="flex-1 w-full flex flex-col items-center justify-start">
                {children}
            </main>

            {/* Footer */}
            <footer className="relative border-t border-stone-100 dark:border-stone-800 py-12 md:py-24 px-8 bg-white dark:bg-[#0A0A0A]">
                <div className="max-w-[1600px] mx-auto flex flex-col items-center gap-8 md:gap-10">
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
        </div>
    );
};
