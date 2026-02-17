'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Product, ProductStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { supabaseProductService } from '@/services/supabaseProductService';
import { Plus, Edit2, Trash2, AlertCircle, Package, Copy, Check, X as CloseIcon, FileText, Search } from 'lucide-react';
import { ProductForm } from '@/components/admin/product-form';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { SettingsView } from '@/components/admin/settings-view';
import { FinanceView } from '@/components/admin/finance-view';
import { AssetsView } from '@/components/admin/assets-view';
import { ProductBulkImport } from '@/components/admin/product-bulk-import';
import { OrdersView } from '@/components/admin/orders-view';
import { useInventory } from '@/hooks/use-inventory';

// --- MAIN ADMIN COMPONENT ---
export const AdminDashboardView = () => {
    const { addToast, activeAdminTab } = useStore();
    const { products, loading, refreshInventory } = useInventory();

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isBulkImporting, setIsBulkImporting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string[] | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<ProductStatus | 'All'>('All');
    const [inlinePriceId, setInlinePriceId] = useState<string | null>(null);
    const [inlinePrice, setInlinePrice] = useState<number>(0);
    const [lastTab, setLastTab] = useState(activeAdminTab);

    // Close modals on tab change
    React.useEffect(() => {
        if (activeAdminTab !== lastTab) {
            setIsCreating(false);
            setEditingProduct(null);
            setIsBulkImporting(false);
            setLastTab(activeAdminTab);
        }
    }, [activeAdminTab, lastTab]);

    const stats = {
        total: products.length,
        inStock: products.filter((p: Product) => p.status === ProductStatus.IN_STOCK).length,
        madeToOrder: products.filter((p: Product) => p.status === ProductStatus.MADE_TO_ORDER).length,
        soldOut: products.filter((p: Product) => p.status === ProductStatus.SOLD_OUT).length,
    };

    const filteredInventory = products.filter((p: Product) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
        const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredInventory.length) setSelectedIds([]);
        else setSelectedIds(filteredInventory.map((p: Product) => p.id));
    };

    const handleDeleteBulk = async () => {
        if (!deleteConfirm) return;
        try {
            await supabaseProductService.deleteBulk(deleteConfirm);
            addToast('success', `${deleteConfirm.length} producto(s) eliminado(s)`);
            refreshInventory();
            setDeleteConfirm(null);
            setSelectedIds([]);
        } catch (e) {
            addToast('error', 'Error al eliminar productos');
        }
    };

    const handleBulkStatusChange = async (status: ProductStatus) => {
        try {
            await supabaseProductService.updateStatusBulk(selectedIds, status);
            addToast('success', 'Estado actualizado en lote');
            refreshInventory();
            setSelectedIds([]);
        } catch (e) {
            addToast('error', 'Error al actualizar estados');
        }
    };

    const handleSave = () => {
        refreshInventory();
        setEditingProduct(null);
        setIsCreating(false);
    };

    const handleDuplicate = async (id: string) => {
        try {
            await supabaseProductService.duplicate(id);
            addToast('success', 'Producto duplicado correctamente');
            refreshInventory();
        } catch (e) {
            addToast('error', 'Error al duplicar producto');
        }
    };

    const handleInlinePriceSave = async (id: string) => {
        try {
            await supabaseProductService.update(id, { price: inlinePrice });
            addToast('success', 'Precio actualizado');
            refreshInventory();
            setInlinePriceId(null);
        } catch (e) {
            addToast('error', 'Error al actualizar precio');
        }
    };

    const handleInlineStatusChange = async (id: string, status: ProductStatus) => {
        try {
            await supabaseProductService.update(id, { status });
            addToast('success', 'Estado actualizado');
            refreshInventory();
        } catch (e) {
            addToast('error', 'Error al actualizar estado');
        }
    };

    const renderContent = () => {
        switch (activeAdminTab) {
            case 'analytics':
                return <AnalyticsDashboard />;
            case 'settings':
                return <SettingsView />;
            case 'finance':
                return <FinanceView />;
            case 'erp':
                return <AssetsView />;
            case 'orders':
                return <OrdersView />;
            case 'inventory':
            default:
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto">

                        {/* Header & Controls */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
                            <div className="px-4 md:px-0">
                                <h1 className="font-serif text-xl md:text-3xl text-stone-900 dark:text-gold-200 tracking-wider mb-1 uppercase">Inventario</h1>
                                <p className="text-stone-400 text-[10px] md:text-xs font-sans tracking-[0.2em] uppercase font-bold">
                                    {stats.total} Piezas Registradas
                                </p>
                            </div>

                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 px-4 md:px-0">
                                <div className="w-full lg:w-auto space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative flex-1 sm:w-80">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                            <input
                                                type="text"
                                                placeholder="Buscar en inventario..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg py-3 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-gold-500 transition-all uppercase tracking-wide placeholder:text-stone-400 dark:text-white"
                                            />
                                        </div>
                                        <div className="flex bg-white dark:bg-stone-900 p-1 rounded-lg border border-stone-200 dark:border-stone-800 flex-1 sm:flex-none">
                                            <select
                                                className="w-full bg-transparent text-[9px] font-bold uppercase tracking-widest px-4 py-2 outline-none border-none text-stone-500 dark:text-stone-400 cursor-pointer"
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                            >
                                                <option value="All">Todos los Estados</option>
                                                <option value={ProductStatus.IN_STOCK}>Disponible</option>
                                                <option value={ProductStatus.MADE_TO_ORDER}>Por Encargo</option>
                                                <option value={ProductStatus.SOLD_OUT}>Agotado</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full lg:w-auto">
                                    <Button
                                        onClick={() => setIsBulkImporting(true)}
                                        variant="ghost"
                                        className="flex-1 lg:flex-none py-3 px-6 rounded-xl text-[9px] font-bold tracking-widest border border-stone-200 dark:border-stone-800 text-stone-400 hover:text-stone-900"
                                    >
                                        Carga Masiva
                                    </Button>
                                    <Button onClick={() => setIsCreating(true)} className="flex-1 lg:flex-none py-3 px-8 rounded-xl text-[9px] font-bold tracking-widest bg-stone-900 text-white dark:bg-gold-500 dark:text-stone-900 shadow-xl">
                                        <Plus className="w-4 h-4 mr-1" /> Nueva Pieza
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Stats Overview - Premium Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 px-4 md:px-0">
                            <div className="bg-white dark:bg-stone-900 p-4 md:p-5 rounded-xl border border-stone-100 dark:border-stone-800 flex flex-col items-center justify-center text-center group transition-all">
                                <span className="text-xl md:text-3xl font-serif text-stone-900 dark:text-white mb-1">{stats.total}</span>
                                <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-stone-400 font-bold">Total</span>
                            </div>
                            <div className="bg-white dark:bg-stone-900 p-4 md:p-5 rounded-xl border border-stone-100 dark:border-stone-800 flex flex-col items-center justify-center text-center group transition-all">
                                <span className="text-xl md:text-3xl font-serif text-green-600 dark:text-green-400 mb-1">{stats.inStock}</span>
                                <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-stone-400 font-bold">Stock</span>
                            </div>
                            <div className="bg-white dark:bg-stone-900 p-4 md:p-5 rounded-xl border border-stone-100 dark:border-stone-800 flex flex-col items-center justify-center text-center group transition-all">
                                <span className="text-xl md:text-3xl font-serif text-blue-600 dark:text-blue-400 mb-1">{stats.madeToOrder}</span>
                                <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-stone-400 font-bold">Encargo</span>
                            </div>
                            <div className="bg-white dark:bg-stone-900 p-4 md:p-5 rounded-xl border border-stone-100 dark:border-stone-800 flex flex-col items-center justify-center text-center group transition-all">
                                <span className="text-xl md:text-3xl font-serif text-stone-400 mb-1">{stats.soldOut}</span>
                                <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-stone-400 font-bold">Agotado</span>
                            </div>
                        </div>

                        {/* Bulk Actions Bar */}
                        {selectedIds.length > 0 && (
                            <div className="sticky top-20 z-30 bg-stone-900 text-white p-3 md:p-4 mb-6 flex flex-col md:flex-row items-center justify-between rounded-xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 gap-4 border border-stone-800">
                                <div className="flex items-center gap-3 md:gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap px-3 py-1 bg-white/10 rounded-full">{selectedIds.length} seleccionados</span>
                                    <div className="h-4 w-px bg-stone-700 flex-shrink-0" />
                                    <button onClick={() => handleBulkStatusChange(ProductStatus.IN_STOCK)} className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest hover:text-gold-400 transition-colors whitespace-nowrap">Disponible</button>
                                    <button onClick={() => handleBulkStatusChange(ProductStatus.MADE_TO_ORDER)} className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest hover:text-gold-400 transition-colors whitespace-nowrap">Pedido</button>
                                    <button onClick={() => handleBulkStatusChange(ProductStatus.SOLD_OUT)} className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest hover:text-gold-400 transition-colors whitespace-nowrap">Agotado</button>
                                </div>
                                <button onClick={() => setDeleteConfirm(selectedIds)} className="w-full md:w-auto bg-red-600 text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-md hover:shadow-lg">
                                    Eliminar
                                </button>
                            </div>
                        )}

                        {/* Product List */}
                        <div className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl overflow-hidden shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] min-h-[400px]">
                            {loading ? (
                                <div className="py-24 text-center">
                                    <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-[10px] uppercase tracking-widest text-stone-400">Cargando inventario...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Header */}
                                    <div className="hidden lg:grid lg:grid-cols-[50px_120px_1fr_80px_120px_160px_120px] gap-x-4 px-6 py-4 border-b border-stone-100 dark:border-stone-800 text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 bg-stone-50/50 dark:bg-stone-900/50 items-center">
                                        <div className="flex justify-center">
                                            <input type="checkbox" checked={selectedIds.length === filteredInventory.length && filteredInventory.length > 0} onChange={toggleSelectAll} className="w-4 h-4 accent-gold-500 rounded-sm cursor-pointer" />
                                        </div>
                                        <div className="text-center">Vista Previa</div>
                                        <div className="pl-4">Detalles del Producto</div>
                                        <div className="text-center">Stock</div>
                                        <div className="text-center">Precio</div>
                                        <div className="text-center">Estado</div>
                                        <div className="text-center">Acciones</div>
                                    </div>

                                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                                        {filteredInventory.map((product: Product) => (
                                            <div key={product.id} className="flex flex-col lg:grid lg:grid-cols-[50px_120px_1fr_80px_120px_160px_120px] gap-x-4 items-center px-4 md:px-6 py-6 md:py-5 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors group relative">

                                                {/* Desktop Checkbox */}
                                                <div className="hidden lg:flex justify-center items-center">
                                                    <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} className="w-4 h-4 accent-gold-500 rounded-sm cursor-pointer" />
                                                </div>

                                                {/* Mobile Header: Checkbox + Status */}
                                                <div className="w-full flex lg:hidden items-center justify-between mb-4 pb-4 border-b border-stone-50 dark:border-stone-800/50">
                                                    <div className="flex items-center gap-3">
                                                        <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} className="w-5 h-5 accent-gold-500 rounded-md" />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-stone-300">ID: {product.id.slice(0, 8)}</span>
                                                    </div>
                                                    <div className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${product.status === ProductStatus.IN_STOCK ? 'bg-green-50 text-green-600 dark:bg-green-900/20' :
                                                        product.status === ProductStatus.MADE_TO_ORDER ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                                                            'bg-red-50 text-red-600 dark:bg-red-900/20'
                                                        }`}>
                                                        {product.status}
                                                    </div>
                                                </div>

                                                <div className="w-full flex lg:contents gap-4 items-center">
                                                    {/* Image */}
                                                    <div className="flex justify-center items-center flex-shrink-0">
                                                        <div className="relative w-28 h-36 lg:w-20 lg:h-24 overflow-hidden bg-stone-100 border border-stone-200 dark:border-stone-800 rounded-lg shadow-sm">
                                                            <img src={product.images[0]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                        </div>
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex flex-col gap-1 lg:pl-4 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="font-serif text-lg lg:text-[13px] text-stone-900 dark:text-white leading-tight uppercase tracking-wide truncate max-w-full">{product.name}</h3>
                                                            {product.badge && (
                                                                <span className="text-[8px] bg-gold-500 text-stone-900 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                                                                    {product.badge}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {product.category && (
                                                                <span className="text-[10px] text-gold-600 dark:text-gold-400 font-bold uppercase tracking-widest bg-gold-50 dark:bg-gold-900/10 px-2 py-0.5 rounded">
                                                                    {product.category}
                                                                </span>
                                                            )}
                                                            {product.collection && (
                                                                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                                                                    {product.collection}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Desktop Stock */}
                                                <div className="hidden lg:flex justify-center items-center">
                                                    <span className={`font-mono text-xs font-bold px-2 py-1 rounded-md ${(!product.stock || product.stock === 0) ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'}`}>
                                                        {product.stock || 0}
                                                    </span>
                                                </div>

                                                {/* Desktop Price */}
                                                <div className="hidden lg:flex justify-center items-center">
                                                    {inlinePriceId === product.id ? (
                                                        <div className="flex items-center justify-center gap-1">
                                                            <input
                                                                type="number"
                                                                autoFocus
                                                                className="w-20 bg-white dark:bg-stone-800 border p-1 text-xs text-stone-900 dark:text-white rounded-md outline-none border-gold-500 focus:ring-1 focus:ring-gold-500"
                                                                value={inlinePrice}
                                                                onChange={(e) => setInlinePrice(Number(e.target.value))}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleInlinePriceSave(product.id)}
                                                            />
                                                            <button onClick={() => handleInlinePriceSave(product.id)} className="p-1 text-green-500 hover:bg-green-50 rounded"><Check className="w-3 h-3" /></button>
                                                            <button onClick={() => setInlinePriceId(null)} className="p-1 text-red-400 hover:bg-red-50 rounded"><CloseIcon className="w-3 h-3" /></button>
                                                        </div>
                                                    ) : (
                                                        <span
                                                            onClick={() => { setInlinePriceId(product.id); setInlinePrice(product.price); }}
                                                            className="font-serif text-sm font-medium text-stone-900 dark:text-stone-200 cursor-pointer hover:text-gold-600 border-b border-dashed border-stone-300 hover:border-gold-600 transition-all whitespace-nowrap"
                                                        >
                                                            ${product.price ? product.price.toLocaleString('es-CL') : '0'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Desktop Status */}
                                                <div className="hidden lg:flex justify-center items-center">
                                                    <div className="relative inline-block">
                                                        <select
                                                            value={product.status}
                                                            onChange={(e) => handleInlineStatusChange(product.id, e.target.value as ProductStatus)}
                                                            className={`appearance-none bg-transparent pl-3 pr-8 py-1 text-[9px] font-bold uppercase tracking-widest outline-none border-none cursor-pointer focus:ring-0 transition-colors ${product.status === ProductStatus.IN_STOCK ? 'text-green-600' :
                                                                product.status === ProductStatus.MADE_TO_ORDER ? 'text-blue-500' : 'text-stone-400'
                                                                }`}
                                                        >
                                                            {Object.values(ProductStatus).map(s => (
                                                                <option key={s} value={s} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">{s}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-50">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="hidden lg:flex justify-center items-center gap-2 lg:opacity-0 group-hover:lg:opacity-100 transition-opacity">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleDuplicate(product.id)} className="p-2 text-stone-400 hover:text-gold-600 hover:bg-gold-50 dark:hover:bg-gold-900/10 rounded-full transition-all flex items-center gap-2 border border-transparent hover:border-gold-200" title="Duplicar">
                                                            <Copy className="w-4 h-4" />
                                                            <span className="lg:hidden text-[10px] font-bold uppercase tracking-widest">Duplicar</span>
                                                        </button>
                                                        <button onClick={() => setEditingProduct(product)} className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-all flex items-center gap-2" title="Editar">
                                                            <Edit2 className="w-4 h-4" />
                                                            <span className="lg:hidden text-[10px] font-bold uppercase tracking-widest">Editar</span>
                                                        </button>
                                                    </div>
                                                    <button onClick={() => setDeleteConfirm([product.id])} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-all flex items-center gap-2" title="Eliminar">
                                                        <Trash2 className="w-4 h-4" />
                                                        <span className="lg:hidden text-[10px] font-bold uppercase tracking-widest">Eliminar</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {filteredInventory.length === 0 && (
                                        <div className="py-24 text-center">
                                            <Package className="w-16 h-16 mx-auto mb-6 text-stone-200" />
                                            <p className="font-serif text-xl text-stone-400 uppercase tracking-widest">
                                                {search ? 'No se encontraron resultados' : 'No hay piezas en el inventario'}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="bg-transparent overflow-hidden h-full">
            <main className="h-full overflow-y-auto pt-6 pb-24 px-4 md:px-8 scrollbar-thin">

                {renderContent()}

            </main>

            {/* Shared Modals */}
            <Modal
                isOpen={isCreating || !!editingProduct}
                onClose={() => { setIsCreating(false); setEditingProduct(null); }}
                size="xl"
                title={editingProduct ? 'Editar Pieza' : 'Nueva Pieza'}
            >
                <ProductForm
                    initialData={editingProduct || undefined}
                    onSave={handleSave}
                    onCancel={() => { setIsCreating(false); setEditingProduct(null); }}
                />
            </Modal>

            <ProductBulkImport
                isOpen={isBulkImporting}
                onClose={() => setIsBulkImporting(false)}
                onSuccess={refreshInventory}
            />

            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar Eliminación">
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <p className="text-stone-600 dark:text-stone-300 mb-8 font-serif leading-relaxed px-4">
                        ¿Estás seguro de que deseas eliminar {deleteConfirm && deleteConfirm.length > 1 ? 'estos productos' : 'esta pieza de lujo'}?<br />Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>No, Conservar</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 shadow-lg hover:shadow-red-500/20" onClick={handleDeleteBulk}>Sí, Eliminar</Button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};
