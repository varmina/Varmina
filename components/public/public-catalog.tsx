'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useStore } from '@/context/StoreContext';
import { usePublicProducts } from '@/hooks/use-public-products';
import { Product, ProductStatus } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, SlidersHorizontal, Grid, List, X, Check, ArrowUp } from 'lucide-react';
import { ProductCard } from '@/components/products/product-card';
import { ProductDetail } from '@/components/products/product-detail';
import { cn } from '@/lib/utils';

type SortOption = 'newest' | 'price_asc' | 'price_desc';

export const PublicCatalog = () => {
    const { currency, settings } = useStore();
    const { products, loading } = usePublicProducts();

    const [layout, setLayout] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Filters
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(300000);
    const [statusFilter, setStatusFilter] = useState<ProductStatus | 'All'>('All');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [collectionFilter, setCollectionFilter] = useState<string>('All');
    const [sort, setSort] = useState<SortOption>('newest');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Scroll to top button
    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 600);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const categories = useMemo(() =>
        ['All', ...Array.from(new Set(products.map(p => p.category).filter((c): c is string => !!c)))],
        [products]
    );

    const collections = useMemo(() =>
        ['All', ...Array.from(new Set(products.map(p => p.collection).filter((c): c is string => !!c)))],
        [products]
    );

    // Filtering Logic (uses debounced search)
    const filteredProducts = useMemo(() => {
        const q = debouncedSearch.toLowerCase();
        let result = products.filter(p => {
            // Never show sold out products in public catalog
            if (p.status === ProductStatus.SOLD_OUT) return false;
            const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q));
            const matchesPrice = p.price >= minPrice && (maxPrice === 300000 ? true : p.price <= maxPrice);
            const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
            const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
            const matchesCollection = collectionFilter === 'All' || p.collection === collectionFilter;
            return matchesSearch && matchesPrice && matchesStatus && matchesCategory && matchesCollection;
        });

        return result.sort((a, b) => {
            if (sort === 'price_asc') return a.price - b.price;
            if (sort === 'price_desc') return b.price - a.price;
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
    }, [products, debouncedSearch, minPrice, maxPrice, statusFilter, categoryFilter, collectionFilter, sort]);

    // Prevent body scroll when filter drawer is open
    useEffect(() => {
        if (isFilterOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isFilterOpen]);

    const activeFiltersCount = [
        statusFilter !== 'All',
        categoryFilter !== 'All',
        collectionFilter !== 'All',
        minPrice > 0 || maxPrice < 300000,
        sort !== 'newest'
    ].filter(Boolean).length;

    const clearAllFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('All');
        setMinPrice(0);
        setMaxPrice(300000);
        setCategoryFilter('All');
        setCollectionFilter('All');
        setSort('newest');
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <div className="w-full min-h-screen bg-white dark:bg-stone-950">

            {/* HERO SECTION */}
            {settings?.hero_image_url ? (
                <div className="relative w-full h-[60vh] md:h-[80vh] min-h-[400px] overflow-hidden group">
                    <img
                        src={settings.hero_image_url}
                        alt={settings.hero_title || "Varmina Collection"}
                        className="w-full h-full object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110"
                    />
                    {/* Deep Premium Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-stone-900/60 flex flex-col items-center justify-center text-center p-6 md:p-12">
                        <div className="max-w-4xl space-y-6 animate-fade-in-up">
                            {settings.hero_title && (
                                <h1 className="font-serif text-4xl md:text-7xl text-white drop-shadow-2xl tracking-[0.25em] uppercase leading-tight font-light">
                                    {settings.hero_title}
                                </h1>
                            )}
                            {settings.hero_subtitle && (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="w-12 h-[1px] bg-gold-400/60" />
                                    <p className="font-sans text-xs md:text-sm text-white/90 max-w-xl drop-shadow-md tracking-[0.4em] uppercase font-bold">
                                        {settings.hero_subtitle}
                                    </p>
                                    <div className="w-12 h-[1px] bg-gold-400/60" />
                                </div>
                            )}
                        </div>

                        {/* Scroll Indicator */}
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                            <div className="w-[1px] h-12 bg-white/60" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full py-20 md:py-32 bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 flex flex-col items-center justify-center text-center px-6 border-b border-stone-100 dark:border-stone-800">
                    <div className="max-w-3xl space-y-4 animate-fade-in-up">
                        {settings?.hero_title && (
                            <h1 className="font-serif text-3xl md:text-5xl text-stone-900 dark:text-white tracking-[0.2em] uppercase">
                                {settings.hero_title}
                            </h1>
                        )}
                        {settings?.hero_subtitle && (
                            <p className="text-[10px] md:text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-[0.3em]">
                                {settings.hero_subtitle}
                            </p>
                        )}
                        {!settings?.hero_title && !settings?.hero_subtitle && (
                            <h1 className="font-serif text-2xl md:text-4xl tracking-[0.2em] text-stone-300 dark:text-stone-700 uppercase italic">
                                {settings?.brand_name || 'Varmina'}
                            </h1>
                        )}
                    </div>
                </div>
            )}

            {/* --- Sticky Header / Controls --- */}
            <div className="sticky top-16 z-30 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-100 dark:border-stone-800 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex flex-col gap-4">
                        {/* Top: Title & Search */}
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="font-serif text-lg md:text-2xl tracking-[0.15em] text-stone-900 dark:text-white uppercase hidden md:block">
                                Catálogo
                            </h2>

                            {/* Search */}
                            <div className="relative flex-1 md:max-w-md group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-gold-500 transition-colors pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="BUSCAR PIEZAS"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-10 py-2 bg-stone-50 dark:bg-stone-900 border border-transparent focus:border-stone-300 dark:focus:border-stone-700 rounded-full text-xs md:text-sm uppercase tracking-widest placeholder:text-stone-400 focus:outline-none transition-all font-sans text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-stone-800"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Desktop Layout Toggles */}
                            <div className="hidden md:flex items-center gap-2 border-l border-stone-200 dark:border-stone-800 pl-4">
                                <button
                                    onClick={() => setLayout('grid')}
                                    className={cn("p-2 rounded-md transition-colors", layout === 'grid' ? 'text-stone-900 dark:text-white' : 'text-stone-400 hover:text-stone-600')}
                                    aria-label="Vista de cuadrícula"
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setLayout('list')}
                                    className={cn("p-2 rounded-md transition-colors", layout === 'list' ? 'text-stone-900 dark:text-white' : 'text-stone-400 hover:text-stone-600')}
                                    aria-label="Vista de lista"
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Bottom: Filter Bar */}
                        <div className="flex items-center justify-between md:justify-end border-t border-stone-50 dark:border-stone-900/50 pt-3 md:border-none md:pt-0">
                            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest md:hidden">
                                {filteredProducts.length} Piezas
                            </span>

                            <button
                                onClick={() => setIsFilterOpen(true)}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900 dark:text-white hover:text-gold-600 transition-colors"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filtros {activeFiltersCount > 0 && <span className="text-gold-600">({activeFiltersCount})</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="aspect-[3/4] w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-3 w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-stone-50 dark:bg-stone-900 rounded-full flex items-center justify-center mb-6 text-stone-300">
                            <Search className="w-8 h-8" />
                        </div>
                        <h3 className="font-serif text-xl md:text-2xl text-stone-900 dark:text-white mb-2">Sin resultados</h3>
                        <p className="text-stone-500 dark:text-stone-400 max-w-sm mx-auto mb-8 text-sm leading-relaxed">
                            No encontramos piezas que coincidan con tu búsqueda. Intenta ajustar los filtros.
                        </p>
                        <button
                            onClick={clearAllFilters}
                            className="px-8 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold uppercase tracking-[0.2em] rounded hover:opacity-90 transition-opacity"
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Section Title */}
                        {!debouncedSearch && filteredProducts.length > 0 && (
                            <div className="mb-8 md:mb-12 text-center animate-fade-in-up">
                                <h3 className="font-serif text-xl md:text-3xl text-stone-900 dark:text-white uppercase tracking-[0.2em]">
                                    {categoryFilter !== 'All' ? categoryFilter : (collectionFilter !== 'All' ? collectionFilter : 'Colección Exclusiva')}
                                </h3>
                                <div className="w-12 h-[1px] bg-gold-500 mx-auto mt-4" />
                                <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-3 font-bold">
                                    {filteredProducts.length} {filteredProducts.length === 1 ? 'pieza' : 'piezas'}
                                </p>
                            </div>
                        )}

                        {/* Product Grid / List */}
                        <div className={cn(
                            "animate-fade-in",
                            layout === 'grid'
                                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-16'
                                : 'flex flex-col gap-6 max-w-3xl mx-auto'
                        )}>
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    currency={currency}
                                    layout={layout}
                                    onClick={setSelectedProduct}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* --- Filter Drawer --- */}
            <div className={cn("fixed inset-0 z-50 transition-visibility duration-500", isFilterOpen ? 'visible' : 'invisible')}>
                {/* Backdrop */}
                <div
                    className={cn("absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-500", isFilterOpen ? 'opacity-100' : 'opacity-0')}
                    onClick={() => setIsFilterOpen(false)}
                />

                {/* Drawer Panel */}
                <div className={cn(
                    "absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-stone-950 shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    isFilterOpen ? 'translate-x-0' : 'translate-x-full'
                )}>
                    <div className="flex flex-col h-full">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
                            <h3 className="font-serif text-xl text-stone-900 dark:text-white uppercase tracking-wider">Filtros</h3>
                            <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-stone-500" />
                            </button>
                        </div>

                        {/* Drawer Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-10">

                            {/* Sort Section */}
                            <section>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">Ordenar Por</h4>
                                <div className="space-y-2">
                                    {[
                                        { value: 'newest', label: 'Más Recientes' },
                                        { value: 'price_asc', label: 'Precio: Menor a Mayor' },
                                        { value: 'price_desc', label: 'Precio: Mayor a Menor' }
                                    ].map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setSort(option.value as SortOption)}
                                            className={cn(
                                                "flex items-center justify-between w-full p-3 text-sm rounded-lg transition-all",
                                                sort === option.value
                                                    ? 'bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-white font-bold'
                                                    : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-900/50'
                                            )}
                                        >
                                            {option.label}
                                            {sort === option.value && <Check className="w-4 h-4 text-gold-500" />}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Categories Section */}
                            <section>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">Categoría</h4>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategoryFilter(cat)}
                                            className={cn(
                                                "px-4 py-2 text-xs uppercase tracking-wider border rounded-full transition-all",
                                                categoryFilter === cat
                                                    ? 'bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900 dark:border-white'
                                                    : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:border-gold-500'
                                            )}
                                        >
                                            {cat === 'All' ? 'Todas' : cat}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Collections Section */}
                            {collections.length > 1 && (
                                <section>
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">Colección</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {collections.map(col => (
                                            <button
                                                key={col}
                                                onClick={() => setCollectionFilter(col)}
                                                className={cn(
                                                    "px-4 py-2 text-xs uppercase tracking-wider border rounded-full transition-all",
                                                    collectionFilter === col
                                                        ? 'bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900 dark:border-white'
                                                        : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:border-gold-500'
                                                )}
                                            >
                                                {col === 'All' ? 'Todas' : col}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Price Range Section */}
                            <section>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">Rango de Precio</h4>
                                <div className="px-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-white mb-4 font-mono">
                                        <span>${minPrice.toLocaleString()}</span>
                                        <span>${maxPrice === 300000 ? '300,000+' : maxPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] text-stone-400 mb-1 block">Mínimo</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="300000"
                                                step="10000"
                                                value={minPrice}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    if (val <= maxPrice) setMinPrice(val);
                                                }}
                                                className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-stone-400 mb-1 block">Máximo</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="300000"
                                                step="10000"
                                                value={maxPrice}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    if (val >= minPrice) setMaxPrice(val);
                                                }}
                                                className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Status Section */}
                            <section>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">Estado</h4>
                                <div className="space-y-2">
                                    {(['All', ...Object.values(ProductStatus)] as (ProductStatus | 'All')[]).map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={cn(
                                                "flex items-center gap-3 w-full p-2 rounded-md transition-all",
                                                statusFilter === status && 'bg-stone-50 dark:bg-stone-900/50'
                                            )}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                                                statusFilter === status ? 'border-gold-500 bg-gold-500' : 'border-stone-300 dark:border-stone-600'
                                            )}>
                                                {statusFilter === status && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                            </div>
                                            <span className={cn(
                                                "text-xs uppercase tracking-wide",
                                                statusFilter === status ? 'text-stone-900 dark:text-white font-bold' : 'text-stone-500'
                                            )}>
                                                {status === 'All' ? 'Todos' : status}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/30 pb-safe">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => { clearAllFilters(); setIsFilterOpen(false); }}
                                    className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-800 transition-colors"
                                >
                                    Limpiar
                                </button>
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="flex-[2] py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold uppercase tracking-widest rounded-sm shadow-lg hover:opacity-90 transition-opacity"
                                >
                                    Ver {filteredProducts.length} Joyas
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Scroll to Top --- */}
            <button
                onClick={scrollToTop}
                className={cn(
                    "fixed bottom-6 left-6 z-40 p-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full shadow-xl transition-all duration-300",
                    showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                )}
                aria-label="Volver arriba"
            >
                <ArrowUp className="w-4 h-4" />
            </button>

            {/* --- Product Detail Modal --- */}
            <Modal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} showCloseButton={false} size="xl">
                {selectedProduct && <ProductDetail product={selectedProduct} currency={currency} onClose={() => setSelectedProduct(null)} />}
            </Modal>
        </div>
    );
};
