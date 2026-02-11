'use client';

import React, { useState } from 'react';
import { Product, ProductStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabaseProductService } from '@/services/supabaseProductService';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';

interface ProductDetailProps {
    product: Product;
    currency: 'CLP' | 'USD';
    onClose: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, currency, onClose }) => {
    const { settings } = useStore();
    const [activeImg, setActiveImg] = useState(0);

    // Initialize with primary variant or first variant if available, otherwise null
    const [selectedVariant, setSelectedVariant] = useState<any>(() => {
        if (product.variants && product.variants.length > 0) {
            return product.variants.find(v => v.isPrimary) || product.variants[0];
        }
        return null;
    });

    const imagesToDisplay = (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0)
        ? selectedVariant.images
        : product.images;

    const exchangeRate = settings?.usd_exchange_rate || 950;
    const basePrice = currency === 'CLP' ? product.price : Math.round(product.price / exchangeRate);
    const currentPrice = selectedVariant
        ? (currency === 'CLP' ? selectedVariant.price : Math.round(selectedVariant.price / exchangeRate))
        : basePrice;

    // Swipe Logic
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            setActiveImg(prev => prev === imagesToDisplay.length - 1 ? 0 : prev + 1);
        }
        if (isRightSwipe) {
            setActiveImg(prev => prev === 0 ? imagesToDisplay.length - 1 : prev - 1);
        }
    };

    const { addItem } = useCart();
    const { addToast } = useStore();

    const handleAddToCart = async () => {
        await supabaseProductService.incrementWhatsappClicks(product.id);

        let variantName = selectedVariant ? selectedVariant.name : undefined;
        addItem(product, 1, variantName);
        addToast('success', 'Añadido a cotización');
        onClose(); // Optional: Close modal to show drawer better? Or keep open?
        // Context opens drawer automatically, so closing modal might be better UX to see the drawer.
        // But maybe user wants to continue reading. 
        // Let's close modal for now as it transitions to the next step (Review List).
    };

    return (
        <div className="flex flex-col md:flex-row h-full md:h-auto overflow-hidden bg-white dark:bg-stone-950 md:rounded-lg max-w-5xl w-full mx-auto relative shadow-2xl animate-in slide-in-from-bottom-8 duration-500 ease-out select-none">
            {/* Close Button Mobile/Desktop */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 bg-white/80 dark:bg-stone-900/80 rounded-full text-stone-900 dark:text-white hover:bg-gold-500 hover:text-white transition-colors backdrop-blur-sm shadow-sm"
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
                <div className="w-full aspect-[3/4] md:h-[650px] relative">
                    <img
                        key={imagesToDisplay[activeImg]} // Add key to force re-render for crisp transition if needed, or remove for smooth src swap
                        src={imagesToDisplay[activeImg] || product.images[0]}
                        className="w-full h-full object-cover animate-in fade-in duration-300"
                        alt={product.name}
                        draggable={false}
                    />

                    {/* Navigation Arrows - Always visible on desktop hover, usually hidden on mobile in favor of swipe, but kept for clarity */}
                    {imagesToDisplay.length > 1 && (
                        <>
                            <div className="absolute inset-y-0 left-0 flex items-center pl-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === 0 ? imagesToDisplay.length - 1 : prev - 1); }}
                                    className="p-2 bg-white/30 dark:bg-black/30 hover:bg-white text-stone-900 dark:text-white rounded-full transition-all backdrop-blur-sm"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === imagesToDisplay.length - 1 ? 0 : prev + 1); }}
                                    className="p-2 bg-white/30 dark:bg-black/30 hover:bg-white text-stone-900 dark:text-white rounded-full transition-all backdrop-blur-sm"
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
                                className={`w-12 h-16 shrink-0 border rounded-sm overflow-hidden transition-all duration-300 ${activeImg === idx ? 'border-gold-500 shadow-md scale-110 opacity-100' : 'border-white/50 opacity-60 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt="" draggable={false} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="md:w-1/2 p-6 md:p-12 flex flex-col h-auto md:max-h-[650px] overflow-y-auto bg-white dark:bg-stone-950">
                <div className="mb-auto">
                    {product.collection && (
                        <span className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.25em] mb-3 block">{product.collection}</span>
                    )}
                    <h2 className="font-serif text-2xl md:text-4xl text-stone-900 dark:text-white mb-2 tracking-wide leading-tight">{product.name}</h2>
                    <div className="flex items-center gap-4 mb-8 border-b border-stone-100 dark:border-stone-800 pb-6">
                        <span className="text-xl md:text-2xl font-light text-stone-900 dark:text-gold-200">
                            {formatPrice(currentPrice, currency)}
                        </span>
                        <StatusBadge status={product.status} />
                    </div>

                    <div className="prose prose-sm prose-stone dark:prose-invert mb-8 text-stone-600 dark:text-stone-400 leading-relaxed font-sans text-xs md:text-base">
                        {product.description}
                    </div>

                    {/* Variants */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="mb-8 animate-in fade-in duration-700">
                            <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-3 block">
                                {product.variants.length > 1 ? 'Seleccionar Opción' : 'Opción'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {product.variants.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => { setSelectedVariant(v); setActiveImg(0); }}
                                        className={`px-5 py-2.5 text-xs font-medium border rounded-full transition-all duration-300 ${selectedVariant?.id === v.id ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white shadow-lg scale-105' : 'bg-transparent text-stone-500 border-stone-200 hover:border-gold-500 hover:text-stone-900 dark:hover:text-white'}`}
                                    >
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span>{v.name}</span>
                                            {v.stock !== undefined && (
                                                <span className={`text-[8px] uppercase tracking-tighter ${v.stock > 0 ? 'text-green-500' : 'text-red-400 font-bold'}`}>
                                                    {v.stock > 0 ? `${v.stock} disp.` : 'Agotado'}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 mt-8 md:mt-auto">
                    <Button
                        className="w-full py-4 text-xs md:text-sm font-bold uppercase tracking-[0.2em] bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-200 text-white dark:text-stone-900 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                        disabled={product.status === ProductStatus.SOLD_OUT}
                        onClick={handleAddToCart}
                    >
                        {product.status === ProductStatus.SOLD_OUT ? 'Agotado' : 'Añadir a cotizar'}
                    </Button>
                    <div className="flex items-center justify-center mt-4 opacity-60">
                        <span className="text-[10px] uppercase tracking-widest text-stone-400">
                            Envíos disponibles a todo Chile
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
