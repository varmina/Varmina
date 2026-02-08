import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductStatus } from '../types';
import { Button, Modal } from '../components/UI';
import { supabaseProductService } from '../services/supabaseProductService';
import { Plus, Edit2, Trash2, AlertCircle, Package, Copy, Check, X as CloseIcon } from 'lucide-react';
import { ProductForm } from '../components/admin/ProductForm';
import { BrandManagement } from '../components/admin/BrandManagement';

// --- MAIN ADMIN COMPONENT ---
export const AdminDashboard = () => {
  const { products, refreshProducts, addToast, activeAdminTab } = useStore();
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
    totalClicks: products.reduce((acc, p) => acc + (p.whatsapp_clicks || 0), 0)
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
      refreshProducts(true, true);
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
      refreshProducts(true, true);
      setSelectedIds([]);
    } catch (e) {
      addToast('error', 'Error al actualizar estados');
    }
  };

  const handleSave = () => {
    refreshProducts(true, true);
    setEditingProduct(null);
    setIsCreating(false);
  };

  const handleDuplicate = async (id: string) => {
    try {
      await supabaseProductService.duplicate(id);
      addToast('success', 'Producto duplicado correctamente');
      refreshProducts(true, true);
    } catch (e) {
      addToast('error', 'Error al duplicar producto');
    }
  };

  const handleInlinePriceSave = async (id: string) => {
    try {
      await supabaseProductService.update(id, { price: inlinePrice });
      addToast('success', 'Precio actualizado');
      refreshProducts(true, true);
      setInlinePriceId(null);
    } catch (e) {
      addToast('error', 'Error al actualizar precio');
    }
  };

  const handleInlineStatusChange = async (id: string, status: ProductStatus) => {
    try {
      await supabaseProductService.update(id, { status });
      addToast('success', 'Estado actualizado');
      refreshProducts(true, true);
    } catch (e) {
      addToast('error', 'Error al actualizar estado');
    }
  };

  return (
    <div className="bg-transparent overflow-hidden h-full">
      <main className="h-full overflow-y-auto pt-16 pb-24 px-8 md:px-16 scrollbar-thin">

        {activeAdminTab === 'inventory' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-white dark:bg-stone-900 p-6 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Total Piezas</p>
                <p className="text-3xl font-serif text-stone-900 dark:text-gold-200">{stats.total}</p>
              </div>
              <div className="bg-white dark:bg-stone-900 p-6 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Interés Total</p>
                <p className="text-3xl font-serif text-gold-600">{stats.totalClicks} <span className="text-xs font-sans uppercase">Clicks</span></p>
              </div>
              <div className="bg-white dark:bg-stone-900 p-6 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">En Stock</p>
                <p className="text-3xl font-serif text-stone-900 dark:text-white">{stats.inStock}</p>
              </div>
              <div className="bg-white dark:bg-stone-900 p-6 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Bajo Pedido</p>
                <p className="text-3xl font-serif text-stone-900 dark:text-white">{stats.madeToOrder}</p>
              </div>
            </div>

            {/* Dashboard Top Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h1 className="font-serif text-4xl text-stone-900 dark:text-gold-200 tracking-wider mb-2 uppercase">Inventario</h1>
                <p className="text-stone-400 text-sm font-sans tracking-wide uppercase font-bold text-[10px]">Gestiona tus piezas exclusivas</p>
              </div>
              <div className="flex gap-4">
                <select
                  className="bg-white dark:bg-stone-900 text-[10px] font-bold uppercase tracking-widest px-4 py-2 outline-none border border-stone-100 dark:border-stone-800 dark:text-stone-300 rounded-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="All">Todos los estados</option>
                  <option value={ProductStatus.IN_STOCK}>Disponible</option>
                  <option value={ProductStatus.MADE_TO_ORDER}>Por Encargo</option>
                  <option value={ProductStatus.SOLD_OUT}>Agotado</option>
                </select>
                <Button onClick={() => setIsCreating(true)} className="flex gap-2">
                  <Plus className="w-5 h-5" /> Agregar Producto
                </Button>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
              <div className="bg-stone-900 text-white p-4 mb-8 flex items-center justify-between rounded-sm shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest">{selectedIds.length} seleccionados</span>
                  <div className="h-4 w-px bg-stone-700" />
                  <button onClick={() => handleBulkStatusChange(ProductStatus.IN_STOCK)} className="text-[10px] uppercase font-bold tracking-widest hover:text-gold-400 transition-colors">Disponible</button>
                  <button onClick={() => handleBulkStatusChange(ProductStatus.MADE_TO_ORDER)} className="text-[10px] uppercase font-bold tracking-widest hover:text-gold-400 transition-colors">Pedido</button>
                  <button onClick={() => handleBulkStatusChange(ProductStatus.SOLD_OUT)} className="text-[10px] uppercase font-bold tracking-widest hover:text-gold-400 transition-colors">Agotado</button>
                </div>
                <button onClick={() => setDeleteConfirm(selectedIds)} className="bg-red-500/10 text-red-400 px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                  Eliminar Lote
                </button>
              </div>
            )}

            {/* Product List Table */}
            <div className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-sm overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 px-6 py-4 border-b border-stone-100 dark:border-stone-800 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-stone-400 hidden md:grid">
                <div className="col-span-1 border-r border-stone-800/0">
                  <input type="checkbox" checked={selectedIds.length === products.length && products.length > 0} onChange={toggleSelectAll} className="w-4 h-4 accent-gold-500 rounded-sm" />
                </div>
                <div className="col-span-1">Imagen</div>
                <div className="col-span-5">Producto / Detalles</div>
                <div className="col-span-2 text-center">Precio</div>
                <div className="col-span-1 text-center">Estado</div>
                <div className="col-span-2 text-right">Acciones</div>
              </div>

              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {products
                  .filter(p => filterStatus === 'All' || p.status === filterStatus)
                  .map(product => (
                    <div key={product.id} className="grid grid-cols-1 md:grid-cols-12 items-center px-6 py-8 hover:bg-stone-50 dark:hover:bg-stone-900/30 transition-all group">

                      <div className="col-span-1 hidden md:block">
                        <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} className="w-4 h-4 accent-gold-500 rounded-sm" />
                      </div>

                      <div className="col-span-1">
                        <div className="relative w-12 h-14 overflow-hidden bg-stone-100 border border-stone-200 dark:border-stone-800 flex-shrink-0">
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="col-span-1 md:col-span-5 flex flex-col gap-2 mb-4 md:mb-0 ml-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif text-lg text-stone-900 dark:text-white leading-tight uppercase tracking-widest">{product.name}</h3>
                          {product.badge && (
                            <span className="text-[8px] bg-gold-100 dark:bg-gold-900/30 px-2 py-0.5 text-gold-600 rounded-full font-bold border border-gold-200/50 uppercase tracking-tighter">
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
                      </div>

                      {/* Price */}
                      <div className="col-span-2 text-center">
                        {inlinePriceId === product.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              autoFocus
                              className="w-20 bg-stone-100 dark:bg-stone-800 border-none p-1.5 text-xs text-stone-900 dark:text-white rounded-sm"
                              value={inlinePrice}
                              onChange={(e) => setInlinePrice(Number(e.target.value))}
                              onKeyDown={(e) => e.key === 'Enter' && handleInlinePriceSave(product.id)}
                            />
                            <button onClick={() => handleInlinePriceSave(product.id)} className="text-green-500"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setInlinePriceId(null)} className="text-red-400"><CloseIcon className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <span
                            onClick={() => { setInlinePriceId(product.id); setInlinePrice(product.price); }}
                            className="font-serif text-lg md:text-base text-stone-600 dark:text-stone-300 cursor-pointer hover:text-gold-600 border-b border-dashed border-transparent hover:border-gold-600 pb-0.5"
                          >
                            ${product.price ? product.price.toLocaleString('es-CL') : '0'}
                          </span>
                        )}
                      </div>

                      {/* Status */}
                      <div className="col-span-1 text-center">
                        <select
                          value={product.status}
                          onChange={(e) => handleInlineStatusChange(product.id, e.target.value as ProductStatus)}
                          className="bg-transparent text-[9px] font-bold uppercase tracking-widest outline-none border-none cursor-pointer focus:ring-0 dark:text-stone-400"
                        >
                          {Object.values(ProductStatus).map(s => (
                            <option key={s} value={s} className="bg-white dark:bg-stone-900">{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-1 md:opacity-0 group-hover:md:opacity-100 transition-opacity">
                        <button onClick={() => handleDuplicate(product.id)} className="p-2 text-stone-400 hover:text-gold-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-all" title="Duplicar"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditingProduct(product)} className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-all" title="Editar"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteConfirm([product.id])} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
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
            </div>
          </div>
        ) : (
          <BrandManagement />
        )}
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