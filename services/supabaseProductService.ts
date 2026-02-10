import { supabase } from '../lib/supabase';
import { Product, ProductStatus } from '../types';

export interface CreateProductInput {
    name: string;
    description?: string | null;
    price: number;
    images?: string[];
    status?: ProductStatus;
    category?: string | null;
    collection?: string | null;
    badge?: string | null;
    variants?: any[];
    stock?: number;
}

export interface UpdateProductInput {
    name?: string;
    description?: string | null;
    price?: number;
    images?: string[];
    status?: ProductStatus;
    category?: string | null;
    collection?: string | null;
    badge?: string | null;
    variants?: any[];
    stock?: number;
}

export const supabaseProductService = {
    // Increment interest analytics
    incrementWhatsappClicks: async (id: string): Promise<void> => {
        const { error } = await (supabase as any).rpc('increment_whatsapp_clicks', { product_id: id });
        if (error) console.error('Error incrementing clicks:', error);
    },
    // Get all products
    getAll: async (): Promise<Product[]> => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            throw new Error('Failed to fetch products. Please try again later.');
        }

        return (data as any as Product[]) || [];
    },

    // Get single product by ID
    getById: async (id: string): Promise<Product | null> => {
        if (!id) return null;

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching product:', error);
            return null;
        }

        return data as any as Product;
    },

    // Create new product
    create: async (input: CreateProductInput): Promise<Product> => {
        // Validation & Sanitization
        if (!input.name || input.name.trim().length === 0) throw new Error('El nombre es obligatorio');
        if (typeof input.price !== 'number' || input.price < 0) throw new Error('El precio debe ser un número positivo');

        const sanitizedData = {
            name: input.name.trim().slice(0, 100),
            description: input.description?.trim().slice(0, 2000) || null,
            price: Math.max(0, input.price),
            images: input.images || [],
            status: input.status || ProductStatus.IN_STOCK,
            category: input.category || null,
            collection: input.collection || null,
            badge: input.badge || null,
            variants: input.variants || [],
            stock: input.stock !== undefined ? Math.max(0, input.stock) : 0,
        };

        const { data, error } = await (supabase as any)
            .from('products')
            .insert(sanitizedData)
            .select()
            .single();

        if (error) {
            console.error('Error creating product:', error);
            throw new Error('No se pudo crear el producto. Verifique su conexión.');
        }

        return data as any as Product;
    },

    // Update existing product
    update: async (id: string, updates: UpdateProductInput): Promise<Product> => {
        if (!id) throw new Error('ID de producto no proporcionado');

        // Validation & Sanitization
        const sanitizedUpdates: any = {};
        if (updates.name) sanitizedUpdates.name = updates.name.trim().slice(0, 100);
        if (updates.description !== undefined) sanitizedUpdates.description = updates.description?.trim().slice(0, 2000) || null;
        if (updates.price !== undefined) sanitizedUpdates.price = Math.max(0, updates.price);
        if (updates.images) sanitizedUpdates.images = updates.images;
        if (updates.status) sanitizedUpdates.status = updates.status;
        if (updates.category !== undefined) sanitizedUpdates.category = updates.category;
        if (updates.collection !== undefined) sanitizedUpdates.collection = updates.collection;
        if (updates.badge !== undefined) sanitizedUpdates.badge = updates.badge;
        if (updates.variants !== undefined) sanitizedUpdates.variants = updates.variants;
        if (updates.stock !== undefined) sanitizedUpdates.stock = Math.max(0, updates.stock);

        const { data, error } = await (supabase as any)
            .from('products')
            .update(sanitizedUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating product:', error);
            throw new Error('No se pudo actualizar el producto.');
        }

        return data as any as Product;
    },

    // Delete product
    delete: async (id: string): Promise<void> => {
        if (!id) return;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting product:', error);
            throw new Error('Error al eliminar el producto.');
        }
    },

    // Bulk Delete
    deleteBulk: async (ids: string[]): Promise<void> => {
        if (!ids.length) return;
        const { error } = await supabase.from('products').delete().in('id', ids);
        if (error) {
            console.error('Error in bulk delete:', error);
            throw new Error('Error al eliminar productos en lote.');
        }
    },

    // Bulk Update Status
    updateStatusBulk: async (ids: string[], status: ProductStatus): Promise<void> => {
        if (!ids.length) return;
        const { error } = await (supabase.from('products') as any).update({ status }).in('id', ids);
        if (error) {
            console.error('Error in bulk status update:', error);
            throw new Error('Error al actualizar productos en lote.');
        }
    },

    // Upload image to Supabase Storage
    uploadImage: async (file: File): Promise<string> => {
        // Strict Validation
        if (!file.type.startsWith('image/')) {
            throw new Error('Solo se permiten archivos de imagen.');
        }

        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_SIZE) {
            throw new Error('La imagen es demasiado grande. Máximo 10MB.');
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw new Error('Error al subir la imagen. Intente de nuevo.');
        }

        // Get public URL
        const { data } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    // Delete image from Supabase Storage
    deleteImage: async (imageUrl: string): Promise<void> => {
        if (!imageUrl || !imageUrl.includes('/product-images/')) return;

        const urlParts = imageUrl.split('/product-images/');
        const filePath = urlParts[1];

        const { error } = await supabase.storage
            .from('product-images')
            .remove([filePath]);

        if (error) {
            console.error('Error deleting image from storage:', error);
        }
    },

    // Bulk Create
    createBulk: async (inputs: CreateProductInput[]): Promise<Product[]> => {
        if (!inputs.length) return [];

        const sanitizedData = inputs.map(input => ({
            name: input.name.trim().slice(0, 100),
            description: input.description?.trim().slice(0, 2000) || null,
            price: Math.max(0, input.price),
            images: input.images || [],
            status: input.status || ProductStatus.IN_STOCK,
            category: input.category || null,
            collection: input.collection || null,
            badge: input.badge || null,
            variants: input.variants || [],
            stock: input.stock !== undefined ? Math.max(0, input.stock) : 0,
        }));

        const { data, error } = await (supabase as any)
            .from('products')
            .insert(sanitizedData)
            .select();

        if (error) {
            console.error('Error in bulk create:', error);
            throw new Error('Error al crear productos en lote.');
        }

        return (data as any as Product[]) || [];
    },

    // Duplicate product
    duplicate: async (id: string): Promise<Product> => {
        const { data: original, error: fetchError } = await (supabase as any)
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !original) throw new Error('No se pudo encontrar el producto original');

        const { id: _, created_at: __, updated_at: ___, ...rest } = original;
        const copyData = {
            ...rest,
            name: `${original.name} (Copia)`,
            whatsapp_clicks: 0
        };

        const { data, error } = await (supabase as any)
            .from('products')
            .insert(copyData)
            .select()
            .single();

        if (error) throw new Error('Error al duplicar el producto');
        return data as any as Product;
    }
};
