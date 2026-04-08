'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, ProductStatus, ProductVariant } from '@/types';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ChevronLeft, ChevronRight, Share2, Copy, Check, Truck, Shield, Package, ArrowLeft, Star, Minus, Plus, ChevronDown, ChevronUp, Sparkles, Heart, Leaf, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { supabaseProductService } from '@/services/supabaseProductService';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { usePublicProducts } from '@/hooks/use-public-products';

interface ProductDetailProps {
    product: Product;
    currency: 'CLP' | 'USD';
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, currency }) => {
    const router = useRouter();
    const { products: allProducts } = usePublicProducts();
    const { settings, addToast } = useStore();
    const { addItem } = useCart();
    const [activeImg, setActiveImg] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [imgLoadedSet, setImgLoadedSet] = useState<Set<number>>(new Set([0]));
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['description']));
    const [quantity, setQuantity] = useState(1);

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
            addItem(product, quantity, variantName);
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

    const toggleSection = (id: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <div className="w-full bg-stone-50/30 dark:bg-stone-950 min-h-screen selection:bg-stone-200 dark:selection:bg-stone-800">
            {/* Navigation & Breadcrumb */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-12 py-6 md:py-8">
                <nav className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em]">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all group"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                            <span>Volver</span>
                        </button>
                        <span className="text-stone-200 dark:text-stone-800">/</span>
                        <div className="hidden sm:flex items-center gap-2">
                            {product.category && (
                                <>
                                    <span className="text-stone-400">{product.category}</span>
                                    <span className="text-stone-200 dark:text-stone-800">/</span>
                                </>
                            )}
                            <span className="text-stone-900 dark:text-white font-semibold truncate max-w-[200px]">
                                {product.name}
                            </span>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleShare}
                        className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                        aria-label="Compartir producto"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                </nav>
            </div>

            {/* ─── PREMIUM PRODUCT PAGE LAYOUT ─── */}
            <main className="max-w-[1600px] mx-auto px-4 md:px-12 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-[100px_1fr_420px] xl:grid-cols-[120px_1fr_480px] gap-8 xl:gap-16 items-start">
                    
                    {/* COL 1: Vertical Thumbnails (Desktop Only) */}
                    <div className="hidden lg:flex flex-col gap-3 sticky top-32 overflow-y-auto max-h-[70vh] pr-4 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-stone-800">
                        {imagesToDisplay.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImg(idx)}
                                className={cn(
                                    "relative w-20 xl:w-24 aspect-[4/5] rounded transition-all duration-500",
                                    activeImg === idx 
                                        ? "ring-2 ring-stone-900 dark:ring-white ring-offset-2 dark:ring-offset-stone-950" 
                                        : "opacity-40 hover:opacity-100"
                                )}
                            >
                                <Image 
                                    src={img} 
                                    fill 
                                    sizes="100px" 
                                    className="object-cover rounded" 
                                    alt={`Miniatura ${idx + 1}`}
                                    unoptimized={img.startsWith('data:')}
                                />
                            </button>
                        ))}
                    </div>

                    {/* COL 2: Main Image Centerpiece */}
                    <div className="relative w-full lg:max-w-[800px] mx-auto">
                        <div 
                            className="relative aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] w-full max-h-[85vh] bg-white dark:bg-stone-900/40 rounded-xl overflow-hidden shadow-sm md:shadow-none mx-auto"
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            {imagesToDisplay.map((img: string, idx: number) => {
                                const isActive = activeImg === idx;
                                const isAdjacent = Math.abs(activeImg - idx) <= 1;
                                if (!isActive && !isAdjacent) return null;
                                
                                return (
                                    <div 
                                        key={idx}
                                        className={cn(
                                            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                                            isActive ? "opacity-100 z-10" : "opacity-0 z-0"
                                        )}
                                    >
                                        <Image
                                            src={img}
                                            fill
                                            priority={idx === 0}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                                            className="object-contain md:object-cover p-4 md:p-0"
                                            alt={product.name}
                                            onLoad={() => handleImgLoad(idx)}
                                            unoptimized={img.startsWith('data:')}
                                        />
                                    </div>
                                );
                            })}
                            
                            {/* Loading state overlay */}
                            {!imgLoadedSet.has(activeImg) && (
                                <div className="absolute inset-0 bg-stone-100 dark:bg-stone-900 animate-pulse z-20" />
                            )}

                            {/* Slider Navigation (Mobile focus or Hover) */}
                            {imagesToDisplay.length > 1 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 lg:hidden">
                                    {imagesToDisplay.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImg(idx)}
                                            className={cn(
                                                "h-1 transition-all duration-500 rounded-full",
                                                activeImg === idx ? "w-8 bg-stone-900 dark:bg-white" : "w-2 bg-stone-300 dark:bg-stone-700"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Floating Arrows (Optional premium hover effect) */}
                            {imagesToDisplay.length > 1 && (
                                <div className="absolute inset-0 hidden md:flex items-center justify-between px-6 opacity-0 hover:opacity-100 transition-opacity duration-300 z-30">
                                    <button 
                                        onClick={() => setActiveImg(prev => prev === 0 ? imagesToDisplay.length - 1 : prev - 1)}
                                        className="p-3 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-stone-900 dark:text-white" />
                                    </button>
                                    <button 
                                        onClick={() => setActiveImg(prev => prev === imagesToDisplay.length - 1 ? 0 : prev + 1)}
                                        className="p-3 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110"
                                    >
                                        <ChevronRight className="w-5 h-5 text-stone-900 dark:text-white" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile: Horizontal Thumb Strip */}
                        {imagesToDisplay.length > 1 && (
                            <div className="flex lg:hidden gap-2 mt-4 overflow-x-auto pb-2 hide-scrollbar">
                                {imagesToDisplay.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImg(idx)}
                                        className={cn(
                                            "relative w-16 h-16 shrink-0 rounded overflow-hidden transition-all",
                                            activeImg === idx ? "ring-2 ring-stone-900 dark:ring-white" : "opacity-60"
                                        )}
                                    >
                                        <Image src={img} fill sizes="64px" className="object-cover" alt="" unoptimized={img.startsWith('data:')} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* COL 3: Sticky Product Information */}
                    <div className="lg:sticky lg:top-32 space-y-10 xl:space-y-12">
                        {/* Header Info */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                {product.collections && product.collections.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {product.collections.map((c, i) => (
                                            <span key={i} className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-[0.3em]">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <h1 className="text-2xl md:text-3xl xl:text-4xl font-serif text-stone-900 dark:text-white leading-tight tracking-tight uppercase">
                                    {product.name}
                                </h1>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-2xl xl:text-3xl font-light text-stone-900 dark:text-stone-100">
                                        {formatPrice(currentPrice, currency)}
                                    </p>
                                </div>
                                <StatusBadge status={product.status} />
                            </div>

                            {/* Product Features / Badges */}
                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-stone-100 dark:border-stone-900">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-stone-900 flex items-center justify-center text-stone-400">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Plata 925 Certificada</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-stone-900 flex items-center justify-center text-stone-400">
                                        <Heart className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Hipoalergénico</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-stone-900 flex items-center justify-center text-stone-400">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Hecho a Mano</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-stone-900 flex items-center justify-center text-stone-400">
                                        <Leaf className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Packaging Sustentable</span>
                                </div>
                            </div>
                        </div>

                        {/* Description Preview */}
                        <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-sans line-clamp-3">
                            {product.description}
                        </p>

                        {/* Options & Variants */}
                        <div className="space-y-8">
                            {product.variants && product.variants.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-900 dark:text-white">
                                            Selección {product.variants.length > 1 ? product.category || 'Opción' : 'Opción'}
                                        </label>
                                        <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-widest font-medium">
                                            {selectedVariant?.name || 'Elige uno'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2.5">
                                        {product.variants.map((v) => (
                                            <button
                                                key={v.id}
                                                onClick={() => { setSelectedVariant(v); setActiveImg(0); }}
                                                className={cn(
                                                    "group relative px-6 py-3 border transition-all duration-300 rounded-sm overflow-hidden",
                                                    selectedVariant?.id === v.id
                                                        ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white shadow-lg"
                                                        : "bg-transparent text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-500"
                                                )}
                                            >
                                                <span className="relative z-10 text-xs font-bold uppercase tracking-widest">{v.name}</span>
                                                {v.stock !== undefined && v.stock <= 0 && (
                                                    <div className="absolute inset-0 bg-stone-100/50 dark:bg-stone-900/50 flex items-center justify-center">
                                                        <div className="w-full h-px bg-stone-300 dark:bg-stone-600 rotate-12" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity & CTA */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-sm h-14 px-2">
                                        <button 
                                            onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                                            className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <input 
                                            type="number" 
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-12 text-center bg-transparent text-sm font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <button 
                                            onClick={() => setQuantity(q => q + 1)}
                                            className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <Button
                                        className="flex-1 h-14 text-xs font-bold uppercase tracking-[0.25em] bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-200 text-white dark:text-stone-900 shadow-2xl transition-all rounded-sm active:scale-[0.98]"
                                        disabled={isAdding || isSoldOut || isVariantSoldOut}
                                        onClick={handleAddToCart}
                                        isLoading={isAdding}
                                    >
                                        {isSoldOut || isVariantSoldOut ? 'Agotado' : 'Añadir a Cotización'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Accordion Sections */}
                        <div className="space-y-0.5 border-t border-stone-200 dark:border-stone-800 pt-8">
                            {/* Description Section */}
                            <div className="border-b border-stone-100 dark:border-stone-900">
                                <button 
                                    onClick={() => toggleSection('description')}
                                    className="w-full py-5 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-stone-900 dark:text-white group"
                                >
                                    <span>Descripción Detallada</span>
                                    {expandedSections.has('description') ? <Minus className="w-3.5 h-3.5 text-stone-400" /> : <Plus className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-colors" />}
                                </button>
                                <div className={cn(
                                    "overflow-hidden transition-all duration-700 ease-in-out",
                                    expandedSections.has('description') ? "max-h-[2000px] opacity-100 mb-6" : "max-h-0 opacity-0"
                                )}>
                                    <div className="prose prose-stone prose-sm dark:prose-invert max-w-none text-stone-600 dark:text-stone-400 leading-relaxed font-sans whitespace-pre-line py-2">
                                        {product.description}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping section */}
                            <div className="border-b border-stone-100 dark:border-stone-900">
                                <button 
                                    onClick={() => toggleSection('shipping')}
                                    className="w-full py-5 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-stone-900 dark:text-white group"
                                >
                                    <span>Envío y Devoluciones</span>
                                    {expandedSections.has('shipping') ? <Minus className="w-3.5 h-3.5 text-stone-400" /> : <Plus className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-colors" />}
                                </button>
                                <div className={cn(
                                    "overflow-hidden transition-all duration-700 ease-in-out",
                                    expandedSections.has('shipping') ? "max-h-[1000px] opacity-100 mb-6" : "max-h-0 opacity-0"
                                )}>
                                    <div className="text-xs text-stone-600 dark:text-stone-400 space-y-4 font-sans leading-relaxed">
                                        <div className="flex items-start gap-4">
                                            <Truck className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-stone-900 dark:text-white mb-1">Envío Express a Todo Chile</p>
                                                <p>Despachos en 2-5 días hábiles. Seguimiento en tiempo real.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <Shield className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-stone-900 dark:text-white mb-1">Satisfacción Garantizada</p>
                                                <p>¿No te convenció? Tienes 10 días para realizar cambios o devoluciones sin costo.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Care Section */}
                            <div className="border-b border-stone-100 dark:border-stone-900">
                                <button 
                                    onClick={() => toggleSection('care')}
                                    className="w-full py-5 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-stone-900 dark:text-white group"
                                >
                                    <span>Cuidado de tu Joya</span>
                                    {expandedSections.has('care') ? <Minus className="w-3.5 h-3.5 text-stone-400" /> : <Plus className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-colors" />}
                                </button>
                                <div className={cn(
                                    "overflow-hidden transition-all duration-700 ease-in-out",
                                    expandedSections.has('care') ? "max-h-[1000px] opacity-100 mb-6" : "max-h-0 opacity-0"
                                )}>
                                    <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-3 list-disc pl-4 font-sans leading-relaxed">
                                        <li>Evita el contacto con perfumes y químicos.</li>
                                        <li>Limpia suavemente con un paño de microfibra después de cada uso.</li>
                                        <li>Guarda tu joya en su estuche original para evitar ralladuras.</li>
                                        <li>Quítate las piezas antes de dormir o realizar actividad física intensa.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Secure Checkout Badges */}
                        <div className="flex items-center justify-center gap-6 pt-6 border-t border-stone-100 dark:border-stone-900">
                             <div className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                                <Shield className="w-5 h-5" />
                                <span className="text-[8px] uppercase tracking-widest font-bold">Seguro</span>
                             </div>
                             <div className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                                <Truck className="w-5 h-5" />
                                <span className="text-[8px] uppercase tracking-widest font-bold">Fast</span>
                             </div>
                             <div className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                                <Package className="w-5 h-5" />
                                <span className="text-[8px] uppercase tracking-widest font-bold">Pack</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* ─── RELACIONADOS ─── */}
                <div className="mt-32 pt-24 border-t border-stone-100 dark:border-stone-900">
                    <div className="flex flex-col items-center mb-16">
                        <div className="w-12 h-px bg-gold-400 mb-6" />
                        <h2 className="text-2xl md:text-3xl font-serif tracking-[0.2em] text-stone-900 dark:text-white uppercase text-center">
                            También te puede interesar
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {allProducts
                            .filter((p: Product) => p.id !== product.id && (p.category === product.category || !product.category))
                            .slice(0, 4)
                            .map((related: Product) => (
                                <Link 
                                    key={related.id} 
                                    href={`/product/${related.id}`}
                                    className="group space-y-4"
                                >
                                    <div className="relative aspect-[3/4] overflow-hidden rounded bg-stone-100 dark:bg-stone-900">
                                        {related.images?.[0] && (
                                            <Image 
                                                src={related.images[0]} 
                                                fill 
                                                className="object-cover transition-transform duration-700 group-hover:scale-110" 
                                                alt={related.name}
                                                unoptimized={related.images[0].startsWith('data:')}
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                    </div>
                                    <div className="space-y-1 text-center">
                                        <h3 className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase">{related.category}</h3>
                                        <p className="text-xs font-serif tracking-widest text-stone-900 dark:text-white group-hover:text-gold-600 transition-colors">
                                            {related.name}
                                        </p>
                                        <p className="text-[10px] font-medium text-stone-500">
                                            {formatPrice(related.price, currency)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </div>
            </main>

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
