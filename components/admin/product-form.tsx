'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Product, ProductStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabaseProductService } from '@/services/supabaseProductService';
import { Upload, X, GripVertical, Star, Check } from 'lucide-react';
import { compressImage } from '@/utils/imageOptimizer';
import { attributeService } from '@/services/attributeService';

interface ProductFormProps {
    initialData?: Product;
    onSave: () => void;
    onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSave, onCancel }) => {
    const { addToast, attributes } = useStore();
    const [formData, setFormData] = useState<Partial<Product>>(initialData || {
        name: '',
        description: '',
        price: 0,
        status: ProductStatus.IN_STOCK,
        images: [],
        category: '',
        collection: '',
        badge: '',
        variants: [],
        stock: 0
    });
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Dynamic lists from StoreContext
    const categories = attributes.filter(a => a.type === 'category');
    const collections = attributes.filter(a => a.type === 'collection');

    const sessionUploadedImages = React.useRef<string[]>([]);

    const handleCancel = async () => {
        // Cleanup images uploaded in this session but not saved
        if (sessionUploadedImages.current.length > 0) {
            const promises = sessionUploadedImages.current.map(url =>
                supabaseProductService.deleteImage(url).catch(err =>
                    console.error('Error cleaning up orphan image:', url, err)
                )
            );
            await Promise.all(promises);
            sessionUploadedImages.current = [];
        }
        onCancel();
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = "El nombre es obligatorio";
        if (formData.price === undefined || formData.price < 0) newErrors.price = "Se requiere un precio válido";
        if ((formData.images?.length || 0) === 0) newErrors.images = "Se requiere al menos una imagen";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const dataToSave = {
                name: formData.name!,
                description: formData.description,
                price: formData.price!,
                images: formData.images,
                status: formData.status,
                category: formData.category,
                collection: formData.collection,
                badge: formData.badge,
                variants: formData.variants,
                stock: formData.stock,
            };

            if (initialData) {
                await supabaseProductService.update(initialData.id, dataToSave);
                addToast('success', 'Producto actualizado con éxito');
            } else {
                await supabaseProductService.create(dataToSave);
                addToast('success', 'Producto creado con éxito');
            }

            // Clear session tracking as these are now saved/persistent
            sessionUploadedImages.current = [];
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
                // Optimization step
                const optimizationPromises = Array.from(e.target.files).map((file: File) => compressImage(file));
                const optimizedFiles = await Promise.all(optimizationPromises);

                const uploadPromises = optimizedFiles.map((file: File) =>
                    supabaseProductService.uploadImage(file)
                );

                const uploadedUrls = await Promise.all(uploadPromises);

                // Track these uploads for potential cleanup
                sessionUploadedImages.current.push(...uploadedUrls);

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
                // Remove from tracking if it was from this session
                sessionUploadedImages.current = sessionUploadedImages.current.filter(url => url !== imageUrl);
            }
            setFormData(prev => ({
                ...prev,
                images: prev.images?.filter((_, i) => i !== index),
                variants: prev.variants?.map(v => ({
                    ...v,
                    images: v.images?.filter((i: string) => i !== imageUrl)
                }))
            }));
        } catch (error) {
            console.error('Error removing image:', error);
            addToast('error', 'Error al eliminar imagen');
        }
    };

    const handleDragStart = (idx: number) => setDraggedIdx(idx);
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = (idx: number) => {
        if (draggedIdx === null) return;
        const nextImages = [...(formData.images || [])];
        const draggedItem = nextImages[draggedIdx];
        nextImages.splice(draggedIdx, 1);
        nextImages.splice(idx, 0, draggedItem);
        setFormData({ ...formData, images: nextImages });
        setDraggedIdx(null);
    };

    // Helper functions for variants
    const addVariant = () => {
        const newVariant = {
            id: crypto.randomUUID(),
            name: '',
            price: formData.price || 0,
            stock: 0,
            images: [],
            isPrimary: false
        };
        setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), newVariant] }));
    };

    const updateVariant = (id: string, field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants?.map(v => v.id === id ? { ...v, [field]: value } : v)
        }));
    };

    const removeVariant = (id: string) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants?.filter(v => v.id !== id)
        }));
    };

    const toggleVariantImage = (variantId: string, imageUrl: string) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants?.map(v => {
                if (v.id !== variantId) return v;
                const images = v.images || [];
                return {
                    ...v,
                    images: images.includes(imageUrl)
                        ? images.filter(img => img !== imageUrl)
                        : [...images, imageUrl]
                };
            })
        }));
    };

    const setPrimaryVariant = (variantId: string) => {
        setFormData(prev => {
            const variants = prev.variants?.map(v => ({
                ...v,
                isPrimary: v.id === variantId
            })) || [];

            const primaryV = variants.find(v => v.id === variantId);
            let newImages = [...(prev.images || [])];

            // If primary variant has images, move the first one to the front (Logic matching user request for 'Main Variant = Main Picture')
            if (primaryV && primaryV.images && primaryV.images.length > 0) {
                const mainImg = primaryV.images[0];
                // Remove from current position and add to start
                newImages = newImages.filter(img => img !== mainImg);
                newImages.unshift(mainImg);
            }

            return {
                ...prev,
                variants,
                images: newImages
            };
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-stone-50 dark:bg-stone-900 md:bg-transparent overflow-hidden">
            {/* Top Desktop Actions (Visible only on non-mobile or when integrated elsewhere) */}
            <div className="hidden md:flex sticky top-0 z-20 px-8 py-4 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border-b border-stone-100 dark:border-stone-800 items-center justify-end gap-3 shrink-0">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                    className="text-xs uppercase tracking-widest font-bold"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="bg-stone-900 text-white dark:bg-gold-500 dark:text-stone-900 rounded-full px-8 text-xs uppercase tracking-widest font-bold shadow-lg"
                >
                    {initialData ? 'Actualizar' : 'Guardar'}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 md:py-12 max-w-5xl mx-auto w-full hide-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                    {/* LEFT COLUMN - Main Content */}
                    <div className="lg:col-span-2 space-y-6 md:space-y-8">

                        {/* Card 1: Basic Info */}
                        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-stone-100 dark:border-stone-800 p-5 md:p-8">
                            <div className="space-y-6">
                                <Input
                                    label="Título de la Pieza"
                                    placeholder="Ej: Anillo Solitario Oro Blanco"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    error={errors.name}
                                    className="font-serif text-xl md:text-2xl py-3 border-b-2 border-x-0 border-t-0 rounded-none px-0 focus:ring-0 focus:border-gold-500 bg-transparent"
                                />
                                <div className="space-y-2">
                                    <label htmlFor="product-description" className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Descripción</label>
                                    <textarea
                                        id="product-description"
                                        name="description"
                                        className="w-full bg-stone-50 dark:bg-stone-950/30 border border-stone-200 dark:border-stone-800 rounded-lg p-4 text-stone-900 dark:text-stone-100 font-sans text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none min-h-[160px] transition-all resize-y leading-relaxed placeholder:text-stone-300 dark:placeholder:text-stone-700"
                                        placeholder="Describe la pieza, materiales y detalles únicos..."
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Media */}
                        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-stone-100 dark:border-stone-800 p-5 md:p-8">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white mb-1">Galería</h3>
                                    <p className="text-[10px] text-stone-400">Arrastra para reordenar. La primera es la portada.</p>
                                </div>
                                <label className="text-[10px] font-bold text-gold-600 hover:text-gold-700 cursor-pointer uppercase tracking-wider flex items-center gap-1 bg-gold-50 dark:bg-gold-900/10 px-3 py-1.5 rounded-full transition-colors">
                                    <Upload className="w-3 h-3" />
                                    Subir
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                                </label>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {formData.images?.map((img, idx) => (
                                    <div
                                        key={idx}
                                        draggable
                                        onDragStart={() => handleDragStart(idx)}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDrop(idx)}
                                        className={`group relative aspect-square bg-stone-50 dark:bg-stone-950 rounded-lg border border-stone-100 dark:border-stone-800 overflow-hidden cursor-move transition-all shadow-sm hover:shadow-md ${draggedIdx === idx ? 'opacity-30 ring-2 ring-gold-500' : ''}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt={`Media ${idx}`} />

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(img, idx)}
                                            className="absolute top-2 right-2 p-1.5 bg-white text-stone-500 hover:text-red-500 rounded-full shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:scale-110"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>

                                        {idx === 0 && (
                                            <div className="absolute bottom-0 left-0 right-0 py-1.5 bg-stone-900/80 backdrop-blur-sm text-center">
                                                <span className="text-[8px] font-bold text-white uppercase tracking-widest flex items-center justify-center gap-1">
                                                    <Star className="w-2 h-2 text-gold-400 fill-gold-400" /> Portada
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <label className={`
                                    relative aspect-square flex flex-col items-center justify-center border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-all group ${isUploading ? 'opacity-50' : ''}
                                `}>
                                    <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="w-5 h-5 text-stone-400 group-hover:text-gold-500 transition-colors" />
                                    </div>
                                    <span className="text-[9px] font-bold text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 uppercase tracking-wider text-center px-2">
                                        {isUploading ? 'Procesando...' : 'Añadir'}
                                    </span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                                </label>
                            </div>
                            {errors.images && <p className="mt-3 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded-md text-center uppercase tracking-widest">{errors.images}</p>}
                        </div>

                        {/* Card 4: Variants */}
                        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-stone-100 dark:border-stone-800 p-5 md:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white mb-1">Variantes</h3>
                                    <p className="text-[10px] text-stone-400">Opciones como tallas, metales o piedras.</p>
                                </div>
                                <button type="button" onClick={addVariant} className="text-[10px] font-bold text-white bg-stone-900 dark:bg-white dark:text-stone-900 hover:opacity-90 px-4 py-2 rounded-full uppercase tracking-wider transition-all shadow-sm">
                                    + Opción
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.variants?.length === 0 ? (
                                    <div className="py-12 text-center bg-stone-50 dark:bg-stone-950/30 rounded-lg border border-dashed border-stone-200 dark:border-stone-800">
                                        <p className="text-xs text-stone-500 font-medium">Este producto es único (sin variantes).</p>
                                    </div>
                                ) : (
                                    formData.variants?.map((v, i) => (
                                        <div key={v.id} className="p-4 md:p-5 bg-stone-50 dark:bg-stone-950/30 rounded-lg border border-stone-100 dark:border-stone-800 transition-all hover:bg-stone-100/50 dark:hover:bg-stone-800/30">
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-start gap-3 md:gap-4">
                                                    {/* Drag Handle */}
                                                    <GripVertical className="w-5 h-5 text-stone-300 cursor-grab active:cursor-grabbing mt-2" />

                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">Nombre Opción</label>
                                                            <input
                                                                type="text"
                                                                value={v.name}
                                                                onChange={e => updateVariant(v.id, 'name', e.target.value)}
                                                                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md py-2 px-3 text-sm font-medium text-stone-900 dark:text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                                                                placeholder="Ej: Oro 18k / Talla 7"
                                                                autoComplete="off"
                                                            />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">Precio Variante</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
                                                                <input
                                                                    type="number"
                                                                    value={v.price === 0 ? '' : v.price}
                                                                    onChange={e => updateVariant(v.id, 'price', Number(e.target.value) || 0)}
                                                                    onFocus={(e) => e.target.select()}
                                                                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md py-2 pl-6 pr-3 text-sm font-medium text-stone-900 dark:text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                                                                    autoComplete="off"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">Stock Variante</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={(v.stock === 0 || v.stock === undefined) ? '' : v.stock}
                                                                onChange={e => updateVariant(v.id, 'stock', parseInt(e.target.value) || 0)}
                                                                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md py-2 px-3 text-sm font-medium text-stone-900 dark:text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                                                                autoComplete="off"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-2 mt-1">
                                                        <button
                                                            onClick={() => removeVariant(v.id)}
                                                            className="text-stone-400 hover:text-red-500 p-2 hover:bg-white dark:hover:bg-stone-900 rounded-md transition-colors"
                                                            title="Eliminar variante"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setPrimaryVariant(v.id)}
                                                            className={`p-2 rounded-md transition-colors ${v.isPrimary ? 'text-gold-500 bg-gold-50 dark:bg-gold-900/20' : 'text-stone-300 hover:text-gold-500 hover:bg-white dark:hover:bg-stone-900'}`}
                                                            title={v.isPrimary ? "Variante Principal" : "Marcar como Principal"}
                                                        >
                                                            <Star className={`w-4 h-4 ${v.isPrimary ? 'fill-gold-500' : ''}`} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Variant Images Selection */}
                                                <div className="pl-8 md:pl-9 pt-2 border-t border-stone-200/50 dark:border-stone-800/50 mt-2">
                                                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-3">Vincular Imagen</p>
                                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                                        {formData.images?.map((img, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => toggleVariantImage(v.id, img)}
                                                                className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition-all flex-shrink-0 ${v.images?.includes(img) ? 'border-gold-500 ring-2 ring-gold-200 dark:ring-gold-900/30' : 'border-stone-200 dark:border-stone-800 opacity-60 hover:opacity-100 hover:border-stone-300'}`}
                                                            >
                                                                <img src={img} className="w-full h-full object-cover" />
                                                            </button>
                                                        ))}
                                                        {(!formData.images || formData.images.length === 0) && (
                                                            <span className="text-[10px] text-stone-400 italic py-2">Primero sube imágenes a la galería.</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN - Sidebar */}
                    <div className="lg:col-span-1 space-y-6 md:space-y-8">

                        {/* Card 5: Inventory & Status */}
                        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-stone-100 dark:border-stone-800 p-5 md:p-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white mb-6 border-b border-stone-100 dark:border-stone-800 pb-2">Estado y Stock</h3>

                            <div className="mb-8">
                                <div className="space-y-2">
                                    <label htmlFor="product-stock" className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Stock General</label>
                                    <div className="relative">
                                        <input
                                            id="product-stock"
                                            name="stock"
                                            type="number"
                                            min="0"
                                            value={formData.stock === 0 ? '' : formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                            onFocus={(e) => e.target.select()}
                                            className="w-full bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-700 rounded-lg py-3 pl-4 pr-24 text-lg font-bold text-stone-900 dark:text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all placeholder:text-stone-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400 uppercase tracking-wider">UNIDADES</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Disponibilidad</p>
                                {[
                                    { id: ProductStatus.IN_STOCK, label: 'Disponible', color: 'accent-green-600', border: 'hover:border-green-200', bg: 'hover:bg-green-50' },
                                    { id: ProductStatus.MADE_TO_ORDER, label: 'Por Encargo', color: 'accent-blue-600', border: 'hover:border-blue-200', bg: 'hover:bg-blue-50' },
                                    { id: ProductStatus.SOLD_OUT, label: 'Agotado / Archivado', color: 'accent-stone-600', border: 'hover:border-stone-300', bg: 'hover:bg-stone-100' }
                                ].map((option) => (
                                    <label key={option.id} className={`flex items-center justify-between p-3 rounded-lg border border-stone-200 dark:border-stone-800 cursor-pointer transition-all ${option.border} ${option.bg} dark:hover:bg-stone-800/80 ${formData.status === option.id ? 'ring-1 ring-stone-900 dark:ring-white border-transparent' : ''}`}>
                                        <span className="text-sm font-bold text-stone-700 dark:text-stone-300">{option.label}</span>
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={formData.status === option.id}
                                            onChange={() => setFormData({ ...formData, status: option.id })}
                                            className={`${option.color} w-4 h-4 cursor-pointer`}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Card 3: Pricing (Moved here for better flow on desktop, keeps context with stock) */}
                        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-stone-100 dark:border-stone-800 p-5 md:p-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white mb-6 border-b border-stone-100 dark:border-stone-800 pb-2">Precio Base</h3>
                            <div className="space-y-2">
                                <label htmlFor="product-price" className="sr-only">Precio</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-serif text-lg">$</span>
                                    <input
                                        id="product-price"
                                        name="price"
                                        type="number"
                                        className="w-full bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-700 rounded-lg py-3 pl-10 pr-4 text-xl font-bold text-stone-900 dark:text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all placeholder:text-stone-300"
                                        placeholder="0"
                                        value={formData.price === 0 ? '' : formData.price}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                                {errors.price && <p className="mt-2 text-[10px] font-bold text-red-500">{errors.price}</p>}
                            </div>
                        </div>

                        {/* Card 6: Organization */}
                        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-stone-100 dark:border-stone-800 p-5 md:p-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white mb-6 border-b border-stone-100 dark:border-stone-800 pb-2">Organización</h3>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="product-category" className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Categoría</label>
                                    <div className="relative">
                                        <select
                                            id="product-category"
                                            name="category"
                                            value={formData.category || ''}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-700 rounded-lg py-3 px-4 text-sm font-medium text-stone-900 dark:text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                            {categories.length === 0 && <option value="" disabled>Gestiona categorías en Configuración</option>}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="product-collection" className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Colección</label>
                                    <div className="relative">
                                        <select
                                            id="product-collection"
                                            name="collection"
                                            value={formData.collection || ''}
                                            onChange={e => setFormData({ ...formData, collection: e.target.value })}
                                            className="w-full bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-700 rounded-lg py-3 px-4 text-sm font-medium text-stone-900 dark:text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Ninguna</option>
                                            {collections.map(col => (
                                                <option key={col.id} value={col.name}>{col.name}</option>
                                            ))}
                                            {collections.length === 0 && <option value="" disabled>Gestiona colecciones en Configuración</option>}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <Input
                                    label="Etiqueta Visual"
                                    placeholder="Ej: Nuevo, Oferta"
                                    value={formData.badge || ''}
                                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                                    className="bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-700 rounded-lg py-3 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom Actions Bar - Sticky at the bottom of the form */}
            <div className="sticky bottom-0 z-30 w-full bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 p-4 shrink-0 flex gap-3 animate-in slide-in-from-bottom-5 duration-300">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                    className="flex-1 py-4 text-xs font-bold uppercase tracking-widest border border-stone-200 dark:border-stone-800 rounded-xl"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="flex-1 py-4 text-xs font-bold uppercase tracking-widest bg-stone-900 text-white dark:bg-gold-500 dark:text-stone-900 rounded-xl shadow-xl active:scale-95 transition-all"
                >
                    {isSubmitting ? 'Guardando...' : 'Guardar Pieza'}
                </Button>
            </div>
        </form >
    );
};
