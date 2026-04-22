/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
import { APP_NAME } from '@/lib/constants';
import { Sun, Moon, ShoppingBag, Menu, X, Instagram, ArrowUp, Search, Mail, Phone, MapPin } from 'lucide-react';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { BrandLoader } from '@/components/ui/brand-loader';
import { cn } from '@/lib/utils';
import { usePublicProducts } from '@/hooks/use-public-products';
import { formatPrice } from '@/lib/format';
import { FooterLinkGroup } from '@/services/settingsService';
import Image from 'next/image';

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
);

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.87a8.18 8.18 0 004.76 1.52V6.93a4.85 4.85 0 01-1-.24z"/>
    </svg>
);

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currency, toggleCurrency, settings, loading, attributes } = useStore();
    const { darkMode, toggleDarkMode, setDarkMode } = useTheme();
    const { totalItems, setIsOpen } = useCart();
    const { products } = usePublicProducts();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isPreloading, setIsPreloading] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { setMounted(true); }, []);

    // Default to Light Mode on public
    useEffect(() => { setDarkMode(false); }, [setDarkMode]);

    // Close mobile menu on route change
    useEffect(() => { setIsMobileMenuOpen(false); setIsSearchOpen(false); }, [pathname]);

    // Lock body scroll when mobile menu or search is open
    useEffect(() => {
        if (isMobileMenuOpen || isSearchOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen, isSearchOpen]);

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

    const whatsappNumber = settings?.whatsapp_number || "56944106742";
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=Hola!%20Me%20gustaría%20saber%20más%20información%20sobre%20sus%20joyas.`;

    const year = mounted ? new Date().getFullYear() : 2026;

    const handleCurrencyToggle = () => { toggleCurrency(); };

    const categories = attributes?.filter(a => a.type === 'category') || [];
    const collections = attributes?.filter(a => a.type === 'collection') || [];

    // Search results
    const searchResults = searchQuery.trim().length >= 2
        ? products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 6)
        : [];

    // Active link helper
    const isActive = useCallback((href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    }, [pathname]);

    // Footer link groups from settings
    const footerLinks: FooterLinkGroup[] = settings?.footer_links || [];

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
                "sticky top-0 z-50 h-14 md:h-24 flex items-center justify-between px-4 md:px-16 transition-all duration-700",
                isPreloading ? "opacity-0" : "opacity-100",
                scrolled
                    ? "bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl shadow-sm border-b border-stone-100 dark:border-stone-800"
                    : "bg-white/90 dark:bg-stone-900/90 backdrop-blur border-b border-stone-200 dark:border-stone-800"
            )}>
                {/* Mobile Menu Button */}
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden p-1.5 text-stone-600 dark:text-stone-400 hover:text-gold-600 transition-colors"
                >
                    <Menu className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {/* Logo */}
                <Link href="/" className="group absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
                    <h1 className="font-serif text-lg md:text-2xl tracking-[0.15em] md:tracking-[0.3em] text-stone-900 dark:text-gold-200 cursor-pointer select-none uppercase group-hover:text-gold-600 transition-colors duration-300 whitespace-nowrap">
                        {settings?.brand_name || APP_NAME}
                    </h1>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-10">
                    <Link href="/" className={cn(
                        "text-[10px] font-bold tracking-[0.25em] transition-all uppercase",
                        isActive('/') ? "text-stone-900 dark:text-white" : "text-stone-400 hover:text-stone-900 dark:hover:text-white hover:-translate-y-0.5"
                    )}>Inicio</Link>
                    {categories.map((cat) => (
                        <Link 
                            key={cat.id} 
                            href={`/category/${encodeURIComponent(cat.name)}`}
                            className={cn(
                                "text-[10px] font-bold tracking-[0.25em] transition-all uppercase",
                                isActive(`/category/${encodeURIComponent(cat.name)}`) ? "text-stone-900 dark:text-white" : "text-stone-400 hover:text-stone-900 dark:hover:text-white hover:-translate-y-0.5"
                            )}
                        >{cat.name}</Link>
                    ))}
                    {collections.length > 0 && (
                        <Link 
                            href="/collections"
                            className={cn(
                                "text-[10px] font-bold tracking-[0.25em] transition-all uppercase",
                                isActive('/collections') ? "text-stone-900 dark:text-white" : "text-stone-400 hover:text-stone-900 dark:hover:text-white hover:-translate-y-0.5"
                            )}
                        >Colecciones</Link>
                    )}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-0.5 md:gap-3">
                    {/* Search — hidden on mobile, visible md+ */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="hidden md:flex p-2.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors"
                        aria-label="Buscar"
                    >
                        <Search className="w-5 h-5" />
                    </button>

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
                        className="p-2 md:p-2.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors"
                    >
                        <span className="font-serif font-bold text-[10px] md:text-xs uppercase">{currency}</span>
                    </button>

                    {/* Cart */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="relative p-2 md:p-2.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors"
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

            {/* Search Overlay */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[70] bg-white/98 dark:bg-stone-950/98 backdrop-blur-sm animate-fade-in">
                    <div className="max-w-2xl mx-auto px-6 pt-24 md:pt-32">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-serif text-lg uppercase tracking-[0.2em] text-stone-900 dark:text-white">Buscar</h2>
                            <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                            <input
                                type="text"
                                autoFocus
                                placeholder="Buscar joyas, colecciones..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all"
                            />
                        </div>
                        {/* Results */}
                        {searchQuery.trim().length >= 2 && (
                            <div className="mt-6 space-y-2">
                                {searchResults.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-stone-400">No se encontraron resultados para &ldquo;{searchQuery}&rdquo;</p>
                                ) : (
                                    searchResults.map(p => (
                                        <Link
                                            key={p.id}
                                            href={`/product/${p.id}`}
                                            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors group"
                                        >
                                            <div className="relative w-14 h-16 bg-stone-100 dark:bg-stone-800 rounded overflow-hidden flex-shrink-0">
                                                {p.images?.[0] && (
                                                    <Image src={p.images[0]} fill sizes="56px" className="object-cover" alt={p.name} unoptimized />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider truncate group-hover:text-gold-600 transition-colors">{p.name}</p>
                                                {p.category && <p className="text-[10px] text-stone-400 uppercase tracking-wider">{p.category}</p>}
                                                <p className="text-xs text-stone-500 font-serif mt-0.5">{formatPrice(p.price, currency)}</p>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                                className={cn(
                                    "block text-lg font-serif tracking-[0.1em]",
                                    isActive('/') ? "text-gold-600" : "text-stone-900 dark:text-white"
                                )}
                            >INICIO</Link>

                            {categories.length > 0 && (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400">Categorías</p>
                                    {categories.map((cat) => (
                                        <Link 
                                            key={cat.id} 
                                            href={`/category/${encodeURIComponent(cat.name)}`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "block text-base font-serif tracking-[0.1em] pl-4 uppercase",
                                                isActive(`/category/${encodeURIComponent(cat.name)}`) ? "text-gold-600" : "text-stone-900 dark:text-white"
                                            )}
                                        >{cat.name}</Link>
                                    ))}
                                </div>
                            )}

                            {collections.length > 0 && (
                                <Link 
                                    href="/collections"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "block text-lg font-serif tracking-[0.1em] uppercase",
                                        isActive('/collections') ? "text-gold-600" : "text-stone-900 dark:text-white"
                                    )}
                                >COLECCIONES</Link>
                            )}
                        </div>

                        {/* Mobile Search Button */}
                        <button
                            onClick={() => { setIsMobileMenuOpen(false); setTimeout(() => setIsSearchOpen(true), 300); }}
                            className="flex items-center gap-3 w-full p-3 bg-stone-50 dark:bg-stone-900 rounded-lg text-sm font-bold tracking-widest text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
                        >
                            <Search className="w-4 h-4" />
                            BUSCAR
                        </button>

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
                            {settings?.instagram_url && (
                                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-gold-500 transition-colors">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                            {settings?.tiktok_url && (
                                <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-gold-500 transition-colors">
                                    <TikTokIcon />
                                </a>
                            )}
                            {settings?.facebook_url && (
                                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-gold-500 transition-colors">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </a>
                            )}
                        </div>
                        <p className="text-[10px] text-stone-400 tracking-[0.2em]">SANTIAGO, CHILE</p>
                    </div>
                </div>
            </div>

            {/* Main */}
            <main className={cn(
                "flex-1 w-full relative transition-opacity duration-700",
                isPreloading ? "opacity-0" : "opacity-100"
            )}>
                {children}
            </main>

            {/* ─── PROFESSIONAL MULTI-COLUMN FOOTER ─── */}
            <footer className={cn(
                "relative border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-[#0A0A0A] transition-opacity duration-700",
                isPreloading ? "opacity-0" : "opacity-100"
            )}>
                <div className="max-w-[1400px] mx-auto px-6 md:px-16 py-16 md:py-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
                        {/* Column 1: Brand */}
                        <div className="lg:col-span-1 space-y-5">
                            <h3 className="font-serif text-xl tracking-[0.3em] text-stone-900 dark:text-white uppercase">
                                {settings?.brand_name || APP_NAME}
                            </h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                                {settings?.footer_about_text || 'Joyería de tendencia diseñada para quienes buscan piezas únicas y con estilo.'}
                            </p>
                            <div className="flex items-center gap-4 pt-2">
                                {settings?.instagram_url && (
                                    <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-gold-500 transition-all duration-300 hover:-translate-y-0.5">
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                )}
                                {settings?.tiktok_url && (
                                    <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-gold-500 transition-all duration-300 hover:-translate-y-0.5">
                                        <TikTokIcon />
                                    </a>
                                )}
                                {settings?.facebook_url && (
                                    <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-gold-500 transition-all duration-300 hover:-translate-y-0.5">
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Dynamic Footer Link Columns from Admin */}
                        {footerLinks.map((group, gIdx) => (
                            <div key={gIdx} className="space-y-5">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-900 dark:text-white">
                                    {group.group}
                                </h4>
                                <ul className="space-y-3">
                                    {group.links.map((link, lIdx) => (
                                        <li key={lIdx}>
                                            <Link
                                                href={link.url}
                                                className="text-xs text-stone-500 dark:text-stone-400 hover:text-gold-500 transition-colors"
                                            >{link.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Last Column: Contact */}
                        <div className="space-y-5">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-900 dark:text-white">
                                Contacto
                            </h4>
                            <ul className="space-y-3">
                                {settings?.contact_email && (
                                    <li className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                                        <a href={`mailto:${settings.contact_email}`} className="text-xs text-stone-500 dark:text-stone-400 hover:text-gold-500 transition-colors">
                                            {settings.contact_email}
                                        </a>
                                    </li>
                                )}
                                {settings?.whatsapp_number && (
                                    <li className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-stone-500 dark:text-stone-400 hover:text-gold-500 transition-colors">
                                            WhatsApp
                                        </a>
                                    </li>
                                )}
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                                    <span className="text-xs text-stone-500 dark:text-stone-400">Santiago, Chile</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-16 pt-8 border-t border-stone-100 dark:border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4">
                        <Link href="/admin">
                            <p className="text-[9px] text-stone-400 uppercase tracking-[0.3em] font-light cursor-pointer hover:text-stone-600 transition-colors">
                                &copy; {year} {settings?.brand_name || APP_NAME}. Todos los derechos reservados.
                            </p>
                        </Link>
                        <div className="flex items-center gap-6">
                            <span className="text-[9px] text-stone-300 dark:text-stone-700 uppercase tracking-[0.2em]">
                                Hecho con ♥ en Chile
                            </span>
                        </div>
                    </div>
                </div>
            </footer>

            <CartDrawer />
            
            {/* Floating Contact & Navigation */}
            <div className="fixed bottom-6 right-6 flex flex-col items-center gap-4 z-[45] preserve-3d">
                {/* Scroll to Top (Appears ABOVE WhatsApp) */}
                <div className={cn(
                    "transition-all duration-500 ease-in-out transform origin-bottom",
                    showScrollTop ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-50 translate-y-10 pointer-events-none"
                )}>
                    <button 
                        onClick={scrollToTop} 
                        className="w-12 h-12 bg-white dark:bg-stone-950 text-stone-900 dark:text-white rounded-full flex items-center justify-center shadow-xl border border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all active:scale-95 group"
                        aria-label="Subir arriba"
                    >
                        <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </div>

                {/* WhatsApp Button (Fixed at the bottom) */}
                <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-green-500/30 transition-all hover:scale-105 animate-pulse-whatsapp"
                    aria-label="Contactar por WhatsApp"
                >
                    <WhatsAppIcon />
                </a>
            </div>
        </div>
    );
};
