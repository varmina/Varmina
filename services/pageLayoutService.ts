import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export interface PageSection {
    id: string;
    page_slug: string;
    section_type: 'hero' | 'catalog' | 'featured' | 'categories' | 'collections' | 'text' | 'image' | 'banner' | 'divider';
    position: number;
    config: Record<string, any>;
    is_visible: boolean;
    created_at: string;
    updated_at: string;
}

// Default configs for each section type
export const SECTION_DEFAULTS: Record<PageSection['section_type'], { label: string; icon: string; config: Record<string, any> }> = {
    hero: {
        label: 'Hero Banner',
        icon: '🖼',
        config: { title: '', subtitle: '', image_url: '', cta_text: '', cta_link: '/' },
    },
    catalog: {
        label: 'Catálogo de Productos',
        icon: '🛍',
        config: { columns: 4, show_filters: true, show_search: true, max_items: 0 },
    },
    featured: {
        label: 'Colección Destacada',
        icon: '⭐',
        config: { collection_name: '', max_items: 6, title: 'Destacados' },
    },
    categories: {
        label: 'Tarjetas de Categorías',
        icon: '🏷',
        config: { title: 'Comprar por Categoría', subtitle: '', columns: 3, show_product_count: true },
    },
    collections: {
        label: 'Tarjetas de Colecciones',
        icon: '💎',
        config: { title: 'Nuestras Colecciones', subtitle: '', columns: 2, max_items: 0, show_product_count: true },
    },
    text: {
        label: 'Bloque de Texto',
        icon: '📝',
        config: { title: '', body: '', alignment: 'center' },
    },
    image: {
        label: 'Imagen',
        icon: '🖼',
        config: { image_url: '', alt_text: '', full_width: true },
    },
    banner: {
        label: 'Banner / CTA',
        icon: '📢',
        config: { text: '', bg_color: '#1c1917', btn_text: '', btn_link: '/' },
    },
    divider: {
        label: 'Separador',
        icon: '➖',
        config: { style: 'line' },
    },
};

export const pageLayoutService = {
    /** Get visible sections for public rendering */
    getSections: async (pageSlug = 'home'): Promise<PageSection[]> => {
        const { data, error } = await supabase
            .from('page_sections')
            .select('*')
            .eq('page_slug', pageSlug)
            .eq('is_visible', true)
            .order('position', { ascending: true });

        if (error) {
            console.error('Error fetching sections:', error);
            return [];
        }
        return data || [];
    },

    /** Get ALL sections for admin (includes hidden) */
    getAllSections: async (pageSlug = 'home'): Promise<PageSection[]> => {
        const { data, error } = await supabase
            .from('page_sections')
            .select('*')
            .eq('page_slug', pageSlug)
            .order('position', { ascending: true });

        if (error) {
            console.error('Error fetching all sections:', error);
            return [];
        }
        return data || [];
    },

    /** Create a new section */
    createSection: async (section: Pick<PageSection, 'page_slug' | 'section_type' | 'position' | 'config'>): Promise<PageSection | null> => {
        const { data, error } = await supabase
            .from('page_sections')
            .insert({
                ...section,
                is_visible: true,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating section:', error);
            throw error;
        }
        return data;
    },

    /** Update a section's config, visibility, or position */
    updateSection: async (id: string, updates: Partial<Pick<PageSection, 'config' | 'is_visible' | 'position'>>): Promise<void> => {
        const { error } = await supabase
            .from('page_sections')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Error updating section:', error);
            throw error;
        }
    },

    /** Delete a section */
    deleteSection: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('page_sections')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting section:', error);
            throw error;
        }
    },

    /** Batch reorder sections by updating positions */
    reorderSections: async (orderedIds: string[]): Promise<void> => {
        // Update each section's position based on its index in the array
        const updates = orderedIds.map((id, index) =>
            supabase
                .from('page_sections')
                .update({ position: index, updated_at: new Date().toISOString() })
                .eq('id', id)
        );

        const results = await Promise.all(updates);
        const failed = results.find(r => r.error);
        if (failed?.error) {
            console.error('Error reordering sections:', failed.error);
            throw failed.error;
        }
    },
};
