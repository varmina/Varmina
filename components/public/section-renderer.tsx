/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { usePublicProducts } from '@/hooks/use-public-products';
import { pageLayoutService, PageSection } from '@/services/pageLayoutService';
import { ProductStatus } from '@/types';
import { ProductCard } from '@/components/products/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, SlidersHorizontal, Grid, List, X, Check, ArrowUp, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Hero Section ──────────────────────────────────────────────────────

const HeroSection: React.FC<{ config: Record<string, any> }> = ({ config }) => {
    const { settings } = useStore();
    const title = config.title || settings?.hero_title || '';
    const subtitle = config.subtitle || settings?.hero_subtitle || '';
    const imageUrl = config.image_url || settings?.hero_image_url || '';
    const ctaText = config.cta_text || '';
    const ctaLink = config.cta_link || '/';

    if (imageUrl) {
        return (
            <div className="relative w-full h-[70vh] md:h-[85vh] min-h-[400px] overflow-hidden group">
                <img
                    src={imageUrl}
                    alt={title || 'Hero'}
                    className="w-full h-full object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110"
                    loading="eager"
                    fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-stone-900/70 flex flex-col items-center justify-center text-center p-6 md:p-12">
                    <div className="max-w-4xl space-y-6 animate-fade-in-up">
                        {title && (
                            <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl text-white drop-shadow-2xl tracking-[0.2em] md:tracking-[0.25em] uppercase leading-tight font-light">{title}</h1>
                        )}
                        {subtitle && (
                            <div className="flex flex-col items-center gap-4 md:gap-6">
                                <div className="w-10 md:w-12 h-[1px] bg-gold-400/60" />
                                <p className="font-sans text-[10px] md:text-sm text-white/90 max-w-xl drop-shadow-md tracking-[0.3em] md:tracking-[0.4em] uppercase font-bold">{subtitle}</p>
                                <div className="w-10 md:w-12 h-[1px] bg-gold-400/60" />
                            </div>
                        )}
                        {ctaText && (
                            <a href={ctaLink} className="inline-block mt-4 px-6 md:px-8 py-2.5 md:py-3 bg-white/10 backdrop-blur border border-white/30 text-white text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-stone-900 transition-all duration-300">
                                {ctaText}
                            </a>
                        )}
                    </div>
                    <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
                        <div className="w-[1px] h-8 md:h-12 bg-white/60" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-16 md:py-32 bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 flex flex-col items-center justify-center text-center px-6 border-b border-stone-100 dark:border-stone-800">
            <div className="max-w-3xl space-y-4 animate-fade-in-up">
                {title && <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl text-stone-900 dark:text-white tracking-[0.15em] md:tracking-[0.2em] uppercase">{title}</h1>}
                {subtitle && <p className="text-[10px] md:text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">{subtitle}</p>}
                {!title && !subtitle && (
                    <h1 className="font-serif text-2xl md:text-4xl tracking-[0.2em] text-stone-300 dark:text-stone-700 uppercase italic">Varmina</h1>
                )}
            </div>
        </div>
    );
};

// ─── Categories Section ────────────────────────────────────────────────

const CategoriesSection: React.FC<{ config: Record<string, any> }> = ({ config }) => {
    const { products } = usePublicProducts();

    const categoryData = useMemo(() => {
        const available = products.filter(p => p.status !== ProductStatus.SOLD_OUT);
        const catMap = new Map<string, { count: number; image: string }>();

        available.forEach(p => {
            if (!p.category) return;
            const existing = catMap.get(p.category);
            if (!existing) {
                const img = p.images?.[0] || '';
                catMap.set(p.category, { count: 1, image: img });
            } else {
                existing.count++;
            }
        });

        return Array.from(catMap.entries()).map(([name, data]) => ({
            name,
            count: data.count,
            image: data.image,
        }));
    }, [products]);

    if (categoryData.length === 0) return null;

    const columns = config.columns || 3;
    const gridClass = columns === 2
        ? 'grid-cols-2'
        : columns === 4
            ? 'grid-cols-2 md:grid-cols-4'
            : 'grid-cols-2 lg:grid-cols-3';

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
            {/* Section Header */}
            {config.title && (
                <div className="text-center mb-10 md:mb-14">
                    <h2 className="font-serif text-2xl md:text-4xl tracking-[0.2em] text-stone-900 dark:text-white uppercase">
                        {config.title}
                    </h2>
                    {config.subtitle && (
                        <p className="text-[10px] md:text-xs text-stone-400 uppercase tracking-[0.25em] mt-3 font-bold">
                            {config.subtitle}
                        </p>
                    )}
                    <div className="w-12 h-[1px] bg-gold-500/60 mx-auto mt-5" />
                </div>
            )}

            {/* Category Cards Grid */}
            <div className={`grid ${gridClass} gap-4 md:gap-6`}>
                {categoryData.map(cat => (
                    <Link
                        key={cat.name}
                        href={`/category/${encodeURIComponent(cat.name)}`}
                        className="group relative overflow-hidden rounded-lg aspect-square bg-stone-100 dark:bg-stone-800 cursor-pointer block"
                    >
                            <img
                                src={cat.image}
                                alt={cat.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                loading="lazy"
                            />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-500" />

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-end p-6 md:p-8">
                            <h3 className="font-serif text-lg md:text-2xl text-white tracking-[0.15em] uppercase text-center drop-shadow-lg">
                                {cat.name}
                            </h3>
                            {config.show_product_count !== false && (
                                <p className="text-[9px] md:text-[10px] text-white/70 uppercase tracking-[0.3em] font-bold mt-2">
                                    {cat.count} {cat.count === 1 ? 'pieza' : 'piezas'}
                                </p>
                            )}
                            {/* Hover arrow */}
                            <div className="flex items-center gap-1.5 mt-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                <span className="text-[9px] text-gold-400 uppercase tracking-[0.2em] font-bold">Explorar</span>
                                <ArrowRight className="w-3 h-3 text-gold-400" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

// ─── Collections Section ───────────────────────────────────────────────

const CollectionsSection: React.FC<{ config: Record<string, any> }> = ({ config }) => {
    const { products } = usePublicProducts();

    const collectionData = useMemo(() => {
        const available = products.filter(p => p.status !== ProductStatus.SOLD_OUT);
        const colMap = new Map<string, { count: number; images: string[] }>();

        available.forEach(p => {
            const cols = Array.isArray(p.collections) ? p.collections : [];
            if (cols.length === 0) return;
            
            cols.forEach(col => {
                const existing = colMap.get(col);
                if (!existing) {
                    colMap.set(col, { count: 1, images: p.images?.slice(0, 1) || [] });
                } else {
                    existing.count++;
                    if (existing.images.length < 4 && p.images?.[0]) {
                        existing.images.push(p.images[0]);
                    }
                }
            });
        });

        let result = Array.from(colMap.entries()).map(([name, data]) => ({
            name,
            count: data.count,
            images: data.images,
        }));

        if (config.max_items > 0) {
            result = result.slice(0, config.max_items);
        }

        return result;
    }, [products, config.max_items]);

    if (collectionData.length === 0) return null;

    const columns = config.columns || 2;
    const gridClass = columns === 3
        ? 'grid-cols-2 lg:grid-cols-3'
        : columns === 4
            ? 'grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-2';

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
            {/* Section Header */}
            {config.title && (
                <div className="text-center mb-10 md:mb-14">
                    <h2 className="font-serif text-2xl md:text-4xl tracking-[0.2em] text-stone-900 dark:text-white uppercase">
                        {config.title}
                    </h2>
                    {config.subtitle && (
                        <p className="text-[10px] md:text-xs text-stone-400 uppercase tracking-[0.25em] mt-3 font-bold">
                            {config.subtitle}
                        </p>
                    )}
                    <div className="w-12 h-[1px] bg-gold-500/60 mx-auto mt-5" />
                </div>
            )}

            {/* Collection Cards Grid */}
            <div className={`grid ${gridClass} gap-4 md:gap-6`}>
                {collectionData.map(col => (
                    <Link
                        key={col.name}
                        href={`/collection/${encodeURIComponent(col.name)}`}
                        className="group relative overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800 cursor-pointer block"
                    >
                        {/* Image Mosaic or Single Image */}
                        <div className="aspect-square relative flex">
                            {col.images.length >= 4 ? (
                                // 2x2 mosaic
                                <div className="grid grid-cols-2 grid-rows-2 gap-[2px] w-full h-full p-0">
                                    {col.images.slice(0, 4).map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            alt=""
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ))}
                                </div>
                            ) : col.images.length >= 2 ? (
                                // Side-by-side
                                <div className="grid grid-cols-2 gap-[2px] w-full h-full p-0">
                                    {col.images.slice(0, 2).map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            alt=""
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ))}
                                </div>
                            ) : col.images[0] ? (
                                <img
                                    src={col.images[0]}
                                    alt={col.name}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-800" />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-500" />
                        </div>

                        {/* Content overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-end p-6 md:p-8">
                            <h3 className="font-serif text-lg md:text-2xl text-white tracking-[0.15em] uppercase text-center drop-shadow-lg">
                                {col.name}
                            </h3>
                            {config.show_product_count !== false && (
                                <p className="text-[9px] md:text-[10px] text-white/70 uppercase tracking-[0.3em] font-bold mt-2">
                                    {col.count} {col.count === 1 ? 'pieza' : 'piezas'}
                                </p>
                            )}
                            {/* Hover CTA */}
                            <div className="flex items-center gap-1.5 mt-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                <span className="text-[9px] text-gold-400 uppercase tracking-[0.2em] font-bold">Ver Colección</span>
                                <ArrowRight className="w-3 h-3 text-gold-400" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

// ─── Catalog Section (Product Grid with Search/Filters) ───────────────

type SortOption = 'newest' | 'price_asc' | 'price_desc';

const CatalogSection: React.FC<{ config: Record<string, any> }> = ({ config }) => {
    const { currency } = useStore();
    const { products, loading } = usePublicProducts();
    const searchParams = useSearchParams();

    const [layout, setLayout] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(300000);
    const [statusFilter, setStatusFilter] = useState<ProductStatus | 'All'>('All');
    const [categoryFilter, setCategoryFilter] = useState<string>(() => searchParams?.get('category') || 'All');
    const [collectionFilter, setCollectionFilter] = useState<string>(() => searchParams?.get('collection') || 'All');
    const [sort, setSort] = useState<SortOption>('newest');

    // Sync filters when URL params change
    useEffect(() => {
        const cat = searchParams?.get('category');
        const col = searchParams?.get('collection');
        if (cat) setCategoryFilter(cat);
        if (col) setCollectionFilter(col);
    }, [searchParams]);

    const showSearch = config.show_search !== false;
    const showFilters = config.show_filters !== false;
    const columns = config.columns || 4;
    const maxItems = config.max_items || 0;

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 600);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isFilterOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isFilterOpen]);

    const categories = useMemo(() =>
        ['All', ...Array.from(new Set(products.map(p => p.category).filter((c): c is string => !!c)))], [products]);

    const collections = useMemo(() =>
        ['All', ...Array.from(new Set(products.flatMap(p => p.collections || []).filter(Boolean)))], [products]);

    const filteredProducts = useMemo(() => {
        const q = debouncedSearch.toLowerCase();
        let result = products.filter(p => {
            if (p.status === ProductStatus.SOLD_OUT) return false;
            const matchesSearch = !q || p.name.toLowerCase().includes(q);
            const matchesPrice = p.price >= minPrice && (maxPrice === 300000 ? true : p.price <= maxPrice);
            const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
            const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
            const matchesCollection = collectionFilter === 'All' || (p.collections && p.collections.includes(collectionFilter));
            return matchesSearch && matchesPrice && matchesStatus && matchesCategory && matchesCollection;
        });

        result = result.sort((a, b) => {
            if (sort === 'price_asc') return a.price - b.price;
            if (sort === 'price_desc') return b.price - a.price;
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });

        return maxItems > 0 ? result.slice(0, maxItems) : result;
    }, [products, debouncedSearch, minPrice, maxPrice, statusFilter, categoryFilter, collectionFilter, sort, maxItems]);

    const activeFiltersCount = [
        statusFilter !== 'All', categoryFilter !== 'All', collectionFilter !== 'All',
        minPrice > 0 || maxPrice < 300000, sort !== 'newest'
    ].filter(Boolean).length;

    const clearAllFilters = useCallback(() => {
        setSearch(''); setStatusFilter('All'); setMinPrice(0); setMaxPrice(300000);
        setCategoryFilter('All'); setCollectionFilter('All'); setSort('newest');
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const gridClass = columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

    return (
        <>
            {/* Sticky Controls */}
            {(showSearch || showFilters) && (
                <div className="sticky top-16 z-30 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-100 dark:border-stone-800 transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="font-serif text-lg md:text-2xl tracking-[0.15em] text-stone-900 dark:text-white uppercase hidden md:block">Catálogo</h2>
                                <div className="flex items-center gap-3 flex-1 md:flex-initial justify-end">
                                    {showSearch && (
                                        <div className="relative flex-1 md:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                                            <input
                                                type="text" placeholder="Buscar..." value={search}
                                                onChange={e => setSearch(e.target.value)}
                                                className="w-full bg-stone-100 dark:bg-stone-900 rounded-full py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-gold-500 transition-all placeholder:text-stone-400 text-stone-900 dark:text-white"
                                            />
                                        </div>
                                    )}
                                    {showFilters && (
                                        <button onClick={() => setIsFilterOpen(true)} className="relative p-2.5 bg-stone-100 dark:bg-stone-900 rounded-full hover:bg-stone-200 transition-colors">
                                            <SlidersHorizontal className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                                            {activeFiltersCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 text-stone-900 rounded-full text-[9px] font-bold flex items-center justify-center">{activeFiltersCount}</span>}
                                        </button>
                                    )}
                                    <div className="hidden md:flex bg-stone-100 dark:bg-stone-900 rounded-full p-1">
                                        <button onClick={() => setLayout('grid')} className={cn('p-2 rounded-full transition-colors', layout === 'grid' ? 'bg-white dark:bg-stone-800 shadow-sm' : 'text-stone-400')}><Grid className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => setLayout('list')} className={cn('p-2 rounded-full transition-colors', layout === 'list' ? 'bg-white dark:bg-stone-800 shadow-sm' : 'text-stone-400')}><List className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Quick Category Pills */}
                            {categories.length > 2 && (
                                <div className="hidden md:flex items-center gap-2 overflow-x-auto scrollbar-hide border-t border-stone-50 dark:border-stone-900/50 pt-3">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategoryFilter(cat)}
                                            className={cn(
                                                "px-4 py-1.5 text-[10px] uppercase tracking-wider font-bold border rounded-full transition-all whitespace-nowrap shrink-0",
                                                categoryFilter === cat
                                                    ? 'bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900 dark:border-white'
                                                    : 'border-stone-200 dark:border-stone-800 text-stone-400 hover:border-stone-400 dark:hover:border-stone-600 hover:text-stone-600 dark:hover:text-stone-300'
                                            )}
                                        >
                                            {cat === 'All' ? 'Todas' : cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-6 md:py-12">
                {loading ? (
                    <div className={`grid ${gridClass} gap-4 md:gap-6`}>
                        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-24">
                        <Search className="w-12 h-12 mx-auto mb-4 text-stone-200 dark:text-stone-700" />
                        <p className="text-stone-400 text-sm uppercase tracking-widest mb-6">No se encontraron productos</p>
                        {activeFiltersCount > 0 && (
                            <button onClick={clearAllFilters} className="px-6 py-2.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs uppercase tracking-widest font-bold rounded-full hover:opacity-90 transition-opacity">
                                Limpiar Filtros
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Product count */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'pieza' : 'piezas'}
                            </p>
                        </div>

                        <div className={layout === 'grid' ? `grid ${gridClass} gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12` : 'space-y-4'}>
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} layout={layout} currency={currency} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Filter Drawer */}
            {isFilterOpen && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setIsFilterOpen(false)} />
                    <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-stone-950 z-50 shadow-2xl p-8 overflow-y-auto animate-slide-in-right">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-serif text-xl tracking-widest uppercase text-stone-900 dark:text-white">Filtros</h3>
                            <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-full"><X className="w-5 h-5 text-stone-400" /></button>
                        </div>
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Categoría</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(c => (
                                        <button key={c} onClick={() => setCategoryFilter(c)} className={cn('px-4 py-2 text-[10px] uppercase tracking-wider font-bold border rounded-full transition-all', categoryFilter === c ? 'bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900' : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:border-stone-400')}>
                                            {c === 'All' ? 'Todos' : c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Colección</label>
                                <div className="flex flex-wrap gap-2">
                                    {collections.map(c => (
                                        <button key={c} onClick={() => setCollectionFilter(c)} className={cn('px-4 py-2 text-[10px] uppercase tracking-wider font-bold border rounded-full transition-all', collectionFilter === c ? 'bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900' : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:border-stone-400')}>
                                            {c === 'All' ? 'Todos' : c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Ordenar</label>
                                <div className="space-y-2">
                                    {([['newest', 'Más Recientes'], ['price_asc', 'Precio: Menor a Mayor'], ['price_desc', 'Precio: Mayor a Menor']] as [SortOption, string][]).map(([val, label]) => (
                                        <button key={val} onClick={() => setSort(val)} className={cn('w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border', sort === val ? 'bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900' : 'border-stone-100 dark:border-stone-800 text-stone-400 hover:border-stone-300')}>
                                            {label} {sort === val && <Check className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-10 flex gap-3">
                            <button onClick={clearAllFilters} className="flex-1 py-3 border border-stone-200 dark:border-stone-700 rounded-full text-xs uppercase tracking-widest font-bold text-stone-400 hover:border-stone-400 transition-colors">Limpiar</button>
                            <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full text-xs uppercase tracking-widest font-bold">Aplicar</button>
                        </div>
                    </div>
                </>
            )}

            {/* Scroll to Top */}
            {showScrollTop && (
                <button onClick={scrollToTop} className="fixed bottom-6 right-6 p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full shadow-lg hover:shadow-xl transition-all z-30">
                    <ArrowUp className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                </button>
            )}
        </>
    );
};

// ─── Featured Collection ──────────────────────────────────────────────

const FeaturedSection: React.FC<{ config: Record<string, any> }> = ({ config }) => {
    const { currency } = useStore();
    const { products } = usePublicProducts();

    const filteredProducts = useMemo(() => {
        let result = products.filter(p => p.status !== ProductStatus.SOLD_OUT);
        if (config.collection_name) {
            result = result.filter(p => p.collections && p.collections.some(c => c.toLowerCase() === config.collection_name.toLowerCase()));
        }
        return result.slice(0, config.max_items || 6);
    }, [products, config.collection_name, config.max_items]);

    if (filteredProducts.length === 0) return null;

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-10 md:py-20">
            {config.title && (
                <div className="text-center mb-10 md:mb-14">
                    <h2 className="font-serif text-2xl md:text-4xl tracking-[0.2em] text-stone-900 dark:text-white uppercase">{config.title}</h2>
                    <div className="w-12 h-[1px] bg-gold-400/60 mx-auto mt-4" />
                </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} layout="grid" currency={currency} />
                ))}
            </div>
            {/* View All Link */}
            {config.collection_name && (
                <div className="text-center mt-10">
                    <Link
                        href={`/?collection=${encodeURIComponent(config.collection_name)}`}
                        className="inline-flex items-center gap-2 px-8 py-3 border border-stone-300 dark:border-stone-700 text-xs uppercase tracking-[0.2em] font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-stone-900 hover:border-stone-900 dark:hover:border-white transition-all duration-300 rounded-sm"
                    >
                        Ver Toda la Colección
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}
        </div>
    );
};

// ─── Text Section ─────────────────────────────────────────────────────

const TextSection: React.FC<{ config: Record<string, any> }> = ({ config }) => {
    const alignment = config.alignment || 'center';
    const alignClass = alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center';

    return (
        <div className={`max-w-4xl mx-auto px-6 md:px-12 py-12 md:py-20 ${alignClass}`}>
            {config.title && (
                <h2 className="font-serif text-2xl md:text-4xl tracking-[0.2em] text-stone-900 dark:text-white uppercase mb-6">{config.title}</h2>
            )}
            {config.body && (
                <p className="text-stone-600 dark:text-stone-400 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{config.body}</p>
            )}
        </div>
    );
};

// ─── Image Section ────────────────────────────────────────────────────

const ImageSection: React.FC<{ config: Record<string, any> }> = ({ config }) => {
    if (!config.image_url) return null;

    return (
        <div className={config.full_width !== false ? 'w-full' : 'max-w-5xl mx-auto px-4 md:px-8 py-8'}>
            <img src={config.image_url} alt={config.alt_text || ''} className="w-full h-auto object-cover" loading="lazy" />
        </div>
    );
};

// ─── Banner / CTA Section ─────────────────────────────────────────────

const BannerSection: React.FC<{ config: Record<string, any> }> = ({ config }) => {
    if (!config.text) return null;

    const bgColor = config.bg_color || '#1c1917';
    const isLight = parseInt(bgColor.replace('#', ''), 16) > 0x7FFFFF;

    return (
        <div className="w-full py-10 md:py-16 px-6 flex flex-col items-center justify-center text-center gap-6" style={{ backgroundColor: bgColor }}>
            <p className={`font-serif text-xl md:text-3xl tracking-[0.15em] uppercase ${isLight ? 'text-stone-900' : 'text-white'}`}>
                {config.text}
            </p>
            {config.btn_text && (
                <a href={config.btn_link || '/'} className={`inline-block px-8 py-3 border text-xs uppercase tracking-[0.3em] font-bold transition-all duration-300 ${isLight ? 'border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white' : 'border-white/40 text-white hover:bg-white hover:text-stone-900'}`}>
                    {config.btn_text}
                </a>
            )}
        </div>
    );
};

// ─── Divider Section ──────────────────────────────────────────────────

const DividerSection: React.FC<{ config: Record<string, any> }> = ({ config }) => {
    const style = config.style || 'line';

    if (style === 'space') return <div className="h-12 md:h-20" />;

    if (style === 'ornament') {
        return (
            <div className="flex items-center justify-center gap-4 py-8 md:py-12">
                <div className="w-16 h-[1px] bg-gold-400/40" />
                <div className="w-2 h-2 bg-gold-400/60 rotate-45" />
                <div className="w-16 h-[1px] bg-gold-400/40" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-8">
            <div className="h-[1px] bg-stone-200 dark:bg-stone-800 my-8 md:my-12" />
        </div>
    );
};

// ─── Section Renderer Map ─────────────────────────────────────────────

const SECTION_COMPONENTS: Record<string, React.FC<{ config: Record<string, any> }>> = {
    hero: HeroSection,
    catalog: CatalogSection,
    featured: FeaturedSection,
    categories: CategoriesSection,
    collections: CollectionsSection,
    text: TextSection,
    image: ImageSection,
    banner: BannerSection,
    divider: DividerSection,
};

// ─── Main Section Renderer ────────────────────────────────────────────

export const SectionRenderer: React.FC<{ prefetchedSections?: PageSection[] }> = ({ prefetchedSections }) => {
    const [sections, setSections] = useState<PageSection[]>(prefetchedSections || []);
    const [loading, setLoading] = useState(!prefetchedSections);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (prefetchedSections) return;

        const fetchSections = async () => {
            try {
                const data = await pageLayoutService.getSections('home');
                setSections(data);
            } catch (e) {
                console.error('Failed to load page sections:', e);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchSections();
    }, [prefetchedSections]);

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || sections.length === 0) return null;

    return (
        <div className="w-full min-h-screen bg-white dark:bg-stone-950">
            {sections.map(section => {
                const Component = SECTION_COMPONENTS[section.section_type];
                if (!Component) return null;
                return <Component key={section.id} config={section.config} />;
            })}
        </div>
    );
};
