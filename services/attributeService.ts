import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export type AttributeType = 'collection' | 'category' | 'erp_category';

export interface ProductAttribute {
    id: string;
    type: AttributeType;
    name: string;
    slug: string;
    created_at: string;
}

export const attributeService = {
    // Get all attributes
    getAll: async (): Promise<ProductAttribute[]> => {
        const { data, error } = await supabase
            .from('product_attributes')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching attributes:', error);
            return [];
        }

        return data as ProductAttribute[];
    },

    // Get attributes by type
    getByType: async (type: AttributeType): Promise<ProductAttribute[]> => {
        const { data, error } = await supabase
            .from('product_attributes')
            .select('*')
            .eq('type', type)
            .order('name', { ascending: true });

        if (error) {
            console.error(`Error fetching attributes of type ${type}:`, error);
            return [];
        }

        return data as ProductAttribute[];
    },

    // Create new attribute
    create: async (type: AttributeType, name: string): Promise<ProductAttribute> => {
        if (!name.trim()) throw new Error('El nombre es obligatorio');

        const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');

        const { data, error } = await supabase
            .from('product_attributes')
            .insert({ type, name: name.trim(), slug })
            .select()
            .single();

        if (error) {
            console.error('Error creating attribute:', error);
            throw new Error('Error al crear atributo. Verifica permisos.');
        }

        return data as ProductAttribute;
    },

    // Delete attribute
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('product_attributes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting attribute:', error);
            throw new Error('Error al eliminar atributo.');
        }
    }
};
