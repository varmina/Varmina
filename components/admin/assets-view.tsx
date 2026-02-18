'use client';

import React, { useState, useEffect } from 'react';
import { internalAssetService, CreateAssetInput } from '@/services/internalAssetService';
import { supabaseProductService } from '@/services/supabaseProductService';
import { attributeService, ProductAttribute } from '@/services/attributeService';
import { InternalAsset, Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useStore } from '@/context/StoreContext';
import {
    Package,
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    Box,
    ShoppingBag,
    Check,
    X,
    List,
    Warehouse,
    AlertCircle,
    ArrowUpDown
} from 'lucide-react';
import { AttributeManagerSection } from './attribute-manager';

import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

type SortOption = 'name_asc' | 'name_desc' | 'stock_asc' | 'stock_desc' | 'status' | 'category' | 'collection';

export const AssetsView: React.FC = () => {
    const { addToast, attributes } = useStore();

    // TABS
    const [activeTab, setActiveTab] = useState<'internal' | 'store' | 'attributes'>('internal');

    // DATA STATE
    const [assets, setAssets] = useState<InternalAsset[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Derived from StoreContext
    const assetCategories = attributes.filter(a => a.type === 'asset_category');

    // UI STATE
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [sortConfig, setSortConfig] = useState<SortOption>('name_asc');

    // MODAL / EDIT STATE (Internal Assets)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<InternalAsset | null>(null);
    const [assetFormData, setAssetFormData] = useState<CreateAssetInput>({
        name: '', category: '', stock: 0, min_stock: 5, unit_cost: 0, location: '', description: ''
    });

    // INLINE EDIT STATE (Store Products)
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ unit_cost: number; location: string; variants: any[] }>({
        unit_cost: 0, location: '', variants: []
    });

    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    useEffect(() => {
        loadData();

        // Realtime for Internal Assets
        const sub = supabase
            .channel('internal_assets_view')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'internal_assets' }, () => {
                loadData(true);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(sub);
        };
    }, []);

    const resetSelection = () => {
        setSelectedAssetIds([]);
        setSelectedProductIds([]);
    };

    const loadData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const [assetsData, productsData] = await Promise.all([
                internalAssetService.getAll(),
                supabaseProductService.getAll()
            ]);
            setAssets(assetsData);
            setProducts(productsData);
        } catch (error) {
            console.error(error);
            if (!silent) addToast('error', 'Error al cargar datos de inventario');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // --- INTERNAL ASSETS LOGIC ---
    const handleAssetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assetFormData.category) {
            addToast('error', 'Por favor selecciona una categoría');
            return;
        }
        try {
            if (editingAsset) {
                await internalAssetService.update(editingAsset.id, assetFormData);
                addToast('success', 'Activo actualizado');
            } else {
                await internalAssetService.create(assetFormData);
                addToast('success', 'Activo registrado');
            }
            setIsModalOpen(false);
            setEditingAsset(null);
            resetAssetForm();
            loadData(true);
        } catch (error) {
            addToast('error', 'Error al guardar');
        }
    };

    const resetAssetForm = () => {
        setAssetFormData({
            name: '', category: '', stock: 0, min_stock: 5, unit_cost: 0, location: '', description: ''
        });
    };

    const prepareEditAsset = (asset: InternalAsset) => {
        setEditingAsset(asset);
        setAssetFormData({
            name: asset.name,
            category: asset.category,
            stock: asset.stock,
            min_stock: asset.min_stock,
            unit_cost: asset.unit_cost,
            location: asset.location || '',
            description: asset.description || ''
        });
        setIsModalOpen(true);
    };

    const deleteAsset = async (id: string) => {
        if (!confirm('¿Eliminar este activo del inventario?')) return;
        try {
            await internalAssetService.delete(id);
            setAssets(assets.filter(a => a.id !== id));
            addToast('success', 'Activo eliminado');
        } catch (error) {
            addToast('error', 'Error al eliminar');
        }
    };

    // --- BULK LOGIC ---
    const toggleAssetSelect = (id: string) => {
        setSelectedAssetIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleAllAssets = () => {
        if (selectedAssetIds.length === filteredAssets.length) setSelectedAssetIds([]);
        else setSelectedAssetIds(filteredAssets.map(a => a.id));
    };

    const toggleProductSelect = (id: string) => {
        setSelectedProductIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleAllProducts = () => {
        if (selectedProductIds.length === filteredProducts.length) setSelectedProductIds([]);
        else setSelectedProductIds(filteredProducts.map(p => p.id));
    };

    const handleBulkDelete = async () => {
        const count = activeTab === 'internal' ? selectedAssetIds.length : selectedProductIds.length;
        if (!confirm(`¿Eliminar ${count} items seleccionados?`)) return;

        try {
            if (activeTab === 'internal') {
                await internalAssetService.deleteBulk(selectedAssetIds);
            } else {
                await supabaseProductService.deleteBulk(selectedProductIds);
            }
            addToast('success', `${count} items eliminados`);
            resetSelection();
            loadData();
        } catch (error) {
            addToast('error', 'Error en eliminación masiva');
        }
    };

    const handleBulkUpdate = async (updates: any) => {
        const count = activeTab === 'internal' ? selectedAssetIds.length : selectedProductIds.length;
        try {
            if (activeTab === 'internal') {
                await internalAssetService.updateBulk(selectedAssetIds, updates);
            } else {
                await Promise.all(selectedProductIds.map(id => supabaseProductService.update(id, updates)));
            }
            addToast('success', `${count} items actualizados`);
            resetSelection();
            loadData();
        } catch (error) {
            addToast('error', 'Error en actualización masiva');
        }
    };

    // --- STORE PRODUCTS LOGIC ---
    const startEditingProduct = (product: Product) => {
        setEditingProductId(product.id);
        setEditForm({
            unit_cost: product.unit_cost || 0,
            location: product.location || '',
            variants: JSON.parse(JSON.stringify(product.variants || []))
        });
    };

    const saveProductEdit = async (id: string) => {
        try {
            const totalStock = editForm.variants.length > 0
                ? editForm.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
                : products.find(p => p.id === id)?.stock;

            await supabaseProductService.update(id, {
                unit_cost: editForm.unit_cost,
                location: editForm.location,
                variants: editForm.variants,
                stock: totalStock
            });

            setProducts(products.map(p => p.id === id ? {
                ...p,
                unit_cost: editForm.unit_cost,
                location: editForm.location,
                variants: editForm.variants,
                stock: totalStock
            } : p));
            setEditingProductId(null);
            addToast('success', 'Ficha técnica actualizada');
        } catch (error) {
            addToast('error', 'Error al actualizar producto');
        }
    };

    const updateVariantEdit = (variantId: string, field: string, value: any) => {
        setEditForm(prev => ({
            ...prev,
            variants: prev.variants.map(v => v.id === variantId ? { ...v, [field]: value } : v)
        }));
    };

    // --- FILTERS & STATS ---
    const getSortedData = <T extends InternalAsset | Product>(data: T[]): T[] => {
        return [...data].sort((a, b) => {
            switch (sortConfig) {
                case 'name_asc': return a.name.localeCompare(b.name);
                case 'name_desc': return b.name.localeCompare(a.name);
                case 'stock_asc': return (a.stock || 0) - (b.stock || 0);
                case 'stock_desc': return (b.stock || 0) - (a.stock || 0);
                case 'category': return (a.category || '').localeCompare(b.category || '');
                case 'collection': {
                    if ('collection' in a && 'collection' in b) {
                        return (a.collection || '').localeCompare(b.collection || '');
                    }
                    return 0;
                }
                case 'status': {
                    if ('status' in a && 'status' in b) {
                        return (a.status || '').localeCompare(b.status || '');
                    }
                    return 0;
                }
                default: return 0;
            }
        });
    };

    const filteredAssets = getSortedData(assets.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
        return matchesSearch && matchesCategory;
    }));

    const filteredProducts = getSortedData(products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesType;
    }));

    const totalValue = activeTab === 'internal'
        ? assets.reduce((acc, curr) => acc + (curr.stock * curr.unit_cost), 0)
        : products.reduce((acc, curr) => {
            if (curr.variants && curr.variants.length > 0) {
                return acc + curr.variants.reduce((sum, v) => sum + ((v.stock || 0) * (v.unit_cost || 0)), 0);
            }
            return acc + ((curr.stock || 0) * (curr.unit_cost || 0));
        }, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-0">
                <div>
                    <h2 className="text-xl md:text-2xl font-serif text-stone-900 dark:text-white uppercase tracking-widest">Logística</h2>
                    <p className="text-stone-500 text-[10px] md:text-sm uppercase tracking-widest">Control de inventario, costos y ubicación física de piezas.</p>
                </div>

                {activeTab === 'internal' && (
                    <Button
                        onClick={() => { resetAssetForm(); setEditingAsset(null); setIsModalOpen(true); }}
                        className="bg-stone-900 text-white dark:bg-gold-500 dark:text-stone-900 flex items-center gap-2 px-6 rounded-full shadow-lg"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Activo
                    </Button>
                )}
            </div>

            {/* TAB SWITCHER */}
            <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl w-full md:w-fit overflow-x-auto scrollbar-hide">
                <button
                    onClick={() => { setActiveTab('internal'); setSelectedCategory('All'); }}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] transition-all whitespace-nowrap flex-1 md:flex-none ${activeTab === 'internal' ? 'bg-white dark:bg-stone-700 shadow-md text-stone-900 dark:text-white' : 'text-stone-400 hover:text-stone-600'}`}
                >
                    <Box className="w-3.5 h-3.5" /> Activos Internos
                </button>
                <button
                    onClick={() => { setActiveTab('store'); setSelectedCategory('All'); }}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] transition-all whitespace-nowrap flex-1 md:flex-none ${activeTab === 'store' ? 'bg-white dark:bg-stone-700 shadow-md text-stone-900 dark:text-white' : 'text-stone-400 hover:text-stone-600'}`}
                >
                    <ShoppingBag className="w-3.5 h-3.5" /> Inventario Tienda
                </button>
                <button
                    onClick={() => { setActiveTab('attributes'); setSelectedCategory('All'); }}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] transition-all whitespace-nowrap flex-1 md:flex-none ${activeTab === 'attributes' ? 'bg-white dark:bg-stone-700 shadow-md text-stone-900 dark:text-white' : 'text-stone-400 hover:text-stone-600'}`}
                >
                    <List className="w-3.5 h-3.5" /> Listado Maestro
                </button>
            </div>


            {
                activeTab === 'attributes' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <AttributeManagerSection />
                    </div>
                ) : (
                    <>
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm relative overflow-hidden">
                                <div className="absolute right-[-10px] top-[-10px] opacity-5">
                                    <Warehouse className="w-24 h-24" />
                                </div>
                                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                                    Valor {activeTab === 'internal' ? 'Insumos' : 'Piezas'}
                                </p>
                                <h4 className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-gold-200">{formatCurrency(totalValue)}</h4>
                                <p className="text-[10px] text-stone-400 mt-2 font-medium uppercase tracking-wide">Inversión en {activeTab === 'internal' ? 'Stock' : 'Joyas'}</p>
                            </div>

                            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm relative overflow-hidden">
                                <div className="absolute right-[-10px] top-[-10px] opacity-5">
                                    <Package className="w-24 h-24" />
                                </div>
                                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">Items Únicos</p>
                                <h4 className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-white">
                                    {activeTab === 'internal' ? assets.length : products.length}
                                </h4>
                                <p className="text-[10px] text-stone-400 mt-2 font-medium uppercase tracking-wide">Variedad Registrada</p>
                            </div>

                            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm relative overflow-hidden">
                                <div className="absolute right-[-10px] top-[-10px] opacity-5">
                                    <Box className="w-24 h-24" />
                                </div>
                                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">Unidades Totales</p>
                                <h4 className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-white">
                                    {activeTab === 'internal'
                                        ? assets.reduce((acc, curr) => acc + curr.stock, 0)
                                        : products.reduce((acc, curr) => acc + (curr.stock || 0), 0)
                                    }
                                </h4>
                                <p className="text-[10px] text-stone-400 mt-2 font-medium uppercase tracking-wide">Físico Disponible</p>
                            </div>

                            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm relative overflow-hidden">
                                <div className="absolute right-[-10px] top-[-10px] opacity-5">
                                    <AlertCircle className={`w-24 h-24 ${((activeTab === 'internal' && assets.some(a => a.stock <= (a.min_stock || 0))) || (activeTab === 'store' && products.some(p => p.variants && p.variants.length > 0 ? p.variants.some(v => (v.stock || 0) <= 2) : (p.stock || 0) <= 2))) ? 'text-red-500 opacity-20' : ''}`} />
                                </div>
                                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">Alertas Stock</p>
                                <h4 className={`text-2xl md:text-3xl font-serif ${(activeTab === 'internal' && assets.filter(a => a.stock <= (a.min_stock || 0)).length > 0) || (activeTab === 'store' && products.filter(p => p.variants && p.variants.length > 0 ? p.variants.some(v => (v.stock || 0) <= 2) : (p.stock || 0) <= 2).length > 0) ? 'text-red-500' : 'text-stone-900 dark:text-white'}`}>
                                    {activeTab === 'internal'
                                        ? assets.filter(a => a.stock <= (a.min_stock || 0)).length
                                        : products.filter(p => p.variants && p.variants.length > 0 ? p.variants.some(v => (v.stock || 0) <= 2) : (p.stock || 0) <= 2).length
                                    }
                                </h4>
                                <p className="text-[10px] text-stone-400 mt-2 font-medium uppercase tracking-wide">Items por Reponer</p>
                            </div>
                        </div>

                        {/* Bulk Actions Bar */}
                        {((activeTab === 'internal' && selectedAssetIds.length > 0) || (activeTab === 'store' && selectedProductIds.length > 0)) && (
                            <div className="sticky top-4 z-30 bg-stone-900 text-white p-4 mb-6 flex flex-col md:flex-row items-center justify-between rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 gap-4 border border-stone-800 ring-4 ring-black/5">
                                <div className="flex items-center gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                                    <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap px-3 py-1 bg-white/10 rounded-full">
                                        {activeTab === 'internal' ? selectedAssetIds.length : selectedProductIds.length} seleccionados
                                    </span>
                                    <div className="h-4 w-px bg-stone-700 flex-shrink-0" />

                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-stone-500 uppercase font-bold tracking-widest">Mover a:</span>
                                        <input
                                            type="text"
                                            placeholder="Nueva Ubicación..."
                                            className="bg-stone-800 border-none rounded-lg px-3 py-1.5 text-[10px] w-32 focus:ring-1 focus:ring-gold-500"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleBulkUpdate({ location: (e.target as HTMLInputElement).value });
                                            }}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-stone-500 uppercase font-bold tracking-widest">Categoría:</span>
                                        <select
                                            className="bg-stone-800 border-none rounded-lg px-2 py-1.5 text-[10px] focus:ring-1 focus:ring-gold-500"
                                            onChange={(e) => handleBulkUpdate({ category: e.target.value })}
                                        >
                                            <option value="">Cambiar a...</option>
                                            {activeTab === 'internal' ? (
                                                assetCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)
                                            ) : (
                                                Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(cat => (
                                                    <option key={cat} value={cat as string}>{cat}</option>
                                                ))
                                            )}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <button onClick={resetSelection} className="flex-1 md:flex-none text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-white px-4">Cancelar</button>
                                    <button onClick={handleBulkDelete} className="flex-1 md:flex-none bg-red-600 text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-md">
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Main Content */}
                        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
                            {/* Filters */}
                            <div className="p-3 md:p-4 border-b border-stone-100 dark:border-stone-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-md w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-gold-500 transition-all"
                                    />
                                </div>
                                <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                                    <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-100 dark:border-stone-700 shrink-0">
                                        <Filter className="w-3 h-3 text-stone-400" />
                                    </div>

                                    {/* Sort Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={sortConfig}
                                            onChange={(e) => setSortConfig(e.target.value as SortOption)}
                                            className="px-4 py-2 pr-8 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-[9px] font-bold uppercase tracking-widest text-stone-900 dark:text-stone-300 focus:ring-1 focus:ring-gold-500 appearance-none cursor-pointer"
                                        >
                                            <option value="name_asc">Nombre (A-Z)</option>
                                            <option value="name_desc">Nombre (Z-A)</option>
                                            <option value="stock_desc">Stock (Mayor)</option>
                                            <option value="stock_asc">Stock (Menor)</option>
                                            <option value="category">Categoría</option>
                                            {activeTab === 'store' && <option value="collection">Colección</option>}
                                            {activeTab === 'store' && <option value="status">Disponibilidad</option>}
                                        </select>
                                        <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" />
                                    </div>
                                    <button onClick={() => setSelectedCategory('All')} className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border ${selectedCategory === 'All' ? 'bg-stone-900 text-white border-stone-900 shadow-sm' : 'bg-white dark:bg-stone-900 text-stone-400 border-stone-200 dark:border-stone-800'}`}>Todos</button>

                                    {activeTab === 'internal' ? (
                                        assetCategories.map(cat => (
                                            <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === cat.name ? 'bg-gold-500 text-stone-900 border-gold-600 shadow-sm' : 'bg-white dark:bg-stone-900 text-stone-400 border-stone-200 dark:border-stone-800'}`}>{cat.name}</button>
                                        ))
                                    ) : (
                                        // Product categories filters based on shop categories
                                        Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(cat => (
                                            <button key={cat} onClick={() => setSelectedCategory(cat as string)} className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-gold-500 text-stone-900 border-gold-600 shadow-sm' : 'bg-white dark:bg-stone-900 text-stone-400 border-stone-200 dark:border-stone-800'}`}>{cat}</button>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-stone-50/50 dark:bg-stone-950/30 text-[10px] uppercase tracking-[0.2em] text-stone-400 border-b border-stone-100 dark:border-stone-800">
                                            <th className="p-5 w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={activeTab === 'internal'
                                                        ? (selectedAssetIds.length === filteredAssets.length && filteredAssets.length > 0)
                                                        : (selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0)
                                                    }
                                                    onChange={activeTab === 'internal' ? toggleAllAssets : toggleAllProducts}
                                                    className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
                                                />
                                            </th>
                                            <th className="p-5 font-bold">Pieza / Activo</th>
                                            <th className="p-5 font-bold">Ubicación Física</th>
                                            <th className="p-5 font-bold text-center">Stock</th>
                                            <th className="p-5 font-bold text-right">Costo Unit.</th>
                                            <th className="p-5 font-bold text-right">Valor en Stock</th>
                                            <th className="p-5 font-bold text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                        {activeTab === 'internal' ? (
                                            // INTERNAL ASSETS ROW
                                            filteredAssets.map(asset => (
                                                <tr key={asset.id} className={`hover:bg-stone-50/30 dark:hover:bg-stone-800/30 transition-colors border-b border-stone-100 dark:border-stone-800/50 ${selectedAssetIds.includes(asset.id) ? 'bg-gold-50/30 dark:bg-gold-900/10' : ''}`}>
                                                    <td className="p-5">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedAssetIds.includes(asset.id)}
                                                            onChange={() => toggleAssetSelect(asset.id)}
                                                            className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="p-5 text-stone-900 dark:text-stone-300 font-serif">
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-medium text-xs uppercase text-stone-900 dark:text-white">{asset.name}</div>
                                                            {asset.stock <= (asset.min_stock || 0) && (
                                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Bajo Stock" />
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-stone-400">{asset.category}</div>
                                                    </td>
                                                    <td className="p-5 text-xs text-stone-500 italic">{asset.location || 'Sin definir'}</td>
                                                    <td className={`p-5 text-center text-xs font-mono font-bold ${asset.stock <= (asset.min_stock || 0) ? 'text-red-500' : ''}`}>{asset.stock}</td>
                                                    <td className="p-5 text-right text-xs font-mono text-stone-500">{formatCurrency(asset.unit_cost)}</td>
                                                    <td className="p-5 text-right text-xs font-mono font-bold text-stone-900 dark:text-white">{formatCurrency(asset.stock * asset.unit_cost)}</td>
                                                    <td className="p-5 text-center flex justify-center gap-2">
                                                        <button onClick={() => prepareEditAsset(asset)} className="p-2 text-stone-400 hover:text-stone-900"><Edit2 className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => deleteAsset(asset.id)} className="p-2 text-stone-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            // STORE PRODUCTS ROW
                                            filteredProducts.map(product => {
                                                const isEditing = editingProductId === product.id;
                                                const isSelected = selectedProductIds.includes(product.id);
                                                const hasVariants = product.variants && product.variants.length > 0;

                                                return (
                                                    <React.Fragment key={product.id}>
                                                        <tr key={product.id} className={`hover:bg-stone-50/30 dark:hover:bg-stone-800/30 transition-colors ${isSelected ? 'bg-gold-50/30 dark:bg-gold-900/10' : ''}`}>
                                                            <td className="p-5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleProductSelect(product.id)}
                                                                    className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
                                                                />
                                                            </td>
                                                            <td className="p-5">
                                                                <div className="flex items-center gap-3">
                                                                    {product.images?.[0] ? (
                                                                        <div className="relative flex-shrink-0">
                                                                            <img src={product.images[0]} className="w-14 h-16 rounded object-cover bg-stone-100" alt="" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-14 h-16 rounded bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                                                                            <Package className="w-6 h-6 text-stone-400" />
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <div className="font-medium text-xs uppercase text-stone-900 dark:text-white max-w-[150px] truncate" title={product.name}>{product.name}</div>
                                                                        <div className="text-[9px] text-stone-400">{product.category}</div>
                                                                        {hasVariants && <span className="text-[9px] text-stone-400">Ver Múltiples</span>}
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="p-5 text-stone-500 italic">
                                                                {isEditing ? (
                                                                    !hasVariants && (
                                                                        <input
                                                                            className="w-full text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded p-1"
                                                                            value={editForm.location}
                                                                            onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                                                            placeholder="Ubicación..."
                                                                        />
                                                                    )
                                                                ) : (
                                                                    !hasVariants && <span className="text-xs">{product.location || 'Sin definir'}</span>
                                                                )}
                                                                {hasVariants && <span className="text-[9px] text-stone-400">Var. Múltiples</span>}
                                                            </td>

                                                            <td className="p-5 text-center text-xs font-mono font-bold bg-stone-50/50 dark:bg-stone-900/50">
                                                                {product.stock || 0}
                                                            </td>

                                                            <td className="p-5 text-right">
                                                                {isEditing ? (
                                                                    !hasVariants && (
                                                                        <input
                                                                            type="number"
                                                                            className="w-20 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded p-1 text-right"
                                                                            value={editForm.unit_cost === 0 ? '' : editForm.unit_cost}
                                                                            onChange={e => setEditForm({ ...editForm, unit_cost: Number(e.target.value) || 0 })}
                                                                            onFocus={(e) => e.target.select()}
                                                                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                                        />
                                                                    )
                                                                ) : (
                                                                    !hasVariants && <span className="text-xs font-mono text-stone-500">{formatCurrency(product.unit_cost || 0)}</span>
                                                                )}
                                                            </td>

                                                            <td className="p-5 text-right text-xs font-mono font-bold text-stone-900 dark:text-white">
                                                                {hasVariants
                                                                    ? formatCurrency(product.variants.reduce((sum, v) => sum + ((v.stock || 0) * (v.unit_cost || 0)), 0))
                                                                    : formatCurrency((product.stock || 0) * (product.unit_cost || 0))
                                                                }
                                                            </td>

                                                            <td className="p-5 text-center">
                                                                <div className="flex justify-center gap-2">
                                                                    {isEditing ? (
                                                                        <>
                                                                            <button onClick={() => saveProductEdit(product.id)} className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100" title="Guardar"><Check className="w-4 h-4" /></button>
                                                                            <button onClick={() => setEditingProductId(null)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Cancelar"><X className="w-4 h-4" /></button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <button onClick={() => startEditingProduct(product)} className="p-2 text-stone-400 hover:text-stone-900 transition-colors" title="Editar"><Edit2 className="w-3.5 h-3.5" /></button>
                                                                            <button onClick={() => { if (confirm('¿Eliminar pieza de inventario?')) supabaseProductService.delete(product.id).then(() => loadData(true)) }} className="p-2 text-stone-400 hover:text-red-500 transition-colors" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        {hasVariants && product.variants.map((variant: any, vIdx) => {
                                                            const vEdit = isEditing ? editForm.variants.find((v: any) => v.id === variant.id) : null;
                                                            const isLast = vIdx === product.variants!.length - 1;
                                                            return (
                                                                <tr key={variant.id} className="bg-stone-50/20 dark:bg-stone-950/20 group/variant">
                                                                    <td className="p-5">
                                                                        <div className="w-4 h-4 border-l-2 border-b-2 border-gold-500/20 rounded-bl-md ml-2" />
                                                                    </td>
                                                                    <td className="p-3 pl-4 border-b border-stone-100/10 dark:border-stone-800/10">
                                                                        <span className="text-[10px] uppercase font-bold text-stone-500">{variant.name}</span>
                                                                    </td>
                                                                    <td className="p-3 border-b border-stone-100/10 dark:border-stone-800/10 text-stone-400 italic">
                                                                        {isEditing ? (
                                                                            <input
                                                                                className="w-full text-[10px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded p-1"
                                                                                value={vEdit?.location || ''}
                                                                                onChange={e => updateVariantEdit(variant.id, 'location', e.target.value)}
                                                                                placeholder="Ubicación..."
                                                                            />
                                                                        ) : (
                                                                            <span className="text-[10px]">{variant.location || 'Sin definir'}</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="p-3 text-center border-b border-stone-100/10 dark:border-stone-800/10">
                                                                        {isEditing ? (
                                                                            <input
                                                                                type="number"
                                                                                className="w-16 text-[10px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded p-1 text-center font-bold"
                                                                                value={(vEdit?.stock === 0 || vEdit?.stock === undefined) ? '' : vEdit.stock}
                                                                                onChange={e => updateVariantEdit(variant.id, 'stock', Number(e.target.value) || 0)}
                                                                                onFocus={(e) => e.target.select()}
                                                                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                                            />
                                                                        ) : (
                                                                            <span className={`text-[10px] font-mono font-bold ${variant.stock <= 2 ? 'text-red-500 underline decoration-dotted' : 'text-stone-500'}`}>{variant.stock}</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="p-3 text-right border-b border-stone-100/10 dark:border-stone-800/10">
                                                                        {isEditing ? (
                                                                            <input
                                                                                type="number"
                                                                                className="w-20 text-[10px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded p-1 text-right"
                                                                                value={(vEdit?.unit_cost === 0 || vEdit?.unit_cost === undefined) ? '' : vEdit.unit_cost}
                                                                                onChange={e => updateVariantEdit(variant.id, 'unit_cost', Number(e.target.value) || 0)}
                                                                                onFocus={(e) => e.target.select()}
                                                                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                                            />
                                                                        ) : (
                                                                            <span className="text-[10px] font-mono text-stone-400">{formatCurrency(variant.unit_cost || 0)}</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="p-3 text-right border-b border-stone-100/10 dark:border-stone-800/10">
                                                                        <span className="text-[10px] font-mono text-stone-400">{formatCurrency((variant.stock || 0) * (variant.unit_cost || 0))}</span>
                                                                    </td>
                                                                    <td className="border-b border-stone-100/10 dark:border-stone-800/10" />
                                                                </tr>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )
            }

            {/* Asset Modal (Internal Only) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingAsset ? 'Editar Activo' : 'Registrar Nuevo Activo'}
                size="lg"
            >
                <form onSubmit={handleAssetSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Input label="Nombre" value={assetFormData.name} onChange={e => setAssetFormData({ ...assetFormData, name: e.target.value })} required />
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Categoría</label>
                                <select className="w-full bg-stone-50 dark:bg-stone-950 p-3 rounded-lg border border-stone-200 dark:border-stone-800 text-sm" value={assetFormData.category} onChange={e => setAssetFormData({ ...assetFormData, category: e.target.value })}>
                                    <option value="">Seleccionar...</option>
                                    {assetCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Stock" type="number" value={assetFormData.stock} onChange={e => setAssetFormData({ ...assetFormData, stock: Number(e.target.value) })} required />
                                <Input label="Mínimo" type="number" value={assetFormData.min_stock} onChange={e => setAssetFormData({ ...assetFormData, min_stock: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Input label="Costo Unitario" type="number" value={assetFormData.unit_cost} onChange={e => setAssetFormData({ ...assetFormData, unit_cost: Number(e.target.value) })} />
                            <Input label="Ubicación" value={assetFormData.location} onChange={e => setAssetFormData({ ...assetFormData, location: e.target.value })} />
                            <textarea className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg text-sm h-24" placeholder="Notas sobre el activo o proveedor..." value={assetFormData.description} onChange={e => setAssetFormData({ ...assetFormData, description: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="bg-stone-900 text-white dark:bg-gold-500 dark:text-stone-900">Guardar</Button>
                    </div>
                </form>
            </Modal>
        </div >
    );
};
