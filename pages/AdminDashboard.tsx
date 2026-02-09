import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductStatus } from '../types';
import { Button, Modal } from '../components/UI';
import { supabaseProductService } from '../services/supabaseProductService';
import { Plus, Edit2, Trash2, AlertCircle, Package, Copy, Check, X as CloseIcon, BarChart3 } from 'lucide-react';
import { ProductForm } from '../components/admin/ProductForm';
import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard';
import { SettingsView } from '../components/admin/SettingsView';

import { useInventory } from '../hooks/useInventory';

// --- MAIN ADMIN COMPONENT ---
export const AdminDashboard = () => {
  const { addToast, activeAdminTab } = useStore();
  const { products, loading, refreshInventory } = useInventory(); // NEW: Local inventory hook

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<ProductStatus | 'All'>('All');
  const [inlinePriceId, setInlinePriceId] = useState<string | null>(null);
  const [inlinePrice, setInlinePrice] = useState<number>(0);

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.status === ProductStatus.IN_STOCK).length,
    madeToOrder: products.filter(p => p.status === ProductStatus.MADE_TO_ORDER).length,
    soldOut: products.filter(p => p.status === ProductStatus.SOLD_OUT).length,
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) setSelectedIds([]);
    else setSelectedIds(products.map(p => p.id));
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
      case 'inventory':
      default:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
              <div className="bg-white dark:bg-stone-900 p-4 md:p-6 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm transition-transform active:scale-95">
                <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 md:mb-2">Total Piezas</p>
                <p className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-gold-200">{stats.total}</p>
              </div>
              <div className="bg-white dark:bg-stone-900 p-4 md:p-6 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm transition-transform active:scale-95">
                <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 md:mb-2">Agotado</p>
                <p className="text-2xl md:text-3xl font-serif text-stone-500">{stats.soldOut}</p>
              </div>
              <div className="bg-white dark:bg-stone-900 p-4 md:p-6 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm transition-transform active:scale-95">
                <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 md:mb-2">En Stock</p>
                <p className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-white">{stats.inStock}</p>
              </div>
              <div className="bg-white dark:bg-stone-900 p-4 md:p-6 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm transition-transform active:scale-95">
                <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 md:mb-2">Bajo Pedido</p>
                <p className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-white">{stats.madeToOrder}</p>
              </div>
            </div>

            {/* Dashboard Top Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl text-stone-900 dark:text-gold-200 tracking-wider mb-1 md:mb-2 uppercase">Inventario</h1>
                <p className="text-stone-400 text-[9px] md:text-sm font-sans tracking-wide uppercase font-bold">Gestiona tus piezas exclusivas</p>
              </div>
              <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 md:gap-4">
                <select
                  className="w-full sm:w-auto bg-white dark:bg-stone-900 text-[10px] font-bold uppercase tracking-widest px-4 py-3 md:py-2 outline-none border border-stone-100 dark:border-stone-800 dark:text-stone-300 rounded-sm appearance-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="All">Todos los estados</option>
                  <option value={ProductStatus.IN_STOCK}>Disponible</option>
                  <option value={ProductStatus.MADE_TO_ORDER}>Por Encargo</option>
                  <option value={ProductStatus.SOLD_OUT}>Agotado</option>
                </select>
                <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto flex justify-center items-center gap-2 py-3 md:py-2">
                  <Plus className="w-4 h-4 md:w-5 md:h-5" /> Agregar Producto
                </Button>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
              <div className="sticky top-20 z-30 bg-stone-900 text-white p-3 md:p-4 mb-8 flex flex-col md:flex-row items-center justify-between rounded-sm shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 gap-4">
                <div className="flex items-center gap-3 md:gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{selectedIds.length} seleccionados</span>
                  <div className="h-4 w-px bg-stone-700 flex-shrink-0" />
                  <button onClick={() => handleBulkStatusChange(ProductStatus.IN_STOCK)} className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest hover:text-gold-400 transition-colors whitespace-nowrap">Disponible</button>
                  <button onClick={() => handleBulkStatusChange(ProductStatus.MADE_TO_ORDER)} className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest hover:text-gold-400 transition-colors whitespace-nowrap">Pedido</button>
                  <button onClick={() => handleBulkStatusChange(ProductStatus.SOLD_OUT)} className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest hover:text-gold-400 transition-colors whitespace-nowrap">Agotado</button>
                </div>
                <button onClick={() => setDeleteConfirm(selectedIds)} className="w-full md:w-auto bg-red-500 text-white md:bg-red-500/10 md:text-red-400 px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 md:hover:bg-red-500 md:hover:text-white transition-all">
                  Eliminar Lote
                </button>
              </div>
            )}

            {/* Product List */}
            <div className="w-full bg-white dark:bg-stone-900 md:border border-stone-100 dark:border-stone-800 rounded-sm overflow-hidden shadow-sm min-h-[400px]">
              {loading ? (
                <div className="py-24 text-center">
                  <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[10px] uppercase tracking-widest text-stone-400">Cargando inventario...</p>
                </div>
              ) : (
                <>
                  {/* Desktop Header */}
                  <div className="grid grid-cols-12 px-6 py-4 border-b border-stone-100 dark:border-stone-800 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-stone-400 hidden lg:grid">
                    <div className="col-span-1">
                      <input type="checkbox" checked={selectedIds.length === products.length && products.length > 0} onChange={toggleSelectAll} className="w-4 h-4 accent-gold-500 rounded-sm" />
                    </div>
                    <div className="col-span-1">Imagen</div>
                    <div className="col-span-4">Producto / Detalles</div>
                    <div className="col-span-2 text-center">Precio</div>
                    <div className="col-span-2 text-center">Estado</div>
                    <div className="col-span-2 text-right">Acciones</div>
                  </div>

                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {products
                      .filter(p => filterStatus === 'All' || p.status === filterStatus)
                      .map(product => (
                        <div key={product.id} className="flex flex-col lg:grid lg:grid-cols-12 items-center px-4 md:px-6 py-6 md:py-8 hover:bg-stone-50 dark:hover:bg-stone-900/30 transition-all group relative">

                          {/* Desktop Checkbox */}
                          <div className="col-span-1 hidden lg:block">
                            <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} className="w-4 h-4 accent-gold-500 rounded-sm" />
                          </div>

                          {/* Mobile Header: Checkbox + Status */}
                          <div className="w-full flex lg:hidden items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} className="w-5 h-5 accent-gold-500 rounded-sm" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">ID: {product.id.slice(0, 8)}</span>
                            </div>
                            <div className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${product.status === ProductStatus.IN_STOCK ? 'bg-green-50 text-green-600 dark:bg-green-900/20' :
                              product.status === ProductStatus.MADE_TO_ORDER ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                                'bg-red-50 text-red-600 dark:bg-red-900/20'
                              }`}>
                              {product.status}
                            </div>
                          </div>

                          <div className="w-full flex lg:contents gap-4 items-start">
                            {/* Image */}
                            <div className="col-span-1 flex-shrink-0">
                              <div className="relative w-20 h-24 lg:w-12 lg:h-14 overflow-hidden bg-stone-100 border border-stone-200 dark:border-stone-800">
                                <img src={product.images[0]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              </div>
                            </div>

                            {/* Product Info */}
                            <div className="col-span-1 lg:col-span-4 flex flex-col gap-1 md:gap-2 flex-grow lg:ml-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-serif text-lg md:text-xl lg:text-lg text-stone-900 dark:text-white leading-tight uppercase tracking-widest">{product.name}</h3>
                                {product.badge && (
                                  <span className="text-[8px] bg-gold-100 dark:bg-gold-900/30 px-2 py-0.5 text-gold-600 rounded-sm font-bold border border-gold-200/50 uppercase tracking-tighter">
                                    {product.badge}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {product.category && (
                                  <span className="text-[8px] bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-stone-500 rounded-sm font-bold uppercase tracking-widest">
                                    {product.category}
                                  </span>
                                )}
                                {product.collection && (
                                  <span className="text-[8px] border border-stone-200 dark:border-stone-800 px-2 py-0.5 text-stone-400 rounded-sm font-bold uppercase tracking-widest">
                                    {product.collection}
                                  </span>
                                )}
                              </div>
                              <div className="lg:hidden mt-2">
                                <span className="font-serif text-2xl text-gold-600">${product.price?.toLocaleString('es-CL')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Price */}
                          <div className="hidden lg:block lg:col-span-2 text-center">
                            {inlinePriceId === product.id ? (
                              <div className="flex items-center justify-center gap-2">
                                <input
                                  type="number"
                                  autoFocus
                                  className="w-24 bg-stone-100 dark:bg-stone-800 border-none p-1.5 text-xs text-stone-900 dark:text-white rounded-sm outline-none ring-1 ring-gold-500"
                                  value={inlinePrice}
                                  onChange={(e) => setInlinePrice(Number(e.target.value))}
                                  onKeyDown={(e) => e.key === 'Enter' && handleInlinePriceSave(product.id)}
                                />
                                <button onClick={() => handleInlinePriceSave(product.id)} className="text-green-500 p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"><Check className="w-4 h-4" /></button>
                                <button onClick={() => setInlinePriceId(null)} className="text-red-400 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"><CloseIcon className="w-4 h-4" /></button>
                              </div>
                            ) : (
                              <span
                                onClick={() => { setInlinePriceId(product.id); setInlinePrice(product.price); }}
                                className="font-serif text-lg text-stone-600 dark:text-stone-300 cursor-pointer hover:text-gold-600 border-b border-dashed border-stone-200 dark:border-stone-800 hover:border-gold-600 pb-0.5 transition-colors"
                              >
                                ${product.price ? product.price.toLocaleString('es-CL') : '0'}
                              </span>
                            )}
                          </div>

                          {/* Desktop Status */}
                          <div className="hidden lg:block lg:col-span-2 text-center">
                            <select
                              value={product.status}
                              onChange={(e) => handleInlineStatusChange(product.id, e.target.value as ProductStatus)}
                              className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none border-none cursor-pointer focus:ring-0 dark:text-stone-400 hover:text-gold-600 transition-colors"
                            >
                              {Object.values(ProductStatus).map(s => (
                                <option key={s} value={s} className="bg-white dark:bg-stone-900">{s}</option>
                              ))}
                            </select>
                          </div>

                          {/* Actions */}
                          <div className="w-full lg:w-auto mt-6 lg:mt-0 flex items-center justify-between lg:justify-end gap-2 lg:col-span-2 lg:opacity-0 group-hover:lg:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <button onClick={() => handleDuplicate(product.id)} className="p-3 lg:p-2 text-stone-500 hover:text-gold-600 hover:bg-gold-50 dark:hover:bg-gold-900/10 rounded-full transition-all flex items-center gap-2 lg:gap-0" title="Duplicar">
                                <Copy className="w-4 h-4" />
                                <span className="lg:hidden text-[10px] font-bold uppercase tracking-widest">Duplicar</span>
                              </button>
                              <button onClick={() => setEditingProduct(product)} className="p-3 lg:p-2 text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-all flex items-center gap-2 lg:gap-0" title="Editar">
                                <Edit2 className="w-4 h-4" />
                                <span className="lg:hidden text-[10px] font-bold uppercase tracking-widest">Editar</span>
                              </button>
                            </div>
                            <button onClick={() => setDeleteConfirm([product.id])} className="p-3 lg:p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-all flex items-center gap-2 lg:gap-0" title="Eliminar">
                              <Trash2 className="w-4 h-4" />
                              <span className="lg:hidden text-[10px] font-bold uppercase tracking-widest">Eliminar</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  {products.length === 0 && (
                    <div className="py-24 text-center">
                      <Package className="w-16 h-16 mx-auto mb-6 text-stone-200" />
                      <p className="font-serif text-xl text-stone-400 uppercase tracking-widest">No hay piezas en el inventario.</p>
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
      <main className="h-full overflow-y-auto pt-16 pb-24 px-8 md:px-16 scrollbar-thin">

        {renderContent()}

      </main>

      {/* Shared Modals */}
      <Modal
        isOpen={isCreating || !!editingProduct}
        onClose={() => { setIsCreating(false); setEditingProduct(null); }}
        title={isCreating ? "Agregar Pieza" : "Editar Pieza"}
      >
        <ProductForm
          initialData={editingProduct || undefined}
          onSave={handleSave}
          onCancel={() => { setIsCreating(false); setEditingProduct(null); }}
        />
      </Modal>

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
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteBulk}>Sí, Eliminar</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};