'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Product, ProductStatus, ProductVariant } from '@/types';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ChevronLeft, ChevronRight, X, Share2, Heart } from 'lucide-react';
import { supabaseProductService } from '@/services/supabaseProductService';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

interface ProductDetailProps {
    product: Product;
    currency: 'CLP' | 'USD';
    onClose: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, currency, onClose }) => {
    const { settings, addToast } = useStore();
    const { addItem } = useCart();
    const [activeImg, setActiveImg] = useState(0);
    const [isAdding, setIsAdding] = useState(false);

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

    // Swipe Logic
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
                    title: product.name,
                    url,
                });
            } catch {
                // User cancelled share
            }
        } else {
            await navigator.clipboard.writeText(url);
            addToast('info', 'Enlace copiado');
        }
    };

    const isSoldOut = product.status === ProductStatus.SOLD_OUT;
    const isVariantSoldOut = selectedVariant ? (selectedVariant.stock !== undefined && selectedVariant.stock <= 0) : false;

    return (
        <div className="flex flex-col md:flex-row h-full md:h-auto overflow-hidden bg-white dark:bg-stone-950 md:rounded-lg max-w-5xl w-full mx-auto relative shadow-2xl animate-slide-up-mobile md:animate-scale-in select-none">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 bg-white/80 dark:bg-stone-900/80 rounded-full text-stone-900 dark:text-white hover:bg-gold-500 hover:text-white transition-all backdrop-blur-sm shadow-sm"
                aria-label="Cerrar"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Image Section */}
            <div
                className="md:w-1/2 bg-stone-50 dark:bg-stone-900 relative group"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className="w-full aspect-[3/4] md:h-[650px] relative overflow-hidden">
                    <img
                        key={imagesToDisplay[activeImg]}
                        src={imagesToDisplay[activeImg] || product.images[0]}
                        className="w-full h-full object-cover animate-fade-in"
                        alt={product.name}
                        draggable={false}
                    />

                    {/* Image counter */}
                    {imagesToDisplay.length > 1 && (
                        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider">
                            {activeImg + 1} / {imagesToDisplay.length}
                        </div>
                    )}

                    {/* Navigation Arrows */}
                    {imagesToDisplay.length > 1 && (
                        <>
                            <div className="absolute inset-y-0 left-0 flex items-center pl-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === 0 ? imagesToDisplay.length - 1 : prev - 1); }}
                                    className="p-2 bg-white/30 dark:bg-black/30 hover:bg-white text-stone-900 dark:text-white rounded-full transition-all backdrop-blur-sm"
                                    aria-label="Imagen anterior"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === imagesToDisplay.length - 1 ? 0 : prev + 1); }}
                                    className="p-2 bg-white/30 dark:bg-black/30 hover:bg-white text-stone-900 dark:text-white rounded-full transition-all backdrop-blur-sm"
                                    aria-label="Imagen siguiente"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Thumbnails */}
                {imagesToDisplay.length > 1 && (
                    <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center gap-2 overflow-x-auto hide-scrollbar z-10">
                        {imagesToDisplay.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setActiveImg(idx); }}
                                className={cn(
                                    "w-12 h-16 shrink-0 border rounded-sm overflow-hidden transition-all duration-300",
                                    activeImg === idx
                                        ? "border-gold-500 shadow-md scale-110 opacity-100"
                                        : "border-white/50 opacity-60 hover:opacity-100"
                                )}
                                aria-label={`Ver imagen ${idx + 1}`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt="" draggable={false} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="md:w-1/2 p-6 md:p-12 flex flex-col h-auto bg-white dark:bg-stone-950">
                <div className="mb-auto">
                    {product.collection && (
                        <span className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.25em] mb-3 block">
                            {product.collection}
                        </span>
                    )}
                    <h2 className="font-serif text-2xl md:text-4xl text-stone-900 dark:text-white mb-2 tracking-wide leading-tight">
                        {product.name}
                    </h2>

                    <div className="flex items-center gap-4 mb-8 border-b border-stone-100 dark:border-stone-800 pb-6">
                        <span className="text-xl md:text-2xl font-light text-stone-900 dark:text-gold-200">
                            {formatPrice(currentPrice, currency)}
                        </span>
                        <StatusBadge status={product.status} />
                    </div>

                    {/* Variants */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="mb-6 md:mb-8 animate-fade-in">
                            <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-3 block">
                                {product.variants.length > 1 ? 'Seleccionar Opción' : 'Opción'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {product.variants.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => { setSelectedVariant(v); setActiveImg(0); }}
                                        className={cn(
                                            "px-4 py-3 md:px-5 md:py-2.5 text-xs font-medium border rounded-lg md:rounded-full transition-all duration-300 w-full md:w-auto text-left md:text-center flex items-center justify-between md:justify-center",
                                            selectedVariant?.id === v.id
                                                ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white shadow-lg scale-[1.02] md:scale-105"
                                                : "bg-transparent text-stone-500 border-stone-200 hover:border-gold-500 hover:text-stone-900 dark:hover:text-white"
                                        )}
                                    >
                                        <div className="flex flex-row md:flex-col items-center gap-2 md:gap-0.5 w-full md:w-auto justify-between md:justify-center">
                                            <span className="font-bold md:font-medium">{v.name}</span>
                                            {v.stock !== undefined && (
                                                <span className={cn(
                                                    "text-[9px] md:text-[8px] uppercase tracking-tighter bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full md:bg-transparent md:p-0",
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

                    {product.description && (
                        <div className="prose-brand mb-8 font-sans text-sm md:text-base whitespace-pre-line text-stone-600 dark:text-stone-300 leading-relaxed">
                            {product.description}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="pt-6 mt-8 md:mt-auto space-y-4">
                    <Button
                        className="w-full py-4 text-xs md:text-sm tracking-[0.2em] bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-200 text-white dark:text-stone-900 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                        disabled={isSoldOut || isVariantSoldOut}
                        onClick={handleAddToCart}
                        isLoading={isAdding}
                    >
                        {isSoldOut || isVariantSoldOut ? 'Agotado' : 'Añadir a cotizar'}
                    </Button>

                    {/* Secondary actions */}
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-400 hover:text-gold-500 transition-colors"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            Compartir
                        </button>
                    </div>

                    <div className="flex items-center justify-center">
                        <span className="text-[10px] uppercase tracking-widest text-stone-400 opacity-60">
                            Envíos disponibles a todo Chile
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
