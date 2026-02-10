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
        <form onSubmit={handleSubmit} className="h-full flex flex-col relative bg-stone-50/50 dark:bg-black/20">
            {/* Header / Actions - Sticky Top */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-stone-900 dark:text-white">
                    {initialData ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <div className="flex items-center gap-3">
                    <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                        Descartar
                    </Button>
                    <Button type="submit" isLoading={isSubmitting} size="sm" className="bg-stone-900 text-white hover:bg-stone-800 dark:bg-white dark:text-stone-900 hover:dark:bg-stone-200">
                        Guardar
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-20 md:px-8 max-w-7xl mx-auto w-full hide-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN - Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Card 1: Basic Info */}
                        <div className="bg-white dark:bg-stone-900 rounded-lg shadow-sm border border-stone-100 dark:border-stone-800 p-6">
                            <div className="space-y-4">
                                <Input
                                    label="Título"
                                    placeholder="Ej: Anillo Solitario Oro Blanco"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    error={errors.name}
                                    className="font-serif text-xl md:text-2xl py-3"
                                />
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-stone-400">Descripción</label>
                                    <textarea
                                        className="w-full bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800 rounded-md p-4 text-stone-900 dark:text-stone-100 font-sans text-sm focus:border-stone-900 dark:focus:border-white focus:outline-none min-h-[160px] transition-all resize-y leading-relaxed"
                                        placeholder="Describe la pieza, materiales y detalles únicos..."
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Media */}
                        <div className="bg-white dark:bg-stone-900 rounded-lg shadow-sm border border-stone-100 dark:border-stone-800 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white">Multimedia</h3>
                                <label className="text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer uppercase tracking-wider">
                                    + Añadir Archivos
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                                </label>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {formData.images?.map((img, idx) => (
                                    <div
                                        key={idx}
                                        draggable
                                        onDragStart={() => handleDragStart(idx)}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDrop(idx)}
                                        className={`group relative aspect-square bg-stone-50 dark:bg-stone-950 rounded-md border border-stone-100 dark:border-stone-800 overflow-hidden cursor-move transition-all ${draggedIdx === idx ? 'opacity-30 ring-2 ring-blue-500' : 'hover:border-stone-300 dark:hover:border-stone-600'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt={`Media ${idx}`} />

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(img, idx)}
                                            className="absolute top-2 right-2 p-1.5 bg-white/90 text-stone-500 hover:text-red-500 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>

                                        {idx === 0 && (
                                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-md rounded-md">
                                                <span className="text-[9px] font-bold text-white uppercase tracking-wider">Principal</span>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <label className={`
                                    relative aspect-square flex flex-col items-center justify-center border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-md cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-all ${isUploading ? 'opacity-50' : ''}
                                `}>
                                    <Upload className="w-6 h-6 text-stone-300 mb-2" />
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                                        {isUploading ? 'Subiendo...' : 'Subir Imagen'}
                                    </span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                                </label>
                            </div>
                            {errors.images && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.images}</p>}
                        </div>

                        {/* Card 3: Pricing */}
                        <div className="bg-white dark:bg-stone-900 rounded-lg shadow-sm border border-stone-100 dark:border-stone-800 p-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white mb-4">Precios</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-stone-400 mb-2">Precio (CLP)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-serif">$</span>
                                        <input
                                            type="number"
                                            className="w-full bg-white dark:bg-transparent border border-stone-200 dark:border-stone-700 rounded-md py-2.5 pl-8 pr-4 text-stone-900 dark:text-white shadow-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all"
                                            placeholder="0.00"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                        />
                                    </div>
                                    {errors.price && <p className="mt-1 text-[10px] text-red-500">{errors.price}</p>}
                                </div>
                                {/* Placeholder for Compare-at price if needed later */}
                            </div>
                        </div>

                        {/* Card 4: Variants */}
                        <div className="bg-white dark:bg-stone-900 rounded-lg shadow-sm border border-stone-100 dark:border-stone-800 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white">Variantes</h3>
                                <button type="button" onClick={addVariant} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider">
                                    + Agregar Opción
                                </button>
                            </div>

                            <div className="space-y-0 divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
                                {formData.variants?.length === 0 ? (
                                    <div className="p-8 text-center bg-stone-50/50 dark:bg-stone-950/30">
                                        <p className="text-sm text-stone-500">Este producto no tiene variantes.</p>
                                    </div>
                                ) : (
                                    formData.variants?.map((v, i) => (
                                        <div key={v.id} className="p-4 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center gap-4">

                                                    {/* Drag Handle (Visual Only for now) */}
                                                    <GripVertical className="w-4 h-4 text-stone-300 cursor-grab active:cursor-grabbing" />

                                                    {/* Variant Name */}
                                                    <div className="flex-1">
                                                        <label className="text-[9px] uppercase tracking-wider text-stone-400 font-bold mb-1 block">Opción / Material</label>
                                                        <input
                                                            type="text"
                                                            value={v.name}
                                                            onChange={e => updateVariant(v.id, 'name', e.target.value)}
                                                            className="w-full bg-transparent border-b border-stone-200 dark:border-stone-700 py-1 text-sm font-medium focus:border-stone-900 outline-none"
                                                            placeholder="Ej: Oro 18k"
                                                        />
                                                    </div>

                                                    {/* Variant Price */}
                                                    <div className="w-32">
                                                        <label className="text-[9px] uppercase tracking-wider text-stone-400 font-bold mb-1 block">Precio</label>
                                                        <input
                                                            type="number"
                                                            value={v.price}
                                                            onChange={e => updateVariant(v.id, 'price', Number(e.target.value))}
                                                            className="w-full bg-transparent border-b border-stone-200 dark:border-stone-700 py-1 text-sm font-medium focus:border-stone-900 outline-none"
                                                        />
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-end gap-2 pb-1">
                                                        <button
                                                            onClick={() => removeVariant(v.id)}
                                                            className="text-stone-400 hover:text-red-500 p-1 rounded-md transition-colors"
                                                            title="Eliminar variante"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Variant Images Expandable Area */}
                                                <div className="pl-8 pt-2">
                                                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-2">Imagen Específica</p>
                                                    <div className="flex gap-2">
                                                        {formData.images?.map((img, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => toggleVariantImage(v.id, img)}
                                                                className={`w-10 h-10 rounded-md border overflow-hidden transition-all ${v.images?.includes(img) ? 'ring-2 ring-blue-500 border-transparent' : 'border-stone-200 opacity-50 hover:opacity-100'}`}
                                                            >
                                                                <img src={img} className="w-full h-full object-cover" />
                                                            </button>
                                                        ))}
                                                        {(!formData.images || formData.images.length === 0) && (
                                                            <span className="text-xs text-stone-400 italic">Sube imágenes arriba para asignar.</span>
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
                    <div className="lg:col-span-1 space-y-6">

                        {/* Card 5: Status */}
                        <div className="bg-white dark:bg-stone-900 rounded-lg shadow-sm border border-stone-100 dark:border-stone-800 p-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white mb-4">Estado</h3>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-3 rounded-md border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer">
                                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Activo</span>
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={formData.status === ProductStatus.IN_STOCK}
                                        onChange={() => setFormData({ ...formData, status: ProductStatus.IN_STOCK })}
                                        className="accent-green-600 w-4 h-4"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-3 rounded-md border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer">
                                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Por Encargo</span>
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={formData.status === ProductStatus.MADE_TO_ORDER}
                                        onChange={() => setFormData({ ...formData, status: ProductStatus.MADE_TO_ORDER })}
                                        className="accent-blue-600 w-4 h-4"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-3 rounded-md border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer">
                                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Archivado</span>
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={formData.status === ProductStatus.SOLD_OUT}
                                        onChange={() => setFormData({ ...formData, status: ProductStatus.SOLD_OUT })}
                                        className="accent-stone-600 w-4 h-4"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Card 6: Organization */}
                        <div className="bg-white dark:bg-stone-900 rounded-lg shadow-sm border border-stone-100 dark:border-stone-800 p-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white mb-4">Organización</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-stone-400 mb-2">Categoría</label>
                                    <select
                                        value={formData.category || ''}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md py-2 px-3 text-sm text-stone-900 dark:text-white focus:border-stone-900 outline-none"
                                    >
                                        <option value="" disabled>Seleccionar...</option>
                                        <option value="Anillos">Anillos</option>
                                        <option value="Collares">Collares</option>
                                        <option value="Aros">Aros</option>
                                        <option value="Pulseras">Pulseras</option>
                                    </select>
                                </div>
                                <Input
                                    label="Colección"
                                    placeholder="Ej: Invierno 2024"
                                    value={formData.collection || ''}
                                    onChange={e => setFormData({ ...formData, collection: e.target.value })}
                                />
                                <Input
                                    label="Etiquetas"
                                    placeholder="Ej: Nuevo, Oferta"
                                    value={formData.badge || ''}
                                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </form>
    );
};
