import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { usePublicProducts } from '../hooks/usePublicProducts';
import { Product, ProductStatus, SortOption } from '../types';
import { Modal, Skeleton } from '../components/UI';
import { Search, SlidersHorizontal, Grid, List, X } from 'lucide-react';
import { ProductCard, ProductDetail } from '../components/ProductComponents';

// --- MAIN PAGE COMPONENT ---
export const PublicCatalog = () => {
    const { currency } = useStore();
    const { products, loading, error } = usePublicProducts();

    const [layout, setLayout] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(300000);
    const [statusFilter, setStatusFilter] = useState<ProductStatus | 'All'>('All');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [collectionFilter, setCollectionFilter] = useState<string>('All');
    const [sort, setSort] = useState<SortOption>('newest');

    const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))], [products]);
    const collections = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.collection).filter(Boolean)))], [products]);

    // Filtering Logic
    const filteredProducts = useMemo(() => {
        let result = products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
            const matchesPrice = p.price >= minPrice && (maxPrice === 300000 ? true : p.price <= maxPrice);
            const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
            const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
            const matchesCollection = collectionFilter === 'All' || p.collection === collectionFilter;
            return matchesSearch && matchesPrice && matchesStatus && matchesCategory && matchesCollection;
        });

        return result.sort((a, b) => {
            if (sort === 'price_asc') return a.price - b.price;
            if (sort === 'price_desc') return b.price - a.price;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }, [products, search, minPrice, maxPrice, statusFilter, categoryFilter, collectionFilter, sort]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 gap-4">
                <h2 className="font-serif text-xl md:text-3xl tracking-[0.2em] text-stone-800 dark:text-stone-200 uppercase">
                    Catálogo
                </h2>

                <div className="flex items-center gap-2 md:gap-4 shrink-0 self-end md:self-auto">
                    {/* Unique Search Bar */}
                    <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-48 md:w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-stone-50 dark:bg-stone-900 border-none outline-none text-xs p-2 text-stone-600 dark:text-stone-300 placeholder-stone-400 font-serif"
                            autoFocus={isSearchOpen}
                        />
                    </div>
                    <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-400 hover:text-stone-900 dark:hover:text-gold-400 transition-colors" title="Buscar">
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-full transition-colors ${showFilters ? 'bg-stone-900 text-white dark:bg-gold-500 dark:text-stone-900' : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-gold-400'}`}
                        title="Filtros"
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                    </button>

                    <div className="h-6 w-px bg-stone-200 dark:bg-stone-800 mx-1"></div>

                    {/* Layout Toggles */}
                    <button onClick={() => setLayout('grid')} className={`p-2 rounded-md transition-colors ${layout === 'grid' ? 'bg-stone-100 dark:bg-stone-800 text-gold-600 dark:text-gold-400' : 'text-stone-400'}`}>
                        <Grid className="w-5 h-5" />
                    </button>
                    <button onClick={() => setLayout('list')} className={`p-2 rounded-md transition-colors ${layout === 'list' ? 'bg-stone-100 dark:bg-stone-800 text-gold-600 dark:text-gold-400' : 'text-stone-400'}`}>
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Filters Area */}
            <div className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${showFilters ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
                {showFilters && (
                    <div className="bg-stone-50 dark:bg-stone-900/50 p-6 md:p-8 rounded-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {/* Price Range */}
                        <div className="space-y-4">
                            <h4 className="font-serif text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-4 border-b border-stone-200 dark:border-stone-800 pb-2">Rango de Precio</h4>
                            <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400 mb-2">
                                <span>${minPrice.toLocaleString()}</span>
                                <span>${maxPrice === 300000 ? '300,000+' : maxPrice.toLocaleString()}</span>
                            </div>
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
                                className="w-full h-1 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-gold-500"
                            />
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
                                className="w-full h-1 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-gold-500 mt-2"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-4">
                            <h4 className="font-serif text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-4 border-b border-stone-200 dark:border-stone-800 pb-2">Estado</h4>
                            <div className="flex flex-col gap-2">
                                {['All', ...Object.values(ProductStatus)].map(status => (
                                    <label key={status} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-3 h-3 border border-stone-300 dark:border-stone-600 rounded-full flex items-center justify-center transition-colors ${statusFilter === status ? 'border-gold-500 bg-gold-500' : 'group-hover:border-stone-400'}`}>
                                            {statusFilter === status && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name="status"
                                            className="hidden"
                                            checked={statusFilter === status}
                                            onChange={() => setStatusFilter(status as any)}
                                        />
                                        <span className={`text-[11px] uppercase tracking-wider transition-colors ${statusFilter === status ? 'text-stone-900 dark:text-white font-bold' : 'text-stone-500 dark:text-stone-400 group-hover:text-stone-700'}`}>
                                            {status === 'All' ? 'Todos' : status}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="space-y-4">
                            <h4 className="font-serif text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-4 border-b border-stone-200 dark:border-stone-800 pb-2">Ordenar Por</h4>
                            <div className="flex flex-col gap-2">
                                {[
                                    { value: 'newest', label: 'Más Recientes' },
                                    { value: 'price_asc', label: 'Precio: Menor a Mayor' },
                                    { value: 'price_desc', label: 'Precio: Mayor a Menor' }
                                ].map(option => (
                                    <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-3 h-3 border border-stone-300 dark:border-stone-600 rounded-full flex items-center justify-center transition-colors ${sort === option.value ? 'border-gold-500 bg-gold-500' : 'group-hover:border-stone-400'}`}>
                                            {sort === option.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name="sort"
                                            className="hidden"
                                            checked={sort === option.value}
                                            onChange={() => setSort(option.value as any)}
                                        />
                                        <span className={`text-[11px] uppercase tracking-wider transition-colors ${sort === option.value ? 'text-stone-900 dark:text-white font-bold' : 'text-stone-500 dark:text-stone-400 group-hover:text-stone-700'}`}>
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="space-y-4">
                            <h4 className="font-serif text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-4 border-b border-stone-200 dark:border-stone-800 pb-2">Categoría</h4>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`px-3 py-1 text-[10px] uppercase tracking-widest border rounded-sm transition-all ${categoryFilter === cat ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 border-stone-900 dark:border-white' : 'text-stone-500 border-stone-200 dark:border-stone-700 hover:border-stone-400'}`}
                                    >
                                        {cat === 'All' ? 'Todas' : cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="aspect-[4/5] rounded-sm" />)}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                    <Search className="w-10 h-10 mb-4 opacity-10" />
                    <p className="font-serif text-lg">Sin resultados para esta búsqueda</p>
                    <button onClick={() => { setSearch(''); setStatusFilter('All'); setMinPrice(0); setMaxPrice(300000); setCategoryFilter('All'); setCollectionFilter('All'); }} className="mt-4 text-[10px] uppercase tracking-widest font-bold underline">Mostrar todos</button>
                </div>
            ) : (
                <div className={layout === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8' : 'flex flex-col gap-2 md:gap-4'}>
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
            )}

            <Modal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)}>
                {selectedProduct && <ProductDetail product={selectedProduct} currency={currency} onClose={() => setSelectedProduct(null)} />}
            </Modal>

        </div>
    );
};