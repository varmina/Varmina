'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '@/context/StoreContext';
import { usePublicProducts } from '@/hooks/use-public-products';
import { pageLayoutService, PageSection } from '@/services/pageLayoutService';
import { Product, ProductStatus } from '@/types';
import { ProductCard } from '@/components/products/product-card';
import { ProductDetail } from '@/components/products/product-detail';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, SlidersHorizontal, Grid, List, X, Check, ArrowUp } from 'lucide-react';
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
            <div className="relative w-full h-[60vh] md:h-[80vh] min-h-[400px] overflow-hidden group">
                <img src={imageUrl} alt={title || 'Hero'} className="w-full h-full object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-stone-900/60 flex flex-col items-center justify-center text-center p-6 md:p-12">
                    <div className="max-w-4xl space-y-6 animate-fade-in-up">
                        {title && (
                            <h1 className="font-serif text-4xl md:text-7xl text-white drop-shadow-2xl tracking-[0.25em] uppercase leading-tight font-light">{title}</h1>
                        )}
                        {subtitle && (
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-12 h-[1px] bg-gold-400/60" />
                                <p className="font-sans text-xs md:text-sm text-white/90 max-w-xl drop-shadow-md tracking-[0.4em] uppercase font-bold">{subtitle}</p>
                                <div className="w-12 h-[1px] bg-gold-400/60" />
                            </div>
                        )}
                        {ctaText && (
                            <a href={ctaLink} className="inline-block mt-4 px-8 py-3 bg-white/10 backdrop-blur border border-white/30 text-white text-xs uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-stone-900 transition-all duration-300">
                                {ctaText}
                            </a>
                        )}
                    </div>
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                        <div className="w-[1px] h-12 bg-white/60" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-20 md:py-32 bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 flex flex-col items-center justify-center text-center px-6 border-b border-stone-100 dark:border-stone-800">
            <div className="max-w-3xl space-y-4 animate-fade-in-up">
                {title && <h1 className="font-serif text-3xl md:text-5xl text-stone-900 dark:text-white tracking-[0.2em] uppercase">{title}</h1>}
                {subtitle && <p className="text-[10px] md:text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-[0.3em]">{subtitle}</p>}
                {!title && !subtitle && (
                    <h1 className="font-serif text-2xl md:text-4xl tracking-[0.2em] text-stone-300 dark:text-stone-700 uppercase italic">Varmina</h1>
                )}
            </div>
        </div>
    );
};

// ─── Catalog Section (Product Grid with Search/Filters) ───────────────

type SortOption = 'newest' | 'price_asc' | 'price_desc';

const CatalogSection: React.FC<{ config: Record<string, any> }> = ({ config }) => {
    const { currency } = useStore();
    const { products, loading } = usePublicProducts();

    const [layout, setLayout] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(300000);
    const [statusFilter, setStatusFilter] = useState<ProductStatus | 'All'>('All');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [collectionFilter, setCollectionFilter] = useState<string>('All');
    const [sort, setSort] = useState<SortOption>('newest');

    const showSearch = config.show_search !== false;
    const showFilters = config.show_filters !== false;
    const columns = config.columns || 4;
    const maxItems = config.max_items || 0;

    // URL handling for product detail
    useEffect(() => {
        if (selectedProduct) {
            window.history.pushState({ productId: selectedProduct.id }, '', `/product/${selectedProduct.id}`);
        }
    }, [selectedProduct]);

    useEffect(() => {
        const handlePopState = () => {
            if (selectedProduct) setSelectedProduct(null);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [selectedProduct]);

    const handleCloseProduct = useCallback(() => {
        setSelectedProduct(null);
        window.history.pushState(null, '', '/');
    }, []);

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
            const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q));
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
                        </div>
                    </div>
                </div>
            )}

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
                {loading ? (
                    <div className={`grid ${gridClass} gap-4 md:gap-6`}>
                        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="text-stone-400 text-sm uppercase tracking-widest">No se encontraron productos</p>
                    </div>
                ) : (
                    <div className={layout === 'grid' ? `grid ${gridClass} gap-4 md:gap-6` : 'space-y-4'}>
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} layout={layout} currency={currency} onClick={() => setSelectedProduct(product)} />
                        ))}
                    </div>
                )}
            </div>

            {/* Product Detail Modal */}
            <Modal isOpen={!!selectedProduct} onClose={handleCloseProduct} showCloseButton={false} size="xl">
                {selectedProduct && <ProductDetail product={selectedProduct} onClose={handleCloseProduct} currency={currency} />}
            </Modal>

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

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const filteredProducts = useMemo(() => {
        let result = products.filter(p => p.status !== ProductStatus.SOLD_OUT);
        if (config.collection_name) {
            result = result.filter(p => p.collections && p.collections.some(c => c.toLowerCase() === config.collection_name.toLowerCase()));
        }
        return result.slice(0, config.max_items || 6);
    }, [products, config.collection_name, config.max_items]);

    if (filteredProducts.length === 0) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
            {config.title && (
                <div className="text-center mb-10">
                    <h2 className="font-serif text-2xl md:text-4xl tracking-[0.2em] text-stone-900 dark:text-white uppercase">{config.title}</h2>
                    <div className="w-12 h-[1px] bg-gold-400/60 mx-auto mt-4" />
                </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} layout="grid" currency={currency} onClick={() => setSelectedProduct(product)} />
                ))}
            </div>
            <Modal isOpen={!!selectedProduct} onClose={() => { setSelectedProduct(null); window.history.pushState(null, '', '/'); }} showCloseButton={false} size="xl">
                {selectedProduct && <ProductDetail product={selectedProduct} onClose={() => { setSelectedProduct(null); window.history.pushState(null, '', '/'); }} currency={currency} />}
            </Modal>
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
    // Determine text color based on background brightness
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
    text: TextSection,
    image: ImageSection,
    banner: BannerSection,
    divider: DividerSection,
};

// ─── Main Section Renderer ────────────────────────────────────────────

export const SectionRenderer: React.FC = () => {
    const [sections, setSections] = useState<PageSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
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
    }, []);

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // If error or no sections, signal fallback
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
