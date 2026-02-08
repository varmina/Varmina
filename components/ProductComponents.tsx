import React, { useState } from 'react';
import { Product, ProductStatus } from '../types';
import { Button, StatusBadge } from './UI';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabaseProductService } from '../services/supabaseProductService';
import { useStore } from '../context/StoreContext';

const formatPrice = (price: number, currency: 'CLP' | 'USD') => {
    if (currency === 'CLP') {
        return `$${price.toLocaleString('es-CL')}`;
    }
    return `USD $${price.toLocaleString('en-US')}`;
};

export const ProductCard: React.FC<{
    product: Product;
    currency: 'CLP' | 'USD';
    layout: 'grid' | 'list';
    onClick: (p: Product) => void
}> = ({ product, currency, layout, onClick }) => {
    const { settings } = useStore();
    const exchangeRate = settings?.usd_exchange_rate || 950;
    const displayPrice = currency === 'CLP' ? product.price : Math.round(product.price / exchangeRate);

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

                {/* Custom Badge */}
                {product.badge && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-stone-900/80 backdrop-blur-sm text-white text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg">
                            {product.badge}
                        </span>
                    </div>
                )}

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hidden md:flex">
                    <span className="bg-white text-stone-900 px-6 py-2 uppercase text-xs tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-xl font-bold">
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
                {product.collection && (
                    <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-gold-600 font-bold">{product.collection}</p>
                )}
                <p className={`text-stone-500 dark:text-stone-400 ${layout === 'list' ? 'line-clamp-3 my-2 md:my-4 text-xs md:text-sm leading-relaxed' : 'text-[10px] md:text-xs line-clamp-1'}`}>
                    {product.description}
                </p>
                <div className="pt-1 md:pt-2">
                    <StatusBadge status={product.status} />
                </div>
            </div>
        </div>
    );
};

export const ProductDetail: React.FC<{
    product: Product;
    currency: 'CLP' | 'USD';
    onClose: () => void;
}> = ({ product, currency, onClose }) => {
    const { settings } = useStore();
    const [activeImg, setActiveImg] = useState(0);
    const primaryVariant = product.variants?.find(v => v.isPrimary);
    const [selectedVariant, setSelectedVariant] = useState<any>(primaryVariant || null);

    const imagesToDisplay = (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0)
        ? selectedVariant.images
        : product.images;

    const exchangeRate = settings?.usd_exchange_rate || 950;
    const basePrice = currency === 'CLP' ? product.price : Math.round(product.price / exchangeRate);
    const currentPrice = selectedVariant
        ? (currency === 'CLP' ? selectedVariant.price : Math.round(selectedVariant.price / exchangeRate))
        : basePrice;

    const handleWhatsApp = async () => {
        // Track interest
        await supabaseProductService.incrementWhatsappClicks(product.id);

        const number = settings?.whatsapp_number || '56927435294';
        const template = settings?.whatsapp_template || 'Hola Varmina, me gustaría consultar por la pieza: "{{product_name}}". ID: {{product_id}}';

        const message = template
            .replace('{{product_name}}', `${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''}`)
            .replace('{{product_id}}', product.id.slice(0, 8));

        const encoded = encodeURIComponent(message);
        window.open(`https://wa.me/${number}?text=${encoded}`, '_blank');
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 md:gap-12">
            <div className="md:w-1/2 space-y-4">
                <div className="aspect-[4/5] bg-stone-100 overflow-hidden relative rounded-sm shadow-inner">
                    <img
                        src={imagesToDisplay[activeImg] || product.images[0]}
                        className="w-full h-full object-cover animate-in fade-in duration-500"
                        alt={product.name}
                    />
                    {imagesToDisplay.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === 0 ? imagesToDisplay.length - 1 : prev - 1); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur shadow-xl text-stone-900 rounded-full hover:bg-gold-500 hover:text-white transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setActiveImg(prev => prev === imagesToDisplay.length - 1 ? 0 : prev + 1); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur shadow-xl text-stone-900 rounded-full hover:bg-gold-500 hover:text-white transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
                    {imagesToDisplay.map((img: string, idx: number) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImg(idx)}
                            className={`w-20 h-24 flex-shrink-0 border-2 transition-all rounded-sm overflow-hidden ${activeImg === idx ? 'border-gold-500 opacity-100 scale-105 shadow-md' : 'border-transparent opacity-60'}`}
                        >
                            <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                        </button>
                    ))}
                </div>
            </div>

            <div className="md:w-1/2 flex flex-col justify-start py-4">
                {product.collection && (
                    <span className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.3em] mb-4">{product.collection}</span>
                )}
                <h2 className="font-serif text-3xl md:text-5xl text-stone-900 dark:text-white mb-4 leading-tight">{product.name}</h2>
                <div className="text-2xl md:text-3xl font-light text-stone-800 dark:text-gold-200 mb-6 md:mb-10">
                    {formatPrice(currentPrice, currency)}
                </div>

                <div className="prose prose-stone dark:prose-invert mb-8 md:mb-12 text-sm md:text-base leading-relaxed text-stone-600 dark:text-stone-300">
                    {product.description}
                </div>

                {/* Variants Selection */}
                {product.variants && product.variants.length > 0 && (
                    <div className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">Seleccionar Opción</label>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setSelectedVariant(null)}
                                className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest border transition-all rounded-full ${!selectedVariant ? 'bg-stone-900 text-white border-stone-900 shadow-lg' : 'bg-transparent border-stone-200 text-stone-500 hover:border-gold-500'}`}
                            >
                                Estándar
                            </button>
                            {product.variants.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => { setSelectedVariant(v); setActiveImg(0); }}
                                    className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest border transition-all rounded-full ${selectedVariant?.id === v.id ? 'bg-stone-900 text-white border-stone-900 shadow-lg' : 'bg-transparent border-stone-200 text-stone-500 hover:border-gold-500'}`}
                                >
                                    {v.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-6 md:mt-auto border-t border-stone-100 dark:border-stone-800 pt-8">
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Entrega:</span>
                        <StatusBadge status={product.status} />
                    </div>

                    <Button
                        className="w-full py-5 text-lg font-bold uppercase tracking-[0.2em]"
                        disabled={product.status === ProductStatus.SOLD_OUT}
                        onClick={handleWhatsApp}
                    >
                        Consultar
                    </Button>
                </div>
            </div>
        </div>
    );
};
