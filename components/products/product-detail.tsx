'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, ProductStatus, ProductVariant } from '@/types';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ChevronLeft, ChevronRight, Share2, Copy, Check, Truck, Shield, Package, ArrowLeft, Star, Minus, Plus, ChevronDown, ChevronUp, Sparkles, Heart, Leaf, ShieldCheck, X, ZoomIn, ZoomOut, MessageCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { supabaseProductService } from '@/services/supabaseProductService';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { usePublicProducts } from '@/hooks/use-public-products';
import { TrustBadge } from '@/services/settingsService';

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
    const [imgLoadedSet, setImgLoadedSet] = useState<Set<number>>(new Set());
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['description']));
    const [quantity, setQuantity] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panPos, setPanPos] = useState({ x: 0, y: 0 });
    const imageContainerRef = useRef<HTMLDivElement>(null);

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

    // Handle zoom interactions
    const handleZoomToggle = (e: React.MouseEvent) => {
        if (zoomLevel === 1) {
            if (imageContainerRef.current) {
                const rect = imageContainerRef.current.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setPanPos({ x, y });
            }
            setZoomLevel(2); // Zoom in 2x
        } else {
            setZoomLevel(1);
        }
    };

    const handleZoomMouseMove = (e: React.MouseEvent) => {
        if (zoomLevel > 1 && imageContainerRef.current) {
            const rect = imageContainerRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setPanPos({ x, y });
        }
    };

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
    const isAvailableForOrder = product.status === ProductStatus.MADE_TO_ORDER;
    const isVariantSoldOut = selectedVariant ? (selectedVariant.stock !== undefined && selectedVariant.stock <= 0) : false;

    // A product is disabled only if it is explicitly SOLD_OUT OR if the variant is out and it's NOT made to order
    const isCtaDisabled = isSoldOut || (isVariantSoldOut && !isAvailableForOrder);

    // Stock urgency
    const showStockUrgency = settings?.show_stock_urgency ?? true;
    const stockUrgencyThreshold = settings?.stock_urgency_threshold ?? 5;
    const currentStock = selectedVariant?.stock ?? product.stock;
    const isLowStock = currentStock !== undefined && currentStock !== null && currentStock > 0 && currentStock <= stockUrgencyThreshold;

    // WhatsApp direct inquiry for single product
    const handleWhatsAppDirect = () => {
        if (!settings?.whatsapp_number) return;
        const phone = settings.whatsapp_number.replace(/\D/g, '');
        let msg = settings.whatsapp_product_template || 'Hola {{brand_name}}, me interesa la pieza: "{{product_name}}" (Ref: {{product_id}}). ¿Podrían darme más información?';
        msg = msg
            .replace(/{{brand_name}}/g, settings.brand_name || 'Varmina')
            .replace(/{{product_name}}/g, product.name)
            .replace(/{{product_id}}/g, product.id.slice(0, 8));
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    // CTA text from settings
    const ctaText = settings?.product_cta_text || 'Agregar al Carrito';

    // Trust badges from settings
    const ICON_MAP: Record<string, React.FC<{className?: string}>> = { truck: Truck, shield: Shield, package: Package, refresh: RefreshCw, sparkles: Sparkles, heart: Heart, leaf: Leaf, shieldcheck: ShieldCheck, star: Star, alert: AlertTriangle };
    const trustBadges: TrustBadge[] = settings?.trust_badges || [{ icon: 'truck', text: 'Envío Seguro' }, { icon: 'shield', text: 'Garantía de Calidad' }, { icon: 'package', text: 'Empaque Premium' }];

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isFullscreen) {
                if (e.key === 'Escape') {
                    setIsFullscreen(false);
                    setZoomLevel(1);
                }
                if (zoomLevel === 1) {
                    if (e.key === 'ArrowLeft') setActiveImg(prev => prev === 0 ? imagesToDisplay.length - 1 : prev - 1);
                    if (e.key === 'ArrowRight') setActiveImg(prev => prev === imagesToDisplay.length - 1 ? 0 : prev + 1);
                }
            } else {
                // Also allow arrows in main view if hovering? Maybe just fullscreen is enough
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen, imagesToDisplay.length, zoomLevel]);

    const toggleSection = (id: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Dynamic Product Features Grid
    const productFeatures = useMemo(() => {
        const features = [];
        const content = `${product.name} ${product.description || ''} ${product.category || ''}`.toLowerCase();

        // 1. Material Feature
        if (content.includes('plata')) {
            features.push({ label: 'Plata 925 Certificada', icon: Sparkles });
        } else if (content.includes('oro')) {
            features.push({ label: 'Baño de Oro 18k', icon: Sparkles });
        } else {
            features.push({ label: 'Calidad Premium', icon: Sparkles });
        }

        // 2. Craftsmanship Feature
        if (content.match(/mano|autor|artesanal|taller/)) {
            features.push({ label: 'Diseño Exclusivo', icon: ShieldCheck });
        } else {
            features.push({ label: 'Diseño Exclusivo', icon: ShieldCheck });
        }

        // 3. Service/Trust
        features.push({ label: 'Envíos a todo Chile', icon: Truck });
        features.push({ label: 'Compra 100% Segura', icon: Shield });

        return features;
    }, [product]);

    return (
        <div className="w-full bg-stone-50/30 dark:bg-stone-950 min-h-screen selection:bg-stone-200 dark:selection:bg-stone-800">

            {/* ─── PREMIUM PRODUCT PAGE LAYOUT ─── */}
            <main className="max-w-[1600px] mx-auto px-4 md:px-12 py-4 md:py-8 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-[100px_1fr_420px] xl:grid-cols-[120px_1fr_480px] gap-8 xl:gap-16 items-start">
                    
                    {/* COL 1: Vertical Thumbnails (Desktop Only) */}
                    <div className="hidden lg:flex flex-col gap-3 sticky top-32 overflow-y-auto max-h-[70vh] px-1 hide-scrollbar">
                        {imagesToDisplay.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImg(idx)}
                                className={cn(
                                    "relative w-20 xl:w-24 aspect-[4/5] rounded transition-all duration-300 shrink-0",
                                    activeImg === idx 
                                        ? "border border-stone-900 dark:border-white opacity-100" 
                                        : "opacity-40 hover:opacity-100"
                                )}
                            >
                                    <Image 
                                        src={img} 
                                        fill 
                                        sizes="100px" 
                                        className="object-cover rounded-sm" 
                                        alt={`Miniatura ${idx + 1}`}
                                        unoptimized
                                    />
                                </button>
                            ))}
                        </div>
    
                        {/* COL 2: Main Image Centerpiece */}
                        <div className="relative w-full lg:max-w-[800px] mx-auto group">
                            <div 
                                className="relative aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] w-full max-h-[85vh] bg-white dark:bg-stone-900/40 rounded-xl overflow-hidden shadow-sm md:shadow-none mx-auto cursor-zoom-in"
                                onTouchStart={onTouchStart}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEnd}
                                onClick={() => { setIsFullscreen(true); setZoomLevel(1); }}
                            >
                                {imagesToDisplay.map((img: string, idx: number) => {
                                    const isActive = activeImg === idx;
                                    // Only render current, previous, and next image for performance
                                    const isNear = Math.abs(idx - activeImg) <= 1 || 
                                                 (activeImg === 0 && idx === imagesToDisplay.length - 1) ||
                                                 (activeImg === imagesToDisplay.length - 1 && idx === 0);
                                    
                                    if (!isNear && !isActive) return null;

                                    return (
                                        <div 
                                            key={idx}
                                            className={cn(
                                                "absolute inset-0 transition-opacity duration-1000 ease-in-out will-change-[opacity]",
                                                isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                                            )}
                                            style={{ transitionProperty: 'opacity' }}
                                        >
                                            <Image
                                                src={img}
                                                fill
                                                priority={isActive}
                                                unoptimized
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                                                className="object-contain md:object-cover p-4 md:p-0 transition-transform duration-[2s] ease-out group-hover:scale-105"
                                                alt={product.name}
                                                onLoad={() => handleImgLoad(idx)}
                                            />
                                        </div>
                                    );
                                })}
                            
                            {/* Navigation Arrows for main image */}
                            {imagesToDisplay.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === 0 ? imagesToDisplay.length - 1 : prev - 1); }}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md dark:bg-black/50 text-stone-800 dark:text-white flex items-center justify-center opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-20 shadow-sm md:shadow-none hover:bg-white dark:hover:bg-black"
                                    >
                                        <ChevronLeft className="w-5 h-5 ml-[-2px]" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === imagesToDisplay.length - 1 ? 0 : prev + 1); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md dark:bg-black/50 text-stone-800 dark:text-white flex items-center justify-center opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-20 shadow-sm md:shadow-none hover:bg-white dark:hover:bg-black"
                                    >
                                        <ChevronRight className="w-5 h-5 mr-[-2px]" />
                                    </button>
                                </>
                            )}
                            
                            <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity md:flex hidden bg-white/80 dark:bg-black/40 backdrop-blur-md p-2 rounded-full cursor-pointer text-stone-800 dark:text-white">
                                <ZoomIn className="w-4 h-4" />
                            </div>

                            {/* Loading state overlay */}
                            {!imgLoadedSet.has(activeImg) && (
                                <div className="absolute inset-0 bg-stone-100 dark:bg-stone-900 animate-pulse z-20" />
                            )}

                            {/* Mobile Dot Indicators */}
                            {imagesToDisplay.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex md:hidden gap-1.5 z-20 pointer-events-none">
                                    {imagesToDisplay.map((_, idx) => (
                                        <div 
                                            key={idx} 
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                                activeImg === idx ? "bg-stone-800 dark:bg-white w-4" : "bg-stone-800/20 dark:bg-white/20"
                                            )} 
                                        />
                                    ))}
                                </div>
                            )}

                        </div>

                        {/* Mobile: Horizontal Thumb Strip */}
                        {imagesToDisplay.length > 1 && (
                            <div className="flex lg:hidden gap-3 mt-4 overflow-x-auto pb-4 hide-scrollbar">
                                {imagesToDisplay.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImg(idx)}
                                        className={cn(
                                            "relative w-16 h-20 shrink-0 rounded overflow-hidden transition-all",
                                            activeImg === idx ? "border border-stone-900 dark:border-white opacity-100" : "opacity-60"
                                        )}
                                    >
                                        <Image src={img} fill sizes="64px" className="object-cover" alt="" unoptimized />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* COL 3: Product Information */}
                    <div className="space-y-10 xl:space-y-12">
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

                            {/* Stock urgency indicator */}
                            {showStockUrgency && isLowStock && !isSoldOut && (
                                <div className="flex items-center gap-2 py-2 px-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                                        {currentStock === 1 ? '¡Última unidad disponible!' : `¡Solo quedan ${currentStock} unidades!`}
                                    </span>
                                </div>
                            )}


                        </div>


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
                                        disabled={isAdding || isCtaDisabled}
                                        onClick={handleAddToCart}
                                        isLoading={isAdding}
                                    >
                                        {isCtaDisabled ? 'Agotado' : ctaText}
                                    </Button>
                                </div>
                                {/* WhatsApp Direct Inquiry */}
                                {settings?.whatsapp_number && (
                                    <button
                                        onClick={handleWhatsAppDirect}
                                        className="w-full flex items-center justify-center gap-2 h-12 border border-green-600 text-green-700 dark:text-green-400 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-sm transition-all text-xs font-bold uppercase tracking-[0.15em]"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Consultar por WhatsApp
                                    </button>
                                )}

                                {/* Trust Bar */}
                                <div className="grid grid-cols-2 gap-3 pt-5 mt-1 border-t border-stone-100 dark:border-stone-800">
                                    {productFeatures.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-stone-50 dark:bg-stone-900 flex items-center justify-center text-stone-400 shrink-0">
                                                <feature.icon className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">{feature.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-start-2 lg:col-span-2 mt-8 lg:mt-12">
                        {/* Accordion Sections - Full Width below main components */}
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

                        {/* Secure Checkout Badges - Configurable from Admin */}
                        <div className="flex items-center justify-center gap-6 pt-12">
                             {trustBadges.map((badge, idx) => {
                                 const Icon = ICON_MAP[badge.icon.toLowerCase()] || Shield;
                                 return (
                                     <div key={idx} className="flex flex-col items-center gap-2 opacity-40">
                                         <Icon className="w-5 h-5" />
                                         <span className="text-[8px] uppercase tracking-widest font-bold">{badge.text}</span>
                                     </div>
                                 );
                             })}
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
                        {(() => {
                            const filtered = allProducts
                                .filter((p: Product) => p.id !== product.id && p.status !== ProductStatus.SOLD_OUT && (p.category === product.category || !product.category));
                            // Shuffle for variety
                            const shuffled = [...filtered].sort(() => Math.random() - 0.5);
                            return shuffled.slice(0, 4).map((related: Product) => (
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
                                                unoptimized
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
                            ));
                        })()}
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

            {/* FULLSCREEN ZOOM VIEWER */}
            {isFullscreen && (
                <div 
                    className="fixed inset-0 z-[100] bg-white dark:bg-stone-950 flex flex-col"
                    aria-modal="true"
                    role="dialog"
                >
                    <div className="flex justify-between items-center p-4 md:p-6 absolute top-0 left-0 right-0 z-50 pointer-events-none">
                        <div className="pointer-events-auto bg-white/50 dark:bg-black/50 backdrop-blur-md px-4 py-2 rounded-full hidden md:flex items-center gap-2">
                            {zoomLevel === 1 ? (
                                <><ZoomIn className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-widest">Click para acercar</span></>
                            ) : (
                                <><ZoomOut className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-widest">Click para alejar</span></>
                            )}
                        </div>
                        <button 
                            onClick={() => { setIsFullscreen(false); setZoomLevel(1); }}
                            className="pointer-events-auto p-3 bg-white/70 dark:bg-black/50 backdrop-blur-md rounded-full text-stone-800 dark:text-white hover:bg-white dark:hover:bg-black transition-colors ml-auto shadow-sm"
                            aria-label="Cerrar vista completa"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div 
                        className={cn(
                            "flex-1 relative overflow-hidden flex items-center justify-center w-full h-full",
                            zoomLevel > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
                        )}
                        ref={imageContainerRef}
                        onClick={handleZoomToggle}
                        onMouseMove={handleZoomMouseMove}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {imagesToDisplay.map((img: string, idx: number) => {
                            const isActive = activeImg === idx;
                            return (
                                <div 
                                    key={idx}
                                    className={cn(
                                        "absolute inset-0 transition-opacity duration-700 ease-in-out w-full h-full flex items-center justify-center",
                                        isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                                    )}
                                    style={{ transitionProperty: 'opacity' }}
                                >
                                    <div 
                                        className={cn(
                                            "relative w-full h-full flex items-center justify-center",
                                            isActive && zoomLevel > 1 && "transition-transform duration-300 ease-out"
                                        )}
                                        style={
                                            isActive && zoomLevel > 1 
                                                ? { 
                                                    transform: `scale(${zoomLevel})`, 
                                                    transformOrigin: `${panPos.x}% ${panPos.y}%` 
                                                  } 
                                                : undefined
                                        }
                                    >
                                        <Image
                                            src={img}
                                            fill
                                            className="object-contain p-4 md:p-12"
                                            sizes="100vw"
                                            alt={product.name}
                                            priority={isActive}
                                            unoptimized
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {/* Navigation Arrows for fullscreen */}
                        {imagesToDisplay.length > 1 && zoomLevel === 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === 0 ? imagesToDisplay.length - 1 : prev - 1); }}
                                    className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-md text-stone-800 dark:text-white flex items-center justify-center transition-colors z-20 hover:bg-white dark:hover:bg-black shadow-sm"
                                >
                                    <ChevronLeft className="w-6 h-6 ml-[-2px]" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === imagesToDisplay.length - 1 ? 0 : prev + 1); }}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-md text-stone-800 dark:text-white flex items-center justify-center transition-colors z-20 hover:bg-white dark:hover:bg-black shadow-sm"
                                >
                                    <ChevronRight className="w-6 h-6 mr-[-2px]" />
                                </button>
                            </>
                        )}
                        
                        {/* Number indicator */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                            {imagesToDisplay.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-300",
                                        activeImg === idx ? "bg-stone-800 dark:bg-white w-6" : "bg-stone-300 dark:bg-stone-700"
                                    )} 
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
