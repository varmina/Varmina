'use client';

import React, { useState } from 'react';
import { Product, ProductStatus } from '@/types';
import { useStore } from '@/context/StoreContext';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

interface ProductCardProps {
    product: Product;
    currency: 'CLP' | 'USD';
    layout: 'grid' | 'list';
    onClick: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, currency, layout, onClick }) => {
    const { settings } = useStore();
    const exchangeRate = settings?.usd_exchange_rate || 950;
    const displayPrice = currency === 'CLP' ? product.price : Math.round(product.price / exchangeRate);
    const [imgLoaded, setImgLoaded] = useState(false);

    const isList = layout === 'list';
    const isSoldOut = product.status === ProductStatus.SOLD_OUT;

    // Determine primary image from variants
    const primaryVariant = product.variants?.find(v => v.isPrimary);
    const primaryImage = (primaryVariant?.images && primaryVariant.images.length > 0)
        ? primaryVariant.images[0]
        : product.images[0];
    const hoverImage = product.images[1] || null;

    return (
        <article
            className={cn(
                "group cursor-pointer relative product-card-hover",
                isList
                    ? "flex gap-4 p-3 md:p-0 border-b border-stone-100 dark:border-stone-800 md:border-none"
                    : "flex flex-col gap-3"
            )}
            onClick={() => onClick(product)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(product); } }}
            aria-label={`Ver ${product.name} - ${formatPrice(displayPrice, currency)}`}
        >
            {/* Image Container */}
            <div className={cn(
                "relative overflow-hidden bg-stone-100 dark:bg-stone-800 rounded-sm",
                isList
                    ? "w-24 h-32 md:w-48 md:h-64 aspect-[3/4] shrink-0"
                    : "w-full aspect-[3/4]"
            )}>
                {/* Skeleton while loading */}
                {!imgLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-stone-700" />
                )}

                <img
                    src={primaryImage}
                    alt={product.name}
                    className={cn(
                        "w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105",
                        !imgLoaded && "opacity-0"
                    )}
                    loading="lazy"
                    onLoad={() => setImgLoaded(true)}
                />

                {/* Hover second image */}
                {hoverImage && (
                    <img
                        src={hoverImage}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100 scale-105"
                        loading="lazy"
                    />
                )}

                {/* Badge */}
                {product.badge && (
                    <div className="absolute top-0 left-0 z-10">
                        <span className="bg-brand-dark text-white text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 backdrop-blur-md">
                            {product.badge}
                        </span>
                    </div>
                )}

                {/* Por Encargo Badge */}
                {product.status === ProductStatus.MADE_TO_ORDER && (
                    <div className={`absolute ${product.badge ? 'top-8' : 'top-0'} left-0 z-10`}>
                        <span className="bg-blue-600/90 text-white text-[8px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 backdrop-blur-md">
                            Por Encargo
                        </span>
                    </div>
                )}

                {/* Sold Out Overlay */}
                {isSoldOut && (
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-grayscale flex items-center justify-center">
                        <span className="bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 -rotate-6 shadow-xl border border-white/20">
                            Agotado
                        </span>
                    </div>
                )}

                {/* Quick add hint on desktop */}
                {!isList && !isSoldOut && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out hidden md:block">
                        <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                            Ver Detalles
                        </span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className={cn("flex flex-col", isList ? "justify-center py-2 items-start" : "items-start")}>
                {product.collection && (
                    <p className="text-[9px] uppercase tracking-widest text-stone-400 mb-1.5">{product.collection}</p>
                )}

                <h3 className={cn(
                    "font-serif text-stone-900 dark:text-white leading-tight mb-1 group-hover:text-gold-600 transition-colors duration-300 uppercase tracking-wide",
                    isList ? "text-sm" : "text-xs md:text-sm"
                )}>
                    {product.name}
                </h3>

                <p className={cn(
                    "font-medium text-stone-600 dark:text-stone-300",
                    isList ? "text-sm" : "text-xs md:text-sm"
                )}>
                    {formatPrice(displayPrice, currency)}
                </p>

                {/* Variant count hint */}
                {!isList && product.variants && product.variants.length > 1 && (
                    <p className="text-[9px] text-stone-400 mt-1 uppercase tracking-wider">
                        {product.variants.length} opciones
                    </p>
                )}

                {isList && (
                    <p className="text-xs text-stone-500 mt-2 line-clamp-2 hidden md:block">{product.description}</p>
                )}
            </div>
        </article>
    );
};
