import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductStatus } from '../../types';
import { Button, Input } from '../UI';
import { supabaseProductService } from '../../services/supabaseProductService';
import { Upload, X, GripVertical, Star, Check } from 'lucide-react';

interface ProductFormProps {
    initialData?: Product;
    onSave: () => void;
    onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSave, onCancel }) => {
    const { addToast } = useStore();
    const [formData, setFormData] = useState<Partial<Product>>(initialData || {
        name: '',
        description: '',
        price: 0,
        status: ProductStatus.IN_STOCK,
        images: [],
        category: '',
        collection: '',
        badge: '',
        variants: []
    });
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = "El nombre es obligatorio";
        if (formData.price === undefined || formData.price < 0) newErrors.price = "Se requiere un precio válido";
        if ((formData.images?.length || 0) === 0) newErrors.images = "Se requiere al menos una imagen";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const addVariant = () => {
        const newVariant = { id: crypto.randomUUID(), name: '', price: formData.price || 0, images: [], isPrimary: false };
        setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), newVariant] }));
    };

    const updateVariant = (id: string, field: string, value: any) => {
        setFormData(prev => {
            let nextVariants = prev.variants?.map(v => {
                if (v.id === id) {
                    const updated = { ...v, [field]: value };
                    return updated;
                }
                // If setting this one to primary, unset others
                if (field === 'isPrimary' && value === true) {
                    return { ...v, isPrimary: false };
                }
                return v;
            });
            return { ...prev, variants: nextVariants };
        });
    };

    const toggleVariantImage = (variantId: string, imageUrl: string) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants?.map(v => {
                if (v.id === variantId) {
                    const images = v.images || [];
                    const nextImages = images.includes(imageUrl)
                        ? images.filter((i: string) => i !== imageUrl)
                        : [...images, imageUrl];
                    return { ...v, images: nextImages };
                }
                return v;
            })
        }));
    };

    const removeVariant = (id: string) => {
        setFormData(prev => ({ ...prev, variants: prev.variants?.filter(v => v.id !== id) }));
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
            };

            if (initialData) {
                await supabaseProductService.update(initialData.id, dataToSave);
                addToast('success', 'Producto actualizado con éxito');
            } else {
                await supabaseProductService.create(dataToSave);
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

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-h-[70vh] overflow-y-auto px-1 hide-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input
                    label="Nombre del Producto"
                    placeholder="Ej: Collar Luz de Luna"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                />
                <Input
                    label="Precio Base"
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    error={errors.price}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                    label="Categoría"
                    placeholder="Anillos, Aros..."
                    value={formData.category || ''}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                />
                <Input
                    label="Colección"
                    placeholder="Invierno 2024..."
                    value={formData.collection || ''}
                    onChange={e => setFormData({ ...formData, collection: e.target.value })}
                />
                <Input
                    label="Etiqueta Especial"
                    placeholder="Más Vendido, Único..."
                    value={formData.badge || ''}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-stone-400 mb-2">Descripción</label>
                <textarea
                    className="w-full bg-transparent border border-stone-200 p-4 text-stone-900 font-sans text-sm focus:border-gold-400 focus:outline-none min-h-[100px] dark:border-stone-700 dark:text-stone-100 transition-colors resize-none leading-relaxed"
                    placeholder="Escribe la historia o detalles técnicos de la pieza..."
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            {/* VARIANTS SECTION */}
            <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-stone-400">Variantes (Metal/Piedra)</label>
                    <button type="button" onClick={addVariant} className="text-[10px] font-bold text-gold-600 uppercase tracking-widest hover:text-gold-700">+ Añadir Variante</button>
                </div>

                <div className="space-y-6">
                    {formData.variants?.map((v) => (
                        <div key={v.id} className="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-sm animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="flex gap-4 items-end mb-4">
                                <div className="flex-1">
                                    <input
                                        placeholder="Nombre variante (Ej: Oro Rosa)"
                                        className="w-full bg-white dark:bg-stone-800 border-none p-3 text-xs focus:ring-1 focus:ring-gold-500 outline-none"
                                        value={v.name}
                                        onChange={e => updateVariant(v.id, 'name', e.target.value)}
                                    />
                                </div>
                                <div className="w-32">
                                    <input
                                        type="number"
                                        placeholder="Precio"
                                        className="w-full bg-white dark:bg-stone-800 border-none p-3 text-xs focus:ring-1 focus:ring-gold-500 outline-none"
                                        value={v.price}
                                        onChange={e => updateVariant(v.id, 'price', Number(e.target.value))}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => updateVariant(v.id, 'isPrimary', !v.isPrimary)}
                                    className={`p-3 rounded-sm transition-all ${v.isPrimary ? 'text-gold-500 bg-gold-100/50' : 'text-stone-300 hover:text-stone-500'}`}
                                    title="Variante Principal"
                                >
                                    <Star className={`w-4 h-4 ${v.isPrimary ? 'fill-current' : ''}`} />
                                </button>
                                <button type="button" onClick={() => removeVariant(v.id)} className="p-3 text-red-400 hover:text-red-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Images for this variant */}
                            <div className="space-y-2">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Imágenes de la Variante:</p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.images?.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => toggleVariantImage(v.id, img)}
                                            className={`relative w-12 h-14 border-2 transition-all rounded-sm overflow-hidden ${v.images?.includes(img) ? 'border-gold-500 scale-105' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                        >
                                            <img src={img} className="w-full h-full object-cover" />
                                            {v.images?.includes(img) && (
                                                <div className="absolute top-0 right-0 bg-gold-500 text-white p-0.5 rounded-bl-sm">
                                                    <Check className="w-2 h-2" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                    {(!formData.images || formData.images.length === 0) && (
                                        <p className="text-[9px] italic text-stone-400">Sube imágenes primero</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {formData.variants?.length === 0 && (
                        <p className="text-[10px] italic text-stone-400">No hay variantes definidas. Se usará el precio base e imágenes generales.</p>
                    )}
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-stone-800">
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

            <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-stone-400">Imágenes</label>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {formData.images?.map((img, idx) => (
                        <div
                            key={idx}
                            draggable
                            onDragStart={() => handleDragStart(idx)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(idx)}
                            className={`relative aspect-square group overflow-hidden bg-stone-50 border border-stone-100 rounded-sm cursor-move transition-transform ${draggedIdx === idx ? 'opacity-30' : ''}`}
                        >
                            <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="upload" />
                            <div className="absolute top-2 left-2 bg-stone-900/60 p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="w-3 h-3 text-white" />
                            </div>
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

            <div className="flex justify-end gap-4 pt-8 border-t border-stone-100 dark:border-stone-800">
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
