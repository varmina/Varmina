'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Product, ProductStatus, ProductVariant } from '@/types';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ChevronLeft, ChevronRight, Share2, Copy, Check, Truck, Shield, Package, ArrowLeft } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { supabaseProductService } from '@/services/supabaseProductService';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

interface ProductDetailProps {
    product: Product;
    currency: 'CLP' | 'USD';
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, currency }) => {
    const { settings, addToast } = useStore();
    const { addItem } = useCart();
    const [activeImg, setActiveImg] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [imgLoadedSet, setImgLoadedSet] = useState<Set<number>>(new Set([0]));

    // Initialize with primary variant or first variant
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() => {
        if (product.variants && product.variants.length > 0) {
            return product.variants.find(v => v.isPrimary) || product.variants[0];
        }
        return null;
    });

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

    const isSoldOut = product.status === ProductStatus.SOLD_OUT;
    const isVariantSoldOut = selectedVariant ? (selectedVariant.stock !== undefined && selectedVariant.stock <= 0) : false;

    return (
        <div className="w-full bg-white dark:bg-stone-950 min-h-screen">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
                <nav className="flex items-center gap-2 text-xs uppercase tracking-widest">
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        Catálogo
                    </Link>
                    <span className="text-stone-300 dark:text-stone-700">/</span>
                    {product.category && (
                        <>
                            <span className="text-stone-400">{product.category}</span>
                            <span className="text-stone-300 dark:text-stone-700">/</span>
                        </>
                    )}
                    <span className="text-stone-600 dark:text-stone-300 font-medium truncate max-w-[200px]">
                        {product.name}
                    </span>
                </nav>
            </div>

            {/* ─── SHOPIFY-STYLE TWO COLUMN LAYOUT ─── */}
            <div className="max-w-7xl mx-auto px-0 md:px-8 pb-16">
                <div className="md:grid md:grid-cols-[1fr,420px] lg:grid-cols-[1fr,460px] md:gap-10 lg:gap-16">
                    {/* LEFT: Image Gallery */}
                    <div className="w-full relative">
                        {/* Main Image - adapts to image aspect ratio */}
                        <div
                            className="w-full relative overflow-hidden bg-stone-50 dark:bg-stone-900/50 flex items-center justify-center md:rounded-lg"
                            style={{ minHeight: '350px' }}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            {/* Active image displayed with contain to show full image */}
                            {imagesToDisplay.map((img: string, idx: number) => {
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
                                            "w-full max-h-[75vh] md:max-h-[650px] object-contain transition-opacity duration-500 ease-in-out p-4 md:p-8",
                                            isActive ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 z-0"
                                        )}
                                        alt={product.name}
                                        draggable={false}
                                        loading={idx === 0 ? "eager" : "lazy"}
                                        onLoad={() => handleImgLoad(idx)}
                                    />
                                );
                            })}

                            {/* Loading skeleton */}
                            {!imgLoadedSet.has(activeImg) && (
                                <div className="absolute inset-0 animate-pulse bg-stone-100 dark:bg-stone-800 z-0" />
                            )}

                            {/* Image counter */}
                            {imagesToDisplay.length > 1 && (
                                <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider z-20">
                                    {activeImg + 1} / {imagesToDisplay.length}
                                </div>
                            )}

                            {/* Left/Right Navigation Arrows */}
                            {imagesToDisplay.length > 1 && (
                                <>
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 md:pl-4 z-20">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === 0 ? imagesToDisplay.length - 1 : prev - 1); }}
                                            className="p-2 md:p-3 bg-white/70 dark:bg-black/40 hover:bg-white dark:hover:bg-black/70 text-stone-700 dark:text-white rounded-full transition-all backdrop-blur-sm shadow-sm"
                                            aria-label="Imagen anterior"
                                        >
                                            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>
                                    </div>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:pr-4 z-20">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === imagesToDisplay.length - 1 ? 0 : prev + 1); }}
                                            className="p-2 md:p-3 bg-white/70 dark:bg-black/40 hover:bg-white dark:hover:bg-black/70 text-stone-700 dark:text-white rounded-full transition-all backdrop-blur-sm shadow-sm"
                                            aria-label="Imagen siguiente"
                                        >
                                            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Strip */}
                        {imagesToDisplay.length > 1 && (
                            <div className="flex items-center gap-2 px-4 md:px-0 py-4 overflow-x-auto hide-scrollbar">
                                {imagesToDisplay.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setActiveImg(idx); }}
                                        className={cn(
                                            "w-16 h-16 md:w-20 md:h-20 shrink-0 border-2 rounded-md overflow-hidden transition-all duration-300 bg-stone-50 dark:bg-stone-800",
                                            activeImg === idx
                                                ? "border-stone-900 dark:border-white shadow-md opacity-100"
                                                : "border-transparent opacity-50 hover:opacity-100 hover:border-stone-300 dark:hover:border-stone-600"
                                        )}
                                        aria-label={`Ver imagen ${idx + 1}`}
                                    >
                                        <img src={img} className="w-full h-full object-contain p-1" alt="" draggable={false} loading="lazy" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Mobile Dots */}
                        {imagesToDisplay.length > 1 && (
                            <div className="flex md:hidden justify-center gap-1.5 py-2">
                                {imagesToDisplay.map((_: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImg(idx)}
                                        className={cn(
                                            "rounded-full transition-all duration-300",
                                            activeImg === idx
                                                ? "w-6 h-1.5 bg-stone-900 dark:bg-white"
                                                : "w-1.5 h-1.5 bg-stone-300 dark:bg-stone-600"
                                        )}
                                        aria-label={`Ver imagen ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Product Info (sticky on desktop) */}
                    <div className="w-full md:sticky md:top-24 md:self-start">
                        <div className="px-6 md:px-0 py-6 md:py-0 space-y-6">
                            {/* Collection */}
                            {product.collections && product.collections.length > 0 && (
                                <span className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.25em] block">
                                    {product.collections.join(' · ')}
                                </span>
                            )}

                            {/* Product Name */}
                            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl text-stone-900 dark:text-white tracking-wide leading-tight">
                                {product.name}
                            </h1>

                            {/* Price & Status */}
                            <div className="flex items-center gap-4">
                                <span className="text-2xl md:text-3xl font-light text-stone-900 dark:text-white">
                                    {formatPrice(currentPrice, currency)}
                                </span>
                                <StatusBadge status={product.status} />
                            </div>

                            {/* Divider */}
                            <div className="w-full h-px bg-stone-100 dark:bg-stone-800" />

                            {/* Short Description */}
                            {product.description && (
                                <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                                    {product.description.split('\n\n')[0]}
                                </p>
                            )}

                            {/* Variants */}
                            {product.variants && product.variants.length > 0 && (
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-3 block">
                                        {product.variants.length > 1 ? 'Seleccionar Opción' : 'Opción'}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants.map((v) => (
                                            <button
                                                key={v.id}
                                                onClick={() => { setSelectedVariant(v); setActiveImg(0); }}
                                                className={cn(
                                                    "px-4 py-2.5 text-xs font-medium border rounded transition-all duration-300",
                                                    selectedVariant?.id === v.id
                                                        ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white shadow-md"
                                                        : "bg-transparent text-stone-500 border-stone-200 dark:border-stone-700 hover:border-stone-900 dark:hover:border-white hover:text-stone-900 dark:hover:text-white"
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
                                className="w-full py-4 text-sm tracking-[0.15em] bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-200 text-white dark:text-stone-900 shadow-lg hover:shadow-xl transition-all rounded"
                                disabled={isSoldOut || isVariantSoldOut}
                                onClick={handleAddToCart}
                                isLoading={isAdding}
                            >
                                {isSoldOut || isVariantSoldOut ? 'AGOTADO' : 'AÑADIR A COTIZAR'}
                            </Button>

                            {/* Secondary Actions */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors"
                                >
                                    <Share2 className="w-3.5 h-3.5" />
                                    Compartir
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-1 gap-3 pt-2">
                                <div className="flex items-center gap-3 text-stone-400">
                                    <Truck className="w-4 h-4 shrink-0" />
                                    <span className="text-[10px] uppercase tracking-widest">Envíos a todo Chile</span>
                                </div>
                                <div className="flex items-center gap-3 text-stone-400">
                                    <Shield className="w-4 h-4 shrink-0" />
                                    <span className="text-[10px] uppercase tracking-widest">Garantía de autenticidad</span>
                                </div>
                                <div className="flex items-center gap-3 text-stone-400">
                                    <Package className="w-4 h-4 shrink-0" />
                                    <span className="text-[10px] uppercase tracking-widest">Empaque premium</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-full h-px bg-stone-100 dark:bg-stone-800" />

                            {/* Full Description */}
                            {product.description && product.description.includes('\n\n') && (
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-3">Detalles</h4>
                                    <div className="prose-brand font-sans text-sm whitespace-pre-line text-stone-600 dark:text-stone-300 leading-relaxed">
                                        {product.description.split('\n\n').slice(1).join('\n\n')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
