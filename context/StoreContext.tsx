import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Product, ToastMessage } from '../types';
import { supabaseProductService } from '../services/supabaseProductService';
import { settingsService, BrandSettings } from '../services/settingsService';
import { createClient } from '../utils/supabase/client';

const supabase = createClient();

interface StoreContextType {
    products: Product[];
    loading: boolean;
    attributes: any[];
    currency: 'CLP' | 'USD';
    toggleCurrency: () => void;
    refreshProducts: (force?: boolean, silent?: boolean) => Promise<void>;
    refreshAttributes: () => Promise<void>;
    toasts: ToastMessage[];
    addToast: (type: ToastMessage['type'], message: string) => void;
    removeToast: (id: string) => void;
    settings: BrandSettings | null;
    refreshSettings: () => Promise<void>;
    activeAdminTab: 'inventory' | 'analytics' | 'finance' | 'settings' | 'erp' | 'orders';
    setActiveAdminTab: (tab: 'inventory' | 'analytics' | 'finance' | 'settings' | 'erp' | 'orders') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Core Timeout Helper
async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    let timeoutId: any;
    const timeoutPromise = new Promise<T>((resolve) => {
        timeoutId = setTimeout(() => resolve(fallback), ms);
    });
    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        clearTimeout(timeoutId);
    }
}

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [attributes, setAttributes] = useState<any[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [currency, setCurrency] = useState<'CLP' | 'USD'>('CLP');
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [settings, setSettings] = useState<BrandSettings | null>(null);
    const [activeAdminTab, setActiveAdminTab] = useState<'inventory' | 'analytics' | 'finance' | 'settings' | 'erp' | 'orders'>('inventory');

    const lastRefreshRef = useRef(0);

    // UI Helpers
    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((type: ToastMessage['type'], message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => removeToast(id), 4000);
    }, [removeToast]);

    const toggleCurrency = useCallback(() => {
        setCurrency(prev => {
            const next = prev === 'CLP' ? 'USD' : 'CLP';
            addToast('info', `Moneda cambiada a ${next}`);
            return next;
        });
    }, [addToast]);

    // Data Fetching
    const refreshSettings = useCallback(async () => {
        try {
            const data = await withTimeout(settingsService.getSettings(), 5000, null);
            if (data) setSettings(data);
        } catch (e) {
            console.error('Settings Fetch Fail:', e);
        }
    }, []);

    const refreshAttributes = useCallback(async () => {
        try {
            const { data } = await supabase.from('product_attributes').select('*').order('name');
            if (data) setAttributes(data);
        } catch (e) {
            console.error('Attributes Fetch Fail:', e);
        }
    }, []);

    const refreshProducts = useCallback(async (force = false, silent = false) => {
        if (!silent) setDataLoading(true);
        try {
            const data = await withTimeout(supabaseProductService.getAll(), 15000, []);
            setProducts(data);
            lastRefreshRef.current = Date.now();
        } catch (e) {
            console.error('Products Fetch Fail:', e);
            if (!silent) addToast('error', 'Error al cargar productos');
        } finally {
            if (!silent) setDataLoading(false);
        }
    }, [addToast]);

    // REALTIME SUBSCRIPTIONS
    useEffect(() => {
        const productSub = supabase
            .channel('public:products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
                refreshProducts(true, true);
            })
            .subscribe();

        const attrSub = supabase
            .channel('public:product_attributes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'product_attributes' }, () => {
                refreshAttributes();
            })
            .subscribe();

        const settingsSub = supabase
            .channel('public:brand_settings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'brand_settings' }, () => {
                refreshSettings();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(productSub);
            supabase.removeChannel(attrSub);
            supabase.removeChannel(settingsSub);
        };
    }, [refreshProducts, refreshAttributes, refreshSettings]);

    // Initial Data Load
    useEffect(() => {
        refreshSettings();
        refreshProducts();
        refreshAttributes();
    }, [refreshSettings, refreshProducts, refreshAttributes]);

    // Dynamic Favicon
    useEffect(() => {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = "/assets/no bg png.png";
    }, [settings]);

    return (
        <StoreContext.Provider value={{
            products,
            loading: dataLoading,
            attributes,
            currency, toggleCurrency,
            refreshProducts,
            refreshAttributes,
            toasts, addToast, removeToast,
            settings, refreshSettings,
            activeAdminTab, setActiveAdminTab
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore error');
    return context;
};
