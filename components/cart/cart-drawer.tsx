'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { X, ShoppingBag, Plus, Minus, Trash2, MessageCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';

export const CartDrawer: React.FC = () => {
    const { items, isOpen, setIsOpen, updateQuantity, removeItem, clearCart, totalItems, totalPrice } = useCart();
    const { settings, currency } = useStore();

    if (!isOpen) return null;

    const exchangeRate = settings?.usd_exchange_rate || 950;

    const getDisplayPrice = (price: number) => {
        return currency === 'CLP' ? price : Math.ceil(price / exchangeRate);
    };

    const handleSendQuote = () => {
        if (!settings?.whatsapp_number) {
            alert('Número de WhatsApp no configurado.');
            return;
        }

        const phone = settings.whatsapp_number.replace(/\D/g, '');
        let header = `Hola *${settings.brand_name}*, me interesan las siguientes piezas:\n\n`;
        const footer = `\n\nTotal Estimado: ${formatPrice(getDisplayPrice(totalPrice), currency)}\n\nQuedo atento a su respuesta.`;

        if (settings.whatsapp_template) {
            header = settings.whatsapp_template
                .replace(/{{brand_name}}/g, settings.brand_name)
                .replace(/{{total_price}}/g, formatPrice(getDisplayPrice(totalPrice), currency))
                + '\n\n';
        }

        const itemsList = items.map(item => {
            const price = formatPrice(getDisplayPrice(item.product.price), currency);
            const variantScale = item.selectedVariant ? ` [${item.selectedVariant}]` : '';
            return `💎 *${item.product.name}${variantScale}* (x${item.quantity})\n   Precio: ${price}\n   Ref: ${item.product.id.slice(0, 8)}`;
        }).join('\n\n');

        const message = encodeURIComponent(header + itemsList + (settings.whatsapp_template ? '' : footer));
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-stone-900 shadow-2xl z-50 flex flex-col animate-slide-in-right"
                role="dialog"
                aria-label="Cotización"
                aria-modal="true"
            >
                {/* Header */}
                <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <h2 className="font-serif text-lg md:text-xl text-stone-900 dark:text-gold-200 uppercase tracking-widest flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-gold-500" />
                        Tu Selección
                        <span className="text-xs bg-brand-dark text-white dark:bg-gold-600 dark:text-white w-6 h-6 rounded-full flex items-center justify-center">
                            {totalItems}
                        </span>
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
                        aria-label="Cerrar cotización"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-stone-400 animate-fade-in">
                            <div className="w-24 h-24 rounded-full bg-stone-50 dark:bg-stone-800/50 flex items-center justify-center">
                                <ShoppingBag className="w-10 h-10 opacity-20" />
                            </div>
                            <p className="font-serif uppercase tracking-widest text-sm">Tu cotización está vacía</p>
                            <p className="text-xs text-stone-400/80">Explora nuestra colección y añade piezas que te interesen.</p>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="mt-2 px-8 py-3 border border-stone-200 dark:border-stone-700 text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors rounded-sm"
                            >
                                <ArrowLeft className="w-3 h-3 inline mr-2" />
                                Explorar Colección
                            </button>
                        </div>
                    ) : (
                        items.map((item, i) => (
                            <div
                                key={`${item.product.id}-${item.selectedVariant}`}
                                className="flex gap-4 group animate-fade-in-up"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                {/* Image */}
                                <div className="relative w-20 h-24 bg-stone-100 dark:bg-stone-800 rounded-lg overflow-hidden flex-shrink-0 border border-stone-200 dark:border-stone-700">
                                    {item.product.images[0] && (
                                        <Image
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                    <div>
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-serif text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wide line-clamp-2">
                                                {item.product.name}
                                            </h3>
                                            <button
                                                onClick={() => removeItem(item.product.id)}
                                                className="text-stone-300 hover:text-red-500 transition-colors p-1 flex-shrink-0 opacity-0 group-hover:opacity-100"
                                                aria-label={`Eliminar ${item.product.name}`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {item.selectedVariant && (
                                            <p className="text-[10px] text-gold-600 mt-0.5 uppercase tracking-wider">{item.selectedVariant}</p>
                                        )}
                                        <p className="text-xs text-stone-500 mt-1 font-serif">
                                            {formatPrice(getDisplayPrice(item.product.price), currency)}
                                        </p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-full">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                className="p-1.5 hover:text-gold-500 transition-colors"
                                                disabled={item.quantity <= 1}
                                                aria-label="Reducir cantidad"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-xs font-bold w-6 text-center text-stone-900 dark:text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                className="p-1.5 hover:text-gold-500 transition-colors"
                                                aria-label="Aumentar cantidad"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-black/20 space-y-4 pb-safe">
                        <div className="flex justify-between items-end font-serif text-stone-900 dark:text-white">
                            <span className="text-xs uppercase tracking-widest text-stone-500">Total Estimado</span>
                            <span className="text-xl font-bold">
                                {formatPrice(getDisplayPrice(totalPrice), currency)}
                            </span>
                        </div>

                        <Button
                            className="w-full py-4 text-xs tracking-[0.2em]"
                            variant="success"
                            onClick={handleSendQuote}
                        >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Solicitar Cotización por WhatsApp
                        </Button>

                        <p className="text-[10px] text-center text-stone-400">
                            Serás redirigido a WhatsApp para confirmar disponibilidad.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};
