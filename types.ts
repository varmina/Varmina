export enum ProductStatus {
    IN_STOCK = 'Disponible',
    MADE_TO_ORDER = 'Por Encargo',
    SOLD_OUT = 'Agotado',
}

export interface ProductVariant {
    id: string;
    name: string; // e.g., "Oro 18k", "Plata 950"
    price: number;
    stock: number;
    images?: string[]; // Images specifically for this variant
    isPrimary?: boolean; // Whether this variant is shown by default
    unit_cost?: number; // COGS
    location?: string | null; // Physical location
}

export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    images: string[];
    status: ProductStatus;
    category: string | null;
    collections: string[];
    badge: string | null;
    variants: ProductVariant[];
    whatsapp_clicks: number;
    created_at: string;
    updated_at: string;
    stock?: number;
    unit_cost?: number;
    location?: string | null;
}

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    created_at: string;
}

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

export interface InternalAsset {
    id: string;
    name: string;
    category: string;
    stock: number;
    min_stock: number;
    unit_cost: number;
    location: string | null;
    description: string | null;
    images: string[];
    created_at: string;
    updated_at: string;
}


export interface ProductAttribute {
    id: string;
    type: 'category' | 'collection' | 'asset_category' | 'erp_category';
    name: string;
    slug: string;
    created_at: string;
}
