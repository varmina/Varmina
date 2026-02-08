import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductStatus } from '../types';
import { Button, Input, StatusBadge, Modal } from '../components/UI';
import { supabaseProductService } from '../services/supabaseProductService';
import { Plus, Edit2, Trash2, Upload, X, AlertCircle, Package } from 'lucide-react';

// --- PRODUCT FORM ---
const ProductForm = ({ initialData, onSave, onCancel }: {
  initialData?: Product,
  onSave: () => void,
  onCancel: () => void
}) => {
  const { addToast } = useStore();
  const [formData, setFormData] = useState<Partial<Product>>(initialData || {
    name: '',
    description: '',
    price: 0,
    status: ProductStatus.IN_STOCK,
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "El nombre es obligatorio";
    if (!formData.price || formData.price <= 0) newErrors.price = "Se requiere un precio válido";
    if ((formData.images?.length || 0) === 0) newErrors.images = "Se requiere al menos una imagen";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (initialData) {
        await supabaseProductService.update(initialData.id, {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          images: formData.images,
          status: formData.status,
        });
        addToast('success', 'Producto actualizado con éxito');
      } else {
        await supabaseProductService.create({
          name: formData.name!,
          description: formData.description,
          price: formData.price!,
          images: formData.images,
          status: formData.status,
        });
        addToast('success', 'Producto creado con éxito');
      }
      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      addToast('error', 'Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        const uploadPromises = Array.from(e.target.files).map((file: File) =>
          supabaseProductService.uploadImage(file)
        );

        const uploadedUrls = await Promise.all(uploadPromises);
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...uploadedUrls] }));
        addToast('success', `${uploadedUrls.length} imagen(es) subida(s)`);
      } catch (error) {
        console.error('Error uploading images:', error);
        addToast('error', 'Error al subir imágenes');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveImage = async (imageUrl: string, index: number) => {
    try {
      if (imageUrl.includes('supabase')) {
        await supabaseProductService.deleteImage(imageUrl);
      }
      setFormData({ ...formData, images: formData.images?.filter((_, i) => i !== index) });
    } catch (error) {
      console.error('Error removing image:', error);
      addToast('error', 'Error al eliminar imagen');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Input
          label="Nombre del Producto"
          placeholder="Ej: Collar Luz de Luna"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />
        <Input
          label="Precio (CLP)"
          type="number"
          placeholder="0"
          value={formData.price}
          onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
          error={errors.price}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-stone-400 mb-2">Descripción</label>
        <textarea
          className="w-full bg-transparent border border-stone-200 p-4 text-stone-900 font-sans text-sm focus:border-gold-400 focus:outline-none min-h-[120px] dark:border-stone-700 dark:text-stone-100 transition-colors resize-none leading-relaxed"
          placeholder="Escribe la historia o detalles técnicos de la pieza..."
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-stone-400">Estado</label>
        <div className="flex flex-wrap gap-6">
          {[
            { id: ProductStatus.IN_STOCK, label: 'Disponible', color: 'bg-gold-500' },
            { id: ProductStatus.MADE_TO_ORDER, label: 'Por Encargo', color: 'bg-stone-500' },
            { id: ProductStatus.SOLD_OUT, label: 'Agotado', color: 'bg-stone-900' }
          ].map(s => (
            <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="status"
                  checked={formData.status === s.id}
                  onChange={() => setFormData({ ...formData, status: s.id as ProductStatus })}
                  className="peer appearance-none w-5 h-5 border-2 border-stone-200 rounded-full checked:border-gold-500 transition-all cursor-pointer"
                />
                <div className={`absolute w-2.5 h-2.5 rounded-full scale-0 peer-checked:scale-100 transition-transform ${s.color}`} />
              </div>
              <span className={`text-xs tracking-wide transition-colors ${formData.status === s.id ? 'text-stone-900 font-bold' : 'text-stone-400 group-hover:text-stone-600'}`}>
                {s.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-stone-400">Imágenes</label>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {formData.images?.map((img, idx) => (
            <div key={idx} className="relative aspect-square group overflow-hidden bg-stone-50 border border-stone-100 rounded-sm">
              <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="upload" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img, idx)}
                  className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <label className={`
            border-2 border-dashed border-stone-200 rounded-sm flex flex-col items-center justify-center aspect-square cursor-pointer transition-all hover:border-gold-400 hover:bg-stone-50 group
            ${isUploading ? 'opacity-50 cursor-wait' : ''}
          `}>
            <div className="flex flex-col items-center gap-2 group-hover:translate-y-[-2px] transition-transform">
              <Upload className="w-6 h-6 text-stone-300 group-hover:text-gold-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-gold-600">
                {isUploading ? 'Subiendo...' : 'Subir'}
              </span>
            </div>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
          </label>
        </div>
        {errors.images && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.images}</p>}
      </div>

      <div className="flex justify-end gap-4 pt-8 border-t border-stone-100">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting} size="lg">
          {initialData ? 'Actualizar' : 'Agregar Pieza'}
        </Button>
      </div>
    </form>
  );
};

// --- MAIN ADMIN COMPONENT ---
export const AdminDashboard = () => {
  const { products, refreshProducts, addToast } = useStore();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await supabaseProductService.delete(id);
      addToast('success', 'Producto eliminado');
      refreshProducts();
      setDeleteConfirm(null);
    } catch (e) {
      addToast('error', 'No se pudo eliminar el producto');
    }
  };

  const handleSave = () => {
    refreshProducts();
    setEditingProduct(null);
    setIsCreating(false);
  };

  return (
    <div className="flex-1 px-6 py-12 md:px-12 bg-white dark:bg-stone-950 min-h-screen">

      {/* Dashboard Top Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
        <div>
          <h1 className="font-serif text-4xl text-stone-900 dark:text-gold-200 tracking-wider mb-2 uppercase">Inventario</h1>
          <p className="text-stone-400 text-sm font-sans tracking-wide uppercase font-bold text-[10px]">Gestiona tus piezas exclusivas</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex gap-2">
          <Plus className="w-5 h-5" /> Agregar Producto
        </Button>
      </div>

      {/* Product List Table */}
      <div className="w-full">
        <div className="grid grid-cols-12 px-6 py-4 border-b border-stone-100 dark:border-stone-800 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-stone-400 hidden md:grid">
          <div className="col-span-6">Producto</div>
          <div className="col-span-2">Precio</div>
          <div className="col-span-2">Estado</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {products.map(product => (
            <div key={product.id} className="grid grid-cols-1 md:grid-cols-12 items-center px-6 py-8 hover:bg-stone-50 dark:hover:bg-stone-900/30 transition-all group">

              {/* Product Info */}
              <div className="col-span-1 md:col-span-6 flex items-center gap-6 mb-4 md:mb-0">
                <div className="relative w-20 h-24 overflow-hidden bg-stone-100 border border-stone-200 dark:border-stone-800 flex-shrink-0">
                  <img src={product.images[0]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-stone-900 dark:text-white leading-tight uppercase tracking-widest">{product.name}</h3>
                  <p className="text-[10px] font-mono text-stone-400 uppercase">{product.id.slice(0, 8)}...</p>
                </div>
              </div>

              {/* Price */}
              <div className="col-span-2 mb-4 md:mb-0">
                <span className="font-serif text-lg md:text-base text-stone-600 dark:text-stone-300">
                  ${product.price.toLocaleString('es-CL')}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2 mb-6 md:mb-0">
                <StatusBadge status={product.status} />
              </div>

              {/* Actions */}
              <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-3 md:opacity-0 group-hover:md:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="p-3 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full dark:hover:bg-stone-800 transition-all"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(product.id)}
                  className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full dark:hover:bg-red-900/30 transition-all"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Edit/Create Modal */}
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar Eliminación">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <p className="text-stone-600 dark:text-stone-300 mb-8 font-serif leading-relaxed">
            ¿Estás seguro de que deseas eliminar esta pieza de lujo?<br />Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>No, Conservar</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Sí, Eliminar</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};