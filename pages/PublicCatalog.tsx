
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductStatus, SortOption } from '../types';
import { Button, StatusBadge, Modal, Skeleton } from '../components/UI';
import { Search, SlidersHorizontal, Grid, List, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../constants';

// --- HELPER: FORMAT PRICE ---
const formatPrice = (price: number, currency: 'CLP' | 'USD') => {
    if (currency === 'CLP') {
        return `$${price.toLocaleString('es-CL')}`;
    }
    return `USD $${price.toLocaleString('en-US')}`;
};

// --- SUB-COMPONENT: PRODUCT CARD ---
const ProductCard: React.FC<{
    product: Product;
    currency: 'CLP' | 'USD';
    layout: 'grid' | 'list';
    onClick: (p: Product) => void
}> = ({
    product,
    currency,
    layout,
    onClick
}) => {
        const displayPrice = currency === 'CLP' ? product.price : Math.round(product.price / 950);

        return (
            <div
                className={`group cursor-pointer mb-6 md:mb-8 transition-all duration-300 ${layout === 'list' ? 'flex flex-col md:flex-row gap-4 md:gap-6 items-center border-b border-stone-100 dark:border-stone-800 pb-6 md:pb-8' : ''}`}
                onClick={() => onClick(product)}
            >
                <div className={`relative overflow-hidden bg-stone-100 aspect-[4/5] ${layout === 'list' ? 'w-full md:w-1/3 mb-0' : 'w-full mb-3 md:mb-4'}`}>
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 group-hover:opacity-0"
                    />
                    <img
                        src={product.images[1] || product.images[0]}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hidden md:flex">
                        <span className="bg-white text-stone-900 px-6 py-2 uppercase text-xs tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            Ver Detalles
                        </span>
                    </div>
                </div>

                <div className={`space-y-1 ${layout === 'list' ? 'flex-1 w-full text-left' : 'text-left'}`}>
                    <div className="flex justify-between items-start gap-2">
                        <h3 className={`font-serif text-stone-900 dark:text-white leading-tight group-hover:text-gold-600 transition-colors ${layout === 'grid' ? 'text-sm md:text-lg' : 'text-lg md:text-xl'}`}>
                            {product.name}
                        </h3>
                        <span className={`font-sans font-bold text-stone-500 dark:text-gold-200 whitespace-nowrap ${layout === 'grid' ? 'text-xs md:text-sm' : 'text-sm md:text-base'}`}>
                            {formatPrice(displayPrice, currency)}
                        </span>
                    </div>
                    <p className={`text-stone-500 dark:text-stone-400 ${layout === 'list' ? 'line-clamp-3 my-2 md:my-4 text-xs md:text-sm leading-relaxed' : 'text-[10px] md:text-xs line-clamp-1'}`}>
                        {product.description}
                    </p>
                    <div className="pt-1 md:pt-2 flex items-center justify-between">
                        <StatusBadge status={product.status} />
                        {layout === 'list' && (
                            <span className="text-[10px] uppercase tracking-widest text-gold-600 font-bold md:hidden">Detalles</span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

// --- SUB-COMPONENT: PRODUCT DETAIL MODAL ---
const ProductDetail = ({ product, currency, onClose }: { product: Product, currency: 'CLP' | 'USD', onClose: () => void }) => {
    const displayPrice = currency === 'CLP' ? product.price : Math.round(product.price / 950);
    const [activeImg, setActiveImg] = useState(0);

    return (
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="md:w-1/2 space-y-4">
                <div className="aspect-square bg-stone-100 overflow-hidden relative rounded-sm">
                    <img
                        src={product.images[activeImg]}
                        className="w-full h-full object-cover animate-in fade-in duration-500"
                        alt={product.name}
                    />
                    {product.images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === 0 ? product.images.length - 1 : prev - 1); }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-white/90 shadow-sm text-stone-900 rounded-full"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === product.images.length - 1 ? 0 : prev + 1); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-white/90 shadow-sm text-stone-900 rounded-full"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {product.images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImg(idx)}
                            className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 border-2 transition-all ${activeImg === idx ? 'border-gold-400 opacity-100' : 'border-transparent opacity-60'}`}
                        >
                            <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                        </button>
                    ))}
                </div>
            </div>

            <div className="md:w-1/2 flex flex-col justify-center">
                <h2 className="font-serif text-2xl md:text-3xl text-stone-900 dark:text-white mb-2">{product.name}</h2>
                <div className="text-xl md:text-2xl font-light text-gold-600 mb-4 md:mb-6">
                    {formatPrice(displayPrice, currency)}
                </div>

                <div className="prose prose-stone dark:prose-invert mb-6 md:mb-8 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                    {product.description}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-stone-400">Estado:</span>
                        <StatusBadge status={product.status} />
                    </div>

                    <div className="pt-6 md:pt-8 border-t border-stone-100 dark:border-stone-800">
                        <Button
                            className="w-full py-4 text-base md:text-lg"
                            disabled={product.status === ProductStatus.SOLD_OUT}
                        >
                            {product.status === ProductStatus.IN_STOCK ? 'Consultar' :
                                product.status === ProductStatus.MADE_TO_ORDER ? 'Solicitar Encargo' : 'Agotado'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- MAIN PAGE COMPONENT ---
export const PublicCatalog = () => {
    const { products, loading, currency } = useStore();

    const [layout, setLayout] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(50000000);
    const [statusFilter, setStatusFilter] = useState<ProductStatus | 'All'>('All');
    const [sort, setSort] = useState<SortOption>('newest');

    const filteredProducts = useMemo(() => {
        let result = products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
            const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
            const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
            return matchesSearch && matchesPrice && matchesStatus;
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
                                <h4 className="font-serif text-xs mb-3 text-stone-900 dark:text-white uppercase tracking-wider">Presupuesto</h4>
                                <div className="space-y-4">
                                    <input
                                        type="range" min="0" max="50000000" step="500000"
                                        value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
                                        className="w-full accent-gold-500 h-2 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                                        <span>$0</span>
                                        <span className="text-gold-600 font-bold">{maxPrice >= 50000000 ? 'Sin Límite' : `$${maxPrice.toLocaleString('es-CL')}`}</span>
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
                            <button onClick={() => { setSearch(''); setStatusFilter('All'); setMinPrice(0); setMaxPrice(50000000); }} className="text-[9px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900">Limpiar Todo</button>
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
                    <button onClick={() => { setSearch(''); setStatusFilter('All'); setMinPrice(0); setMaxPrice(50000000); }} className="mt-4 text-[10px] uppercase tracking-widest font-bold underline">Mostrar todos</button>
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
