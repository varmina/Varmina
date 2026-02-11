'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';

export const CartDrawer: React.FC = () => {
    const { items, isOpen, setIsOpen, updateQuantity, removeItem, clearCart, totalItems, totalPrice } = useCart();
    const { settings, currency } = useStore();

    if (!isOpen) return null;

    const handleSendQuote = () => {
        if (!settings?.whatsapp_number) {
            alert('Número de WhatsApp no configurado.');
            return;
        }

        const phone = settings.whatsapp_number.replace(/\D/g, '');
        const header = `Hola *${settings.brand_name}*, me interesan las siguientes piezas:\n\n`;
        const itemsList = items.map(item => {
            const price = currency === 'CLP'
                ? `$${item.product.price.toLocaleString('es-CL')}`
                : `USD $${Math.ceil(item.product.price / (settings.usd_exchange_rate || 950))}`;

            return `💎 *${item.product.name}* (x${item.quantity})\n   Precio: ${price}\n   Ref: ${item.product.id.slice(0, 8)}`;
        }).join('\n\n');

        const footer = `\n\nTotal Estimado: ${currency === 'CLP' ? `$${totalPrice.toLocaleString('es-CL')}` : `USD $${Math.ceil(totalPrice / (settings.usd_exchange_rate || 950))}`}\n\nQuedo atento a su respuesta.`;

        const message = encodeURIComponent(header + itemsList + footer);
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
                onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-stone-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">

                {/* Header */}
                <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <h2 className="font-serif text-xl text-stone-900 dark:text-gold-200 uppercase tracking-widest flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-gold-500" />
                        Tu Selección ({totalItems})
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-stone-400">
                            <ShoppingBag className="w-16 h-16 opacity-20" />
                            <p className="font-serif uppercase tracking-widest text-sm">Tu cotización está vacía</p>
                            <Button variant="outline" onClick={() => setIsOpen(false)}>
                                Explorar Colección
                            </Button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={`${item.product.id}-${item.selectedVariant}`} className="flex gap-4 group">
                                {/* Image */}
                                <div className="relative w-20 h-24 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0 border border-stone-200 dark:border-stone-800">
                                    {item.product.images[0] && (
                                        <img
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-serif text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wide line-clamp-2">
                                                {item.product.name}
                                            </h3>
                                            <button
                                                onClick={() => removeItem(item.product.id)}
                                                className="text-stone-300 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-stone-500 mt-1 font-serif">
                                            {currency === 'CLP'
                                                ? `$${item.product.price.toLocaleString('es-CL')}`
                                                : `USD $${Math.ceil(item.product.price / (settings?.usd_exchange_rate || 950))}`
                                            }
                                        </p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-full">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                className="p-1.5 hover:text-gold-500"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                className="p-1.5 hover:text-gold-500"
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
                    <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-black/20 space-y-4">
                        <div className="flex justify-between items-end font-serif text-stone-900 dark:text-white">
                            <span className="text-xs uppercase tracking-widest text-stone-500">Total Estimado</span>
                            <span className="text-xl font-bold">
                                {currency === 'CLP'
                                    ? `$${totalPrice.toLocaleString('es-CL')}`
                                    : `USD $${Math.ceil(totalPrice / (settings?.usd_exchange_rate || 950))}`
                                }
                            </span>
                        </div>

                        <Button
                            className="w-full py-4 text-xs tracking-[0.2em] bg-green-600 hover:bg-green-700 text-white border-none shadow-lg hover:shadow-green-500/20"
                            onClick={handleSendQuote}
                        >
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
