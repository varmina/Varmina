import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductStatus, SortOption } from '../types';
import { Modal, Skeleton } from '../components/UI';
import { Search, SlidersHorizontal, Grid, List, X } from 'lucide-react';
import { ProductCard, ProductDetail } from '../components/ProductComponents';

// --- MAIN PAGE COMPONENT ---
export const PublicCatalog = () => {
    const { products, loading, currency } = useStore();

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
    }, [products, search, minPrice, maxPrice, statusFilter, sort]);

    const sortOptions = [
        { value: 'newest', label: 'Recientes' },
        { value: 'price_asc', label: 'Menor Precio' },
        { value: 'price_desc', label: 'Mayor Precio' },
    ];

    return (
        <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl min-h-screen">

            {/* Header & Controls Section */}
            <div className="sticky top-16 z-30 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur py-3 md:py-4 mb-6 md:mb-8 -mx-4 px-4 border-b border-stone-200 dark:border-stone-800 transition-colors">

                <div className="flex items-center justify-between gap-2">
                    <div className="hidden lg:block w-1/4">
                        <span className="text-[10px] font-serif tracking-[0.3em] text-stone-500 uppercase">
                            {filteredProducts.length} Productos
                        </span>
                    </div>

                    <div className="flex-1 lg:w-1/2 text-left md:text-center">
                        <h2 className="font-serif text-sm md:text-xl tracking-[0.2em] text-stone-900 dark:text-white uppercase truncate">
                            Catálogo
                        </h2>
                    </div>

                    <div className="flex items-center justify-end gap-1 md:gap-4 lg:w-1/4 shrink-0">
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={`p-2.5 md:p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors ${isSearchOpen ? 'text-gold-500 bg-stone-100 dark:bg-stone-800' : 'text-stone-400'}`}
                        >
                            <Search className="w-4 h-4 md:w-5 md:h-5" />
                        </button>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2.5 md:p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors ${showFilters ? 'text-gold-500 bg-stone-100 dark:bg-stone-800' : 'text-stone-400'}`}
                        >
                            <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
                        </button>

                        <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1 hidden sm:block" />

                        <div className="flex gap-1">
                            <button
                                onClick={() => setLayout('grid')}
                                className={`p-2.5 md:p-2 rounded transition-colors hover:bg-stone-200 dark:hover:bg-stone-800 ${layout === 'grid' ? 'text-gold-500 bg-stone-100 dark:bg-stone-800' : 'text-stone-400'}`}
                            >
                                <Grid className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                            <button
                                onClick={() => setLayout('list')}
                                className={`p-2.5 md:p-2 rounded transition-colors hover:bg-stone-200 dark:hover:bg-stone-800 ${layout === 'list' ? 'text-gold-500 bg-stone-100 dark:bg-stone-800' : 'text-stone-400'}`}
                            >
                                <List className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {isSearchOpen && (
                    <div className="mt-3 animate-in slide-in-from-top-2 fade-in duration-200 border-t border-stone-100 dark:border-stone-800 pt-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar joya..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                                className="w-full bg-stone-100 dark:bg-stone-800 border-none rounded py-3 pl-4 pr-10 text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-gold-500 placeholder:text-stone-400 outline-none"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 p-1">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
                            <div>
                                <h4 className="font-serif text-xs mb-3 text-stone-900 dark:text-white uppercase tracking-wider">Ordenar</h4>
                                <div className="space-y-3">
                                    {sortOptions.map(opt => (
                                        <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 border rounded-full flex items-center justify-center transition-colors ${sort === opt.value ? 'border-gold-500 bg-gold-50' : 'border-stone-300'}`}>
                                                {sort === opt.value && <div className="w-2.5 h-2.5 bg-gold-500 rounded-full" />}
                                            </div>
                                            <input type="radio" name="sort" className="hidden" checked={sort === opt.value} onChange={() => setSort(opt.value as SortOption)} />
                                            <span className={`text-xs uppercase tracking-widest ${sort === opt.value ? 'text-gold-600 font-bold' : 'text-stone-500 dark:text-stone-300'}`}>
                                                {opt.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-serif text-xs mb-3 text-stone-900 dark:text-white uppercase tracking-wider">Categoría</h4>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full bg-transparent border border-stone-200 dark:border-stone-800 p-3 text-[10px] uppercase tracking-widest outline-none focus:border-gold-500"
                                >
                                    {categories.map(c => <option key={c} value={c || ''}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <h4 className="font-serif text-xs mb-3 text-stone-900 dark:text-white uppercase tracking-wider">Colección</h4>
                                <select
                                    value={collectionFilter}
                                    onChange={(e) => setCollectionFilter(e.target.value)}
                                    className="w-full bg-transparent border border-stone-200 dark:border-stone-800 p-3 text-[10px] uppercase tracking-widest outline-none focus:border-gold-500"
                                >
                                    {collections.map(c => <option key={c} value={c || ''}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <h4 className="font-serif text-xs mb-3 text-stone-900 dark:text-white uppercase tracking-wider">Presupuesto</h4>
                                <div className="space-y-4">
                                    <input
                                        type="range" min="0" max="300000" step="10000"
                                        value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
                                        className="w-full accent-gold-500 h-2 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                                        <span>$0</span>
                                        <span className="text-gold-600 font-bold">{maxPrice >= 300000 ? 'Sin Límite' : `$${maxPrice.toLocaleString('es-CL')}`}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-serif text-xs mb-3 text-stone-900 dark:text-white uppercase tracking-wider">Estado</h4>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setStatusFilter('All')}
                                        className={`px-4 py-2 text-[9px] uppercase tracking-widest border transition-all ${statusFilter === 'All'
                                            ? 'bg-stone-900 text-white border-stone-900 dark:bg-gold-500 dark:border-gold-500'
                                            : 'text-stone-500 border-stone-200 dark:border-stone-800'}`}
                                    >
                                        Todos
                                    </button>
                                    {Object.values(ProductStatus).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status as any)}
                                            className={`px-4 py-2 text-[9px] uppercase tracking-widest border transition-all ${statusFilter === status
                                                ? 'bg-stone-900 text-white border-stone-900 dark:bg-gold-500 dark:border-gold-500'
                                                : 'text-stone-500 border-stone-200 dark:border-stone-800'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
                            <button onClick={() => { setSearch(''); setStatusFilter('All'); setMinPrice(0); setMaxPrice(300000); setCategoryFilter('All'); setCollectionFilter('All'); }} className="text-[9px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900">Limpiar Todo</button>
                            <button onClick={() => setShowFilters(false)} className="text-[9px] uppercase tracking-[0.2em] font-bold text-gold-600 border border-gold-600 px-4 py-1.5 rounded-full">
                                Aplicar
                            </button>
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