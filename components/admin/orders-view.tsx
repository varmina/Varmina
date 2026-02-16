'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { supabaseProductService } from '@/services/supabaseProductService';
import { financeService } from '@/services/financeService';
import { internalAssetService } from '@/services/internalAssetService';
import { Product, ProductStatus, InternalAsset } from '@/types';
import { Button } from '@/components/ui/button'; // Adjust import if needed
import { Input } from '@/components/ui/input';
import { Search, Plus, Minus, Trash2, ShoppingCart, User, CreditCard, CheckCircle2, Box, Package } from 'lucide-react';
import { formatPrice } from '@/lib/format';

import { attributeService } from '@/services/attributeService';

import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export const OrdersView: React.FC = () => {
    const { addToast, settings, products: globalProducts, attributes } = useStore();
    const [assets, setAssets] = useState<InternalAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'products' | 'assets'>('products');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Derived from StoreContext
    const products = globalProducts;
    const categories = attributes.filter(a => a.type === 'category').map(c => c.name);

    // Cart State
    interface OrderItem {
        product: Product;
        quantity: number;
        variant?: any;
    }
    interface AssetOrderItem {
        asset: InternalAsset;
        quantity: number;
    }
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [assetCart, setAssetCart] = useState<AssetOrderItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Transferencia');

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();

        const sub = supabase
            .channel('orders_view_assets')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'internal_assets' }, () => {
                loadData(true);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(sub);
        };
    }, []);

    const loadData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const aData = await internalAssetService.getAll();
            setAssets(aData);
        } catch (error) {
            if (!silent) addToast('error', 'Error al cargar inventario de activos');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const addToCart = (product: Product, variant?: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === product.id && i.variant?.name === variant?.name);
            if (existing) {
                // Check stock limit
                const maxStock = variant ? variant.stock : product.stock;
                if (existing.quantity >= maxStock) {
                    addToast('error', 'No hay más stock disponible');
                    return prev;
                }
                addToast('success', `Añadido: ${product.name}${variant ? ` (${variant.name})` : ''}`);
                return prev.map(i => (i === existing ? { ...i, quantity: i.quantity + 1 } : i));
            }
            addToast('success', `Añadido: ${product.name}${variant ? ` (${variant.name})` : ''}`);
            return [...prev, { product, quantity: 1, variant }];
        });
    };

    const removeFromCart = (index: number) => {
        setCart(prev => {
            const item = prev[index];
            if (item) addToast('info', `Eliminado: ${item.product.name}`);
            return prev.filter((_, i) => i !== index);
        });
    };

    const decreaseQuantity = (product: Product, variant?: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === product.id && i.variant?.name === variant?.name);
            if (!existing) return prev;
            if (existing.quantity > 1) {
                addToast('info', `Cantidad reducida: ${product.name}`);
                return prev.map(i => (i === existing ? { ...i, quantity: i.quantity - 1 } : i));
            }
            addToast('info', `Eliminado: ${product.name}`);
            return prev.filter(i => i !== existing);
        });
    };

    const addToAssetCart = (asset: InternalAsset) => {
        setAssetCart(prev => {
            const existing = prev.find(i => i.asset.id === asset.id);
            if (existing) {
                if (existing.quantity >= asset.stock) {
                    addToast('error', 'No hay más stock de este activo');
                    return prev;
                }
                addToast('success', `Añadido: ${asset.name}`);
                return prev.map(i => (i === existing ? { ...i, quantity: i.quantity + 1 } : i));
            }
            addToast('success', `Añadido: ${asset.name}`);
            return [...prev, { asset, quantity: 1 }];
        });
    };

    const removeFromAssetCart = (index: number) => {
        setAssetCart(prev => {
            const item = prev[index];
            if (item) addToast('info', `Eliminado: ${item.asset.name}`);
            return prev.filter((_, i) => i !== index);
        });
    };

    const decreaseAssetQuantity = (asset: InternalAsset) => {
        setAssetCart(prev => {
            const existing = prev.find(i => i.asset.id === asset.id);
            if (!existing) return prev;
            if (existing.quantity > 1) {
                addToast('info', `Cantidad reducida: ${asset.name}`);
                return prev.map(i => (i === existing ? { ...i, quantity: i.quantity - 1 } : i));
            }
            addToast('info', `Eliminado: ${asset.name}`);
            return prev.filter(i => i !== existing);
        });
    };

    const calculateTotal = () => {
        const productsTotal = cart.reduce((acc, item) => {
            const price = item.variant ? item.variant.price : item.product.price;
            return acc + (price * item.quantity);
        }, 0);

        // Assets are internal overhead, usually not charged to client?
        // User asked: "que me pregunte si le añado algun activo como por ejemplo, cajas, bolsas, etc"
        // Usually these are 0 cost for client but cost for dev.
        // For now let's assume assets added to order are for stock tracking, $0 for customer.
        return productsTotal;
    };

    const handleSubmitOrder = async () => {
        if (cart.length === 0) return;
        setIsSubmitting(true);

        try {
            // 1. Deduct Stock for each product
            for (const item of cart) {
                await supabaseProductService.updateStock(
                    item.product.id,
                    item.quantity,
                    item.variant?.name
                );
            }

            // 1.5 Deduct Stock for each asset (packaging/extras)
            for (const item of assetCart) {
                await internalAssetService.updateStock(
                    item.asset.id,
                    item.quantity
                );
            }

            // 2. Create Finance Record
            const totalAmount = calculateTotal();
            const description = `Venta: ${customerName || 'Cliente Mostrador'} - ${cart.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}`;

            await financeService.create({
                description: description.slice(0, 100), // Limit length
                amount: totalAmount,
                type: 'income',
                category: 'Ventas',
                date: new Date().toISOString().split('T')[0]
            });

            addToast('success', 'Venta registrada y stock actualizado');
            setCart([]);
            setAssetCart([]);
            setCustomerName('');
            loadData(); // Refresh inventory

        } catch (error) {
            console.error(error);
            addToast('error', 'Error al procesar la venta');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter Products
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.collection && p.collection.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Optimized lookups for cart quantities
    const cartQuantities = React.useMemo(() => {
        const map: Record<string, number> = {};
        cart.forEach(item => {
            const key = `${item.product.id}-${item.variant?.name || 'default'}`;
            map[key] = item.quantity;
        });
        return map;
    }, [cart]);

    const assetQuantities = React.useMemo(() => {
        const map: Record<string, number> = {};
        assetCart.forEach(item => {
            map[item.asset.id] = item.quantity;
        });
        return map;
    }, [assetCart]);

    const filteredAssets = assets.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helpers for current quantities in cart
    const getItemQuantity = (productId: string, variantName?: string) => {
        return cartQuantities[`${productId}-${variantName || 'default'}`] || 0;
    };

    const getAssetQuantity = (assetId: string) => {
        return assetQuantities[assetId] || 0;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[calc(100vh-100px)]">
            {/* Left Col: Product & Asset Selector */}
            <div className="lg:col-span-2 flex flex-col h-[calc(100vh-140px)]">
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                    {/* Header with Search and Tabs */}
                    <div className="p-4 border-b border-stone-100 dark:border-stone-800 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setActiveTab('products')}
                                    className={`relative py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'products' ? 'text-stone-900 dark:text-gold-400' : 'text-stone-400 hover:text-stone-600'}`}
                                >
                                    Joyas
                                    <span className="ml-2 text-[8px] bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded-full text-stone-500">{filteredProducts.length}</span>
                                    {activeTab === 'products' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-stone-900 dark:bg-gold-500" />}
                                </button>
                                <button
                                    onClick={() => setActiveTab('assets')}
                                    className={`relative py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'assets' ? 'text-stone-900 dark:text-gold-400' : 'text-stone-400 hover:text-stone-600'}`}
                                >
                                    Insumos & Empaque
                                    <span className="ml-2 text-[8px] bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded-full text-stone-500">{filteredAssets.length}</span>
                                    {activeTab === 'assets' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-stone-900 dark:bg-gold-500" />}
                                </button>
                            </div>
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <Input
                                    placeholder={activeTab === 'products' ? "Buscar joyas..." : "Buscar insumos..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 bg-stone-50 dark:bg-stone-950 border-stone-200 h-9 text-xs"
                                />
                            </div>
                        </div>

                        {/* Category Filter for Products */}
                        {activeTab === 'products' && categories.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                <button
                                    onClick={() => setSelectedCategory('All')}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === 'All' ? 'bg-gold-500 text-white border-gold-600' : 'bg-white dark:bg-stone-900 text-stone-400 border-stone-200 dark:border-stone-800'}`}
                                >
                                    Todos
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-gold-500 text-white border-gold-600' : 'bg-white dark:bg-stone-900 text-stone-400 border-stone-200 dark:border-stone-800'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {activeTab === 'products' ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="bg-stone-50 dark:bg-stone-950/50 border border-stone-100 dark:border-stone-800 rounded-xl p-2.5 flex flex-col gap-2 group hover:border-gold-400 transition-all shadow-sm">
                                        <div className="aspect-square bg-white dark:bg-stone-900 rounded-lg overflow-hidden relative border border-stone-100 dark:border-stone-800">
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            {product.status === ProductStatus.SOLD_OUT && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="text-[8px] font-bold text-white uppercase bg-red-500 px-1.5 py-0.5 rounded">Agotado</span>
                                                </div>
                                            )}
                                            <div className="absolute bottom-1 right-1">
                                                <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-stone-500 border border-stone-100/50">
                                                    {product.stock ?? 1} disp.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h4 className="text-[10px] font-bold text-stone-900 dark:text-white leading-tight line-clamp-2">{product.name}</h4>
                                            <p className="text-[10px] font-mono text-gold-600 font-bold">{formatPrice(product.price, 'CLP')}</p>
                                        </div>

                                        {product.variants && product.variants.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-1 mt-auto">
                                                {product.variants.map((v: any) => {
                                                    const q = getItemQuantity(product.id, v.name);
                                                    return (
                                                        <div key={v.name} className="flex flex-col">
                                                            <div className={`flex items-center justify-between rounded-md h-7 overflow-hidden shadow-sm transition-all border ${q > 0 ? 'bg-gold-500 text-white border-gold-600' : 'bg-white dark:bg-stone-900 text-stone-900 dark:text-gold-200 border-stone-200 dark:border-stone-800'}`}>
                                                                <button
                                                                    disabled={q <= 0}
                                                                    onClick={(e) => { e.stopPropagation(); decreaseQuantity(product, v); }}
                                                                    className={`w-7 h-full flex items-center justify-center transition-colors ${q > 0 ? 'hover:bg-gold-600' : 'opacity-20 cursor-not-allowed'}`}
                                                                >
                                                                    <Minus className="w-2.5 h-2.5" />
                                                                </button>
                                                                <div className="flex flex-col items-center leading-none px-1">
                                                                    <span className="text-[9px] font-bold">{q}</span>
                                                                    <span className="text-[6px] uppercase tracking-tighter opacity-70 truncate max-w-[50px]" title={v.name}>{v.name || 'S/T'}</span>
                                                                </div>
                                                                <button
                                                                    disabled={v.stock <= 0}
                                                                    onClick={(e) => { e.stopPropagation(); addToCart(product, v); }}
                                                                    className={`w-7 h-full flex items-center justify-center transition-colors ${q > 0 ? 'hover:bg-gold-600' : 'hover:bg-gold-100 dark:hover:bg-gold-900/30'}`}
                                                                >
                                                                    <Plus className="w-2.5 h-2.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            (() => {
                                                const q = getItemQuantity(product.id);
                                                return (
                                                    <div className={`flex items-center justify-between rounded-md h-8 mt-auto overflow-hidden shadow-md transition-all border ${q > 0 ? 'bg-gold-500 text-white border-gold-600' : 'bg-white dark:bg-stone-900 text-stone-900 dark:text-gold-200 border-stone-200 dark:border-stone-800'}`}>
                                                        <button
                                                            disabled={q <= 0}
                                                            onClick={(e) => { e.stopPropagation(); decreaseQuantity(product); }}
                                                            className={`w-10 h-full flex items-center justify-center transition-colors border-r ${q > 0 ? 'hover:bg-gold-600 border-gold-400/30' : 'opacity-20 cursor-not-allowed border-stone-100 dark:border-stone-800'}`}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <div className="flex flex-col items-center justify-center leading-none">
                                                            <span className="text-[10px] font-bold">{q}</span>
                                                            <span className="text-[7px] uppercase tracking-tighter opacity-80">{q > 0 ? 'En Carrito' : 'Añadir'}</span>
                                                        </div>
                                                        <button
                                                            disabled={product.status === ProductStatus.SOLD_OUT || (product.stock !== undefined && product.stock <= 0)}
                                                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                                            className={`w-10 h-full flex items-center justify-center transition-colors border-l ${q > 0 ? 'hover:bg-gold-600 border-gold-400/30' : 'hover:bg-gold-100 dark:hover:bg-gold-900/30 border-stone-100 dark:border-stone-800'}`}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                );
                                            })()
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {filteredAssets.map(asset => {
                                    const q = getAssetQuantity(asset.id);
                                    return (
                                        <div
                                            key={asset.id}
                                            className={`p-3 rounded-xl border transition-all flex flex-col gap-2 group shadow-sm ${asset.stock <= 0 ? 'opacity-40 cursor-not-allowed border-stone-100' : 'bg-stone-50 dark:bg-stone-950 border-stone-100 dark:border-stone-800 hover:border-gold-400 hover:bg-white dark:hover:bg-stone-900'}`}
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-[10px] font-bold text-stone-900 dark:text-white uppercase leading-tight">{asset.name}</span>
                                                    <span className="text-[8px] text-stone-400 uppercase tracking-widest">{asset.category}</span>
                                                </div>
                                                <div className="p-1 px-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 flex-shrink-0">
                                                    <span className={`text-[9px] font-mono font-bold ${asset.stock <= asset.min_stock ? 'text-red-500' : 'text-stone-600'}`}>
                                                        {asset.stock}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-auto flex justify-end">
                                                <div className={`flex items-center gap-2 rounded-full px-1 py-0.5 shadow-sm transition-all border ${q > 0 ? 'bg-gold-500 text-white border-gold-600' : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800'}`}>
                                                    <button
                                                        disabled={q <= 0}
                                                        onClick={() => decreaseAssetQuantity(asset)}
                                                        className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${q > 0 ? 'hover:bg-gold-600' : 'opacity-20 cursor-not-allowed'}`}
                                                    >
                                                        <Minus className="w-2.5 h-2.5" />
                                                    </button>
                                                    <span className="text-[10px] font-bold min-w-[12px] text-center">{q}</span>
                                                    <button
                                                        disabled={asset.stock <= 0}
                                                        onClick={() => addToAssetCart(asset)}
                                                        className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${q > 0 ? 'hover:bg-gold-600' : 'hover:bg-gold-100 dark:hover:bg-gold-900/30'}`}
                                                    >
                                                        <Plus className="w-2.5 h-2.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {(activeTab === 'products' ? filteredProducts : filteredAssets).length === 0 && (
                            <div className="h-64 flex flex-col items-center justify-center text-stone-400">
                                <Search className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-xs uppercase tracking-widest font-bold">No se encontraron resultados</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Col: Order Summary */}
            <div className="lg:col-span-1">
                <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 sticky top-6 shadow-xl flex flex-col h-[calc(100vh-140px)]">
                    <div className="flex items-center gap-2 mb-6 text-gold-600">
                        <ShoppingCart className="w-5 h-5" />
                        <h3 className="font-bold uppercase tracking-widest text-sm">Resumen de Venta</h3>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-4 mb-6 border-b border-stone-200 dark:border-stone-800 pb-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Cliente</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <Input
                                    placeholder="Nombre del cliente"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="pl-9 h-9 text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Método de Pago</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <select
                                    className="w-full h-9 pl-9 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-md text-sm outline-none focus:border-gold-400"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta Débito/Crédito</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-6">
                        {cart.length === 0 && assetCart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center">
                                <p className="text-xs italic">La orden está vacía</p>
                            </div>
                        ) : (
                            <>
                                {cart.map((item, idx) => (
                                    <div key={`p-${idx}`} className="flex gap-3 bg-white dark:bg-stone-950 p-2 rounded-lg border border-stone-100 dark:border-stone-800">
                                        <img src={item.product.images[0]} className="w-10 h-10 object-cover rounded bg-stone-100" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold truncate">{item.product.name}</p>
                                            <p className="text-[10px] text-stone-500">{item.variant ? item.variant.name : 'Standard'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold">{formatPrice((item.variant ? item.variant.price : item.product.price) * item.quantity, 'CLP')}</p>
                                            <div className="flex items-center justify-end gap-2 mt-1">
                                                <span className="text-[10px]">x{item.quantity}</span>
                                                <button onClick={() => removeFromCart(idx)} className="text-stone-400 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {assetCart.length > 0 && (
                                    <div className="pt-2">
                                        <p className="text-[8px] font-bold uppercase tracking-widest text-stone-400 mb-2 px-1">Empaque & Insumos</p>
                                        <div className="space-y-2">
                                            {assetCart.map((item, idx) => (
                                                <div key={`a-${idx}`} className="flex items-center gap-3 bg-stone-100/50 dark:bg-stone-800/20 p-2 rounded-lg border border-dashed border-stone-200 dark:border-stone-700">
                                                    <div className="p-1.5 bg-white dark:bg-stone-900 rounded">
                                                        <Package className="w-3 h-3 text-gold-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-bold truncate text-stone-600 dark:text-stone-300">{item.asset.name}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-mono">x{item.quantity}</span>
                                                        <button onClick={() => removeFromAssetCart(idx)} className="text-stone-400 hover:text-red-500">
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-bold uppercase text-stone-500">Total a Pagar</span>
                            <span className="text-xl font-bold font-serif text-stone-900 dark:text-white">{formatPrice(calculateTotal(), 'CLP')}</span>
                        </div>
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold tracking-widest uppercase gap-2"
                            disabled={cart.length === 0 || isSubmitting}
                            onClick={handleSubmitOrder}
                        >
                            {isSubmitting ? 'Procesando...' : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" /> Confirmar Venta
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
