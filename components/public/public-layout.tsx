/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
import { APP_NAME } from '@/lib/constants';
import { Sun, Moon, ShoppingBag, Menu, X, Instagram, Facebook, ArrowUp, MessageCircle } from 'lucide-react';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { BrandLoader } from '@/components/ui/brand-loader';
import { cn } from '@/lib/utils';

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
);

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currency, toggleCurrency, settings, loading, attributes } = useStore();
    const { darkMode, toggleDarkMode, setDarkMode } = useTheme();
    const { totalItems, setIsOpen } = useCart();
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isPreloading, setIsPreloading] = useState(true);

    useEffect(() => { setMounted(true); }, []);

    // Default to Light Mode on public
    useEffect(() => { setDarkMode(false); }, [setDarkMode]);

    // Detect scroll for header elevation and scroll-to-top visibility
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            setShowScrollTop(window.scrollY > 600);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const whatsappNumber = (settings as any)?.phone?.replace(/\+/g, '').replace(/\s/g, '') || "569XXXXXXXX"; // Fallback
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hola!%20Me%20gustaría%20más%20información%20sobre%20sus%20joyas.`;

    const year = mounted ? new Date().getFullYear() : 2026;

    const handleCurrencyToggle = () => {
        toggleCurrency();
    };

    const categories = attributes?.filter(a => a.type === 'category') || [];
    const collections = attributes?.filter(a => a.type === 'collection') || [];

    return (
        <div className={cn(
            "min-h-screen flex flex-col transition-colors duration-500",
            mounted && darkMode ? 'dark bg-stone-950' : 'bg-stone-50'
        )}>
            {loading && !isPreloading && <LoadingScreen />}
            <BrandLoader onComplete={() => setIsPreloading(false)} />

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
                    <Link href="/" className="text-[10px] font-bold tracking-[0.25em] text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all uppercase">
                        Inicio
                    </Link>
                    {categories.map((cat) => (
                        <Link 
                            key={cat.id} 
                            href={`/category/${encodeURIComponent(cat.name)}`}
                            className="text-[10px] font-bold tracking-[0.25em] text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all hover:-translate-y-0.5 uppercase"
                        >
                            {cat.name}
                        </Link>
                    ))}
                    {collections.length > 0 && (
                        <Link 
                            href="/catalog?view=collections"
                            className="text-[10px] font-bold tracking-[0.25em] text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all hover:-translate-y-0.5 uppercase"
                        >
                            Colecciones
                        </Link>
                    )}
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
                            <Link 
                                href="/" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block text-lg font-serif tracking-[0.1em] text-stone-900 dark:text-white"
                            >
                                INICIO
                            </Link>
                            {categories.map((cat) => (
                                <Link 
                                    key={cat.id} 
                                    href={`/category/${encodeURIComponent(cat.name)}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-lg font-serif tracking-[0.1em] text-stone-900 dark:text-white uppercase"
                                >
                                    {cat.name}
                                </Link>
                            ))}
                            {collections.length > 0 && (
                                <Link 
                                    href="/catalog?view=collections"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-lg font-serif tracking-[0.1em] text-stone-900 dark:text-white uppercase"
                                >
                                    COLECCIONES
                                </Link>
                            )}
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
            <main className="flex-1 w-full relative">
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
            
            {/* Floating Contact & Navigation */}
            <div className="fixed bottom-6 right-6 flex flex-col items-center gap-4 z-[100] preserve-3d">
                <div className="relative flex items-center justify-center">
                    {/* WhatsApp Button (Back/Persistent) */}
                    <a 
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-green-500/30 transition-all hover:scale-105 animate-pulse-whatsapp"
                        aria-label="Contactar por WhatsApp"
                    >
                        <WhatsAppIcon />
                    </a>

                    {/* Scroll to Top (Fades in over/displaces focus) */}
                    <div className={cn(
                        "absolute inset-0 transition-all duration-500 ease-in-out transform",
                        showScrollTop ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-90 pointer-events-none"
                    )}>
                        <button 
                            onClick={scrollToTop} 
                            className="w-full h-full bg-white dark:bg-stone-900 text-stone-900 dark:text-white rounded-full flex items-center justify-center shadow-xl border border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all active:scale-95"
                            aria-label="Subir arriba"
                        >
                            <ArrowUp className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
