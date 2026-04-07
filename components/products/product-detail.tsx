'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Product, ProductStatus, ProductVariant } from '@/types';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ChevronLeft, ChevronRight, X, Share2, Copy, Check } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { supabaseProductService } from '@/services/supabaseProductService';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

interface ProductDetailProps {
    product: Product;
    currency: 'CLP' | 'USD';
    onClose: () => void;
    /** Optional: list of products for prev/next navigation */
    siblingProducts?: Product[];
    onNavigate?: (product: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, currency, onClose, siblingProducts, onNavigate }) => {
    const { settings, addToast } = useStore();
    const { addItem } = useCart();
    const [activeImg, setActiveImg] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [imgLoadedSet, setImgLoadedSet] = useState<Set<number>>(new Set([0]));
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Initialize with primary variant or first variant
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() => {
        if (product.variants && product.variants.length > 0) {
            return product.variants.find(v => v.isPrimary) || product.variants[0];
        }
        return null;
    });

    // Reset state when product changes (for prev/next navigation)
    useEffect(() => {
        setActiveImg(0);
        setImgLoadedSet(new Set([0]));
        setIsAdding(false);
        setIsCopied(false);
        if (product.variants && product.variants.length > 0) {
            setSelectedVariant(product.variants.find(v => v.isPrimary) || product.variants[0]);
        } else {
            setSelectedVariant(null);
        }
        // Scroll back to top of detail
        scrollContainerRef.current?.scrollTo({ top: 0 });
    }, [product.id]);

    const imagesToDisplay = useMemo(() => {
        if (selectedVariant?.images && selectedVariant.images.length > 0) {
            return selectedVariant.images;
        }
        return product.images;
    }, [selectedVariant, product.images]);

    const exchangeRate = settings?.usd_exchange_rate || 950;
    const currentPrice = useMemo(() => {
        const base = selectedVariant ? selectedVariant.price : product.price;
        return currency === 'CLP' ? base : Math.round(base / exchangeRate);
    }, [selectedVariant, product.price, currency, exchangeRate]);

    // Swipe Logic (mobile)
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    }, []);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    }, []);

    const onTouchEnd = useCallback(() => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > minSwipeDistance) {
            setActiveImg(prev => prev === imagesToDisplay.length - 1 ? 0 : prev + 1);
        }
        if (distance < -minSwipeDistance) {
            setActiveImg(prev => prev === 0 ? imagesToDisplay.length - 1 : prev - 1);
        }
    }, [touchStart, touchEnd, imagesToDisplay.length]);

    // Mark image as loaded
    const handleImgLoad = useCallback((idx: number) => {
        setImgLoadedSet(prev => {
            const next = new Set(prev);
            next.add(idx);
            return next;
        });
    }, []);

    const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            await supabaseProductService.incrementWhatsappClicks(product.id);
            const variantName = selectedVariant ? selectedVariant.name : undefined;
            addItem(product, 1, variantName);
            addToast('success', 'Añadido a cotización');
            onClose();
        } catch {
            addToast('error', 'Error al añadir');
        } finally {
            setIsAdding(false);
        }
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/product/${product.id}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Varmina - ${product.name}`,
                    text: `Mira esta joya increíble: ${product.name}`,
                    url,
                });
            } catch {
                // User cancelled or failed
            }
        } else {
            setIsShareModalOpen(true);
        }
    };

    const handleCopyLink = async () => {
        const url = `${window.location.origin}/product/${product.id}`;
        try {
            await navigator.clipboard.writeText(url);
            setIsCopied(true);
            addToast('success', 'Enlace copiado al portapapeles');
            setTimeout(() => setIsCopied(false), 2000);
        } catch {
            addToast('error', 'No se pudo copiar el enlace');
        }
    };

    // Prev / Next product navigation
    const currentIdx = siblingProducts?.findIndex(p => p.id === product.id) ?? -1;
    const prevProduct = siblingProducts && currentIdx > 0 ? siblingProducts[currentIdx - 1] : null;
    const nextProduct = siblingProducts && currentIdx >= 0 && currentIdx < siblingProducts.length - 1 ? siblingProducts[currentIdx + 1] : null;

    const isSoldOut = product.status === ProductStatus.SOLD_OUT;
    const isVariantSoldOut = selectedVariant ? (selectedVariant.stock !== undefined && selectedVariant.stock <= 0) : false;

    // Split description into short summary and full details
    const { summary, details } = useMemo(() => {
        if (!product.description) return { summary: '', details: '' };
        const text = product.description;
        // Split at first double-newline or after ~200 chars at a period
        const doubleNewline = text.indexOf('\n\n');
        if (doubleNewline > 0 && doubleNewline < 300) {
            return { summary: text.slice(0, doubleNewline), details: text.slice(doubleNewline + 2) };
        }
        // Find a period near 200 chars
        const cutoff = text.indexOf('.', 150);
        if (cutoff > 0 && cutoff < 350) {
            return { summary: text.slice(0, cutoff + 1), details: text.slice(cutoff + 1).trim() };
        }
        return { summary: text, details: '' };
    }, [product.description]);

    return (
        <div
            ref={scrollContainerRef}
            className="flex flex-col h-full md:h-auto overflow-y-auto overflow-x-hidden bg-white dark:bg-stone-900 md:rounded-lg max-w-5xl w-full mx-auto relative shadow-2xl animate-slide-up-mobile md:animate-scale-in select-none"
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-30 p-2 bg-white/80 dark:bg-stone-900/80 rounded-full text-stone-900 dark:text-white hover:bg-gold-500 hover:text-white transition-all backdrop-blur-sm shadow-sm"
                aria-label="Cerrar"
            >
                <X className="w-5 h-5" />
            </button>

            {/* ─── DESKTOP LAYOUT ─── */}
            {/* Image Gallery - Full Width on Desktop */}
            <div className="w-full relative">
                {/* Main Image */}
                <div
                    className="w-full aspect-[3/4] md:aspect-[16/9] md:max-h-[480px] relative overflow-hidden bg-stone-50 dark:bg-stone-900 group"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {/* Only render active image + adjacent for preloading, not ALL */}
                    {imagesToDisplay.map((img: string, idx: number) => {
                        // Only mount active, previous, and next images
                        const isActive = activeImg === idx;
                        const isAdjacent = Math.abs(activeImg - idx) <= 1 ||
                            (activeImg === 0 && idx === imagesToDisplay.length - 1) ||
                            (activeImg === imagesToDisplay.length - 1 && idx === 0);
                        if (!isActive && !isAdjacent) return null;

                        return (
                            <img
                                key={`${product.id}-${img}-${idx}`}
                                src={img}
                                className={cn(
                                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out",
                                    isActive ? "opacity-100 z-10" : "opacity-0 z-0"
                                )}
                                alt={product.name}
                                draggable={false}
                                loading={idx === 0 ? "eager" : "lazy"}
                                onLoad={() => handleImgLoad(idx)}
                            />
                        );
                    })}

                    {/* Loading skeleton for main image */}
                    {!imgLoadedSet.has(activeImg) && (
                        <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-stone-700 z-0" />
                    )}

                    {/* Image counter */}
                    {imagesToDisplay.length > 1 && (
                        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider z-20">
                            {activeImg + 1} / {imagesToDisplay.length}
                        </div>
                    )}

                    {/* Navigation Arrows */}
                    {imagesToDisplay.length > 1 && (
                        <>
                            <div className="absolute inset-y-0 left-0 flex items-center pl-2 md:pl-4 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === 0 ? imagesToDisplay.length - 1 : prev - 1); }}
                                    className="p-2 md:p-3 bg-white/30 dark:bg-black/30 hover:bg-white text-stone-900 dark:text-white rounded-full transition-all backdrop-blur-sm"
                                    aria-label="Imagen anterior"
                                >
                                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                                </button>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:pr-4 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === imagesToDisplay.length - 1 ? 0 : prev + 1); }}
                                    className="p-2 md:p-3 bg-white/30 dark:bg-black/30 hover:bg-white text-stone-900 dark:text-white rounded-full transition-all backdrop-blur-sm"
                                    aria-label="Imagen siguiente"
                                >
                                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Thumbnail Strip - Desktop: horizontal scrollable strip below the main image */}
                {imagesToDisplay.length > 1 && (
                    <div className="hidden md:flex items-center gap-2 px-6 py-3 bg-stone-50 dark:bg-stone-800/50 overflow-x-auto hide-scrollbar">
                        {imagesToDisplay.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setActiveImg(idx); }}
                                className={cn(
                                    "w-16 h-16 shrink-0 border-2 rounded-md overflow-hidden transition-all duration-300",
                                    activeImg === idx
                                        ? "border-gold-500 shadow-md scale-105 opacity-100 ring-1 ring-gold-500/30"
                                        : "border-transparent opacity-60 hover:opacity-100 hover:border-stone-300 dark:hover:border-stone-600"
                                )}
                                aria-label={`Ver imagen ${idx + 1}`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt="" draggable={false} loading="lazy" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Mobile Thumbnails (dots) */}
                {imagesToDisplay.length > 1 && (
                    <div className="flex md:hidden justify-center gap-1.5 py-3 bg-white dark:bg-stone-900">
                        {imagesToDisplay.map((_: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImg(idx)}
                                className={cn(
                                    "rounded-full transition-all duration-300",
                                    activeImg === idx
                                        ? "w-6 h-1.5 bg-gold-500"
                                        : "w-1.5 h-1.5 bg-stone-300 dark:bg-stone-600"
                                )}
                                aria-label={`Ver imagen ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ─── INFO SECTION ─── Full-width, organized into columns on desktop */}
            <div className="w-full p-6 md:px-10 md:py-8 bg-white dark:bg-stone-900">
                {/* Top row: Name/Price/Status + Action side by side on desktop */}
                <div className="md:flex md:gap-10 md:items-start">
                    {/* Left column: Product info */}
                    <div className="md:flex-1 md:min-w-0">
                        {product.collections && product.collections.length > 0 && (
                            <span className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.25em] mb-2 block">
                                {product.collections.join(' · ')}
                            </span>
                        )}
                        <h2 className="font-serif text-2xl md:text-3xl text-stone-900 dark:text-white mb-2 tracking-wide leading-tight">
                            {product.name}
                        </h2>

                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-xl md:text-2xl font-light text-stone-900 dark:text-gold-200">
                                {formatPrice(currentPrice, currency)}
                            </span>
                            <StatusBadge status={product.status} />
                        </div>

                        {/* Short Description Summary */}
                        {summary && (
                            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-4 md:mb-0 max-w-2xl">
                                {summary}
                            </p>
                        )}
                    </div>

                    {/* Right column: Variants + CTA */}
                    <div className="md:w-72 md:shrink-0 md:sticky md:top-4">
                        {/* Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-4">
                                <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2 block">
                                    {product.variants.length > 1 ? 'Seleccionar Opción' : 'Opción'}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => { setSelectedVariant(v); setActiveImg(0); }}
                                            className={cn(
                                                "px-4 py-2.5 text-xs font-medium border rounded-full transition-all duration-300",
                                                selectedVariant?.id === v.id
                                                    ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white shadow-lg"
                                                    : "bg-transparent text-stone-500 border-stone-200 hover:border-gold-500 hover:text-stone-900 dark:hover:text-white"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{v.name}</span>
                                                {v.stock !== undefined && (
                                                    <span className={cn(
                                                        "text-[8px] uppercase tracking-tighter",
                                                        v.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-500 font-bold"
                                                    )}>
                                                        {v.stock > 0 ? `${v.stock} disp.` : 'Agotado'}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA Button */}
                        <Button
                            className="w-full py-4 text-xs md:text-sm tracking-[0.2em] bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-200 text-white dark:text-stone-900 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                            disabled={isSoldOut || isVariantSoldOut}
                            onClick={handleAddToCart}
                            isLoading={isAdding}
                        >
                            {isSoldOut || isVariantSoldOut ? 'Agotado' : 'Añadir a cotizar'}
                        </Button>

                        {/* Secondary actions */}
                        <div className="flex items-center justify-center gap-4 mt-3">
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-400 hover:text-gold-500 transition-colors"
                            >
                                <Share2 className="w-3.5 h-3.5" />
                                Compartir
                            </button>
                        </div>

                        <div className="flex items-center justify-center mt-2">
                            <span className="text-[10px] uppercase tracking-widest text-stone-400 opacity-60">
                                Envíos disponibles a todo Chile
                            </span>
                        </div>
                    </div>
                </div>

                {/* Full description details (below the fold, full width) */}
                {details && (
                    <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800">
                        <div className="prose-brand font-sans text-sm whitespace-pre-line text-stone-600 dark:text-stone-300 leading-relaxed max-w-3xl">
                            {details}
                        </div>
                    </div>
                )}
            </div>

            {/* ─── PREV / NEXT NAVIGATION ─── */}
            {siblingProducts && siblingProducts.length > 1 && onNavigate && (
                <div className="hidden md:flex items-center justify-between px-10 py-4 bg-stone-50 dark:bg-stone-800/30 border-t border-stone-100 dark:border-stone-800">
                    <button
                        onClick={() => prevProduct && onNavigate(prevProduct)}
                        disabled={!prevProduct}
                        className={cn(
                            "flex items-center gap-3 text-xs uppercase tracking-widest transition-all group/nav",
                            prevProduct
                                ? "text-stone-500 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                                : "text-stone-300 dark:text-stone-700 cursor-not-allowed"
                        )}
                    >
                        <ChevronLeft className="w-4 h-4 group-hover/nav:-translate-x-1 transition-transform" />
                        <div className="flex flex-col items-start">
                            <span className="text-[9px] text-stone-400 font-bold">Anterior</span>
                            {prevProduct && (
                                <span className="font-serif text-sm normal-case tracking-normal">{prevProduct.name}</span>
                            )}
                        </div>
                    </button>

                    <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                        {currentIdx + 1} / {siblingProducts.length}
                    </div>

                    <button
                        onClick={() => nextProduct && onNavigate(nextProduct)}
                        disabled={!nextProduct}
                        className={cn(
                            "flex items-center gap-3 text-xs uppercase tracking-widest transition-all group/nav",
                            nextProduct
                                ? "text-stone-500 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                                : "text-stone-300 dark:text-stone-700 cursor-not-allowed"
                        )}
                    >
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-stone-400 font-bold">Siguiente</span>
                            {nextProduct && (
                                <span className="font-serif text-sm normal-case tracking-normal">{nextProduct.name}</span>
                            )}
                        </div>
                        <ChevronRight className="w-4 h-4 group-hover/nav:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}

            {/* Share Fallback Modal */}
            <Modal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title="Compartir Joya"
                size="sm"
            >
                <div className="space-y-6">
                    <p className="text-sm text-stone-500 dark:text-stone-400 text-center">
                        Copia el enlace para compartir esta pieza exclusiva.
                    </p>

                    <div className="flex items-center gap-2 p-2 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                        <input
                            type="text"
                            readOnly
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/product/${product.id}`}
                            className="flex-1 bg-transparent text-xs text-stone-600 dark:text-stone-300 focus:outline-none px-2"
                        />
                        <button
                            onClick={handleCopyLink}
                            className={cn(
                                "p-2 rounded-md transition-all active:scale-95",
                                isCopied
                                    ? "bg-green-500 text-white"
                                    : "bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:opacity-90"
                            )}
                        >
                            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={() => setIsShareModalOpen(false)}
                            className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
