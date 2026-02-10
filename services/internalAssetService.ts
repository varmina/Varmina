import { supabase } from '../lib/supabase';
import { InternalAsset } from '../types';

export interface CreateAssetInput {
    name: string;
    category?: string;
    stock: number;
    min_stock?: number;
    unit_cost?: number;
    location?: string;
    description?: string;
    images?: string[];
}

export const internalAssetService = {
    getAll: async (): Promise<InternalAsset[]> => {
        const { data, error } = await (supabase as any)
            .from('internal_assets')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching internal assets:', error);
            throw new Error('Error al cargar activos internos.');
        }

        return (data as InternalAsset[]) || [];
    },

    getById: async (id: string): Promise<InternalAsset | null> => {
        const { data, error } = await (supabase as any)
            .from('internal_assets')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching asset:', error);
            return null;
        }

        return data as InternalAsset;
    },

    create: async (input: CreateAssetInput): Promise<InternalAsset> => {
        const { data, error } = await (supabase as any)
            .from('internal_assets')
            .insert(input as any)
            .select()
            .single();

        if (error) {
            console.error('Error creating asset:', error);
            throw new Error('Error al crear el activo.');
        }

        return data as InternalAsset;
    },

    update: async (id: string, updates: Partial<CreateAssetInput>): Promise<InternalAsset> => {
        const { data, error } = await (supabase as any)
            .from('internal_assets')
            .update(updates as any)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating asset:', error);
            throw new Error('Error al actualizar el activo.');
        }

        return data as InternalAsset;
    },

    delete: async (id: string): Promise<void> => {
        const { error } = await (supabase as any)
            .from('internal_assets')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting asset:', error);
            throw new Error('Error al eliminar el activo.');
        }
    }
};
