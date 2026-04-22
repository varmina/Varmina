import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export interface FooterLinkGroup {
    group: string;
    links: { label: string; url: string }[];
}

export interface TrustBadge {
    icon: string;
    text: string;
}

export interface BrandSettings {
    id: string;
    brand_name: string;
    whatsapp_number: string;
    whatsapp_template: string;
    instagram_url: string;
    tiktok_url: string;
    site_title: string;
    site_description: string;
    hero_title: string;
    hero_subtitle: string;
    hero_image_url: string;
    primary_color: string;
    logo_url: string;
    usd_exchange_rate: number;
    maintenance_mode: boolean;
    announcement_text: string;
    announcement_color: string;
    contact_email: string;
    google_analytics_id: string;
    facebook_url: string;
    // New storefront fields
    footer_about_text: string;
    footer_links: FooterLinkGroup[];
    trust_badges: TrustBadge[];
    free_shipping_threshold: number;
    show_stock_urgency: boolean;
    stock_urgency_threshold: number;
    product_cta_text: string;
    whatsapp_product_template: string;
    show_newsletter: boolean;
    newsletter_title: string;
    newsletter_subtitle: string;
    updated_at: string;
}

export const settingsService = {
    getSettings: async (): Promise<BrandSettings | null> => {
        const { data, error } = await supabase
            .from('brand_settings')
            .select('*')
            .eq('id', 'current')
            .single();

        if (error) {
            console.error('Error fetching settings:', error);
            return null;
        }
        return data;
    },

    updateSettings: async (updates: Partial<BrandSettings>): Promise<void> => {
        const { error } = await (supabase.from('brand_settings') as any)
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', 'current');

        if (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }
};
