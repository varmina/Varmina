export enum ProductStatus {
  IN_STOCK = 'Disponible',
  MADE_TO_ORDER = 'Por Encargo',
  SOLD_OUT = 'Agotado',
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Oro 18k", "Plata 950"
  price: number;
  images?: string[]; // Images specifically for this variant
  isPrimary?: boolean; // Whether this variant is shown by default
}

// ... existing code ...
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  status: ProductStatus;
  category: string | null;
  collection: string | null;
  badge: string | null;
  variants: ProductVariant[];
  whatsapp_clicks: number;
  created_at: string;
  updated_at: string;
  stock?: number; // Optional for now to avoid breaking existing code immediately, but ideally required
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
  // ... existing code ...
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

export type SortOption = 'newest' | 'price_asc' | 'price_desc';

export interface FilterState {
  search: string;
  minPrice: number;
  maxPrice: number;
  status: ProductStatus | 'All';
  sort: SortOption;
}