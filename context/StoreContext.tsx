import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef, useMemo } from 'react';
import { Product, ToastMessage } from '../types';
import { supabaseProductService } from '../services/supabaseProductService';
import { settingsService, BrandSettings } from '../services/settingsService';
import { createClient } from '../utils/supabase/client';

const supabase = createClient();

// Cache durations
const CACHE_MIN_INTERVAL = 5000;       // Min 5s between fetches
const REALTIME_DEBOUNCE_MS = 2000;     // Debounce realtime events by 2s

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
    activeAdminTab: 'overview' | 'inventory' | 'analytics' | 'finance' | 'settings' | 'erp' | 'orders' | 'designer';
    setActiveAdminTab: (tab: 'overview' | 'inventory' | 'analytics' | 'finance' | 'settings' | 'erp' | 'orders' | 'designer') => void;
    dataVersion: number; // Increments on any realtime data change, helps consumers invalidate their caches
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
    const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'inventory' | 'analytics' | 'finance' | 'settings' | 'erp' | 'orders' | 'designer'>('overview');
    const [dataVersion, setDataVersion] = useState(0);
    const transactionDebounceTimer = useRef<any>(null);

    // Cache & debounce refs
    const lastProductsFetch = useRef(0);
    const lastAttrFetch = useRef(0);
    const lastSettingsFetch = useRef(0);
    const productDebounceTimer = useRef<any>(null);
    const attrDebounceTimer = useRef<any>(null);
    const settingsDebounceTimer = useRef<any>(null);

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

    // Data Fetching with cache guard
    const refreshSettings = useCallback(async () => {
        const now = Date.now();
        if (now - lastSettingsFetch.current < CACHE_MIN_INTERVAL) return;
        lastSettingsFetch.current = now;
        try {
            const data = await withTimeout(settingsService.getSettings(), 5000, null);
            if (data) setSettings(data);
        } catch (e) {
            console.error('Settings Fetch Fail:', e);
        }
    }, []);

    const refreshAttributes = useCallback(async () => {
        const now = Date.now();
        if (now - lastAttrFetch.current < CACHE_MIN_INTERVAL) return;
        lastAttrFetch.current = now;
        try {
            const { data } = await supabase.from('product_attributes').select('*').order('name');
            if (data) setAttributes(data);
        } catch (e) {
            console.error('Attributes Fetch Fail:', e);
        }
    }, []);

    const refreshProducts = useCallback(async (force = false, silent = false) => {
        const now = Date.now();
        if (!force && now - lastProductsFetch.current < CACHE_MIN_INTERVAL) return;
        lastProductsFetch.current = now;

        if (!silent) setDataLoading(true);
        try {
            const data = await withTimeout(supabaseProductService.getAll(), 15000, []);
            setProducts(data);
        } catch (e) {
            console.error('Products Fetch Fail:', e);
            if (!silent) addToast('error', 'Error al cargar productos');
        } finally {
            if (!silent) setDataLoading(false);
        }
    }, [addToast]);

    // Debounced refresh helpers for realtime
    const debouncedRefreshProducts = useCallback(() => {
        if (productDebounceTimer.current) clearTimeout(productDebounceTimer.current);
        productDebounceTimer.current = setTimeout(() => {
            refreshProducts(true, true);
        }, REALTIME_DEBOUNCE_MS);
    }, [refreshProducts]);

    const debouncedRefreshAttributes = useCallback(() => {
        if (attrDebounceTimer.current) clearTimeout(attrDebounceTimer.current);
        attrDebounceTimer.current = setTimeout(() => {
            refreshAttributes();
        }, REALTIME_DEBOUNCE_MS);
    }, [refreshAttributes]);

    const debouncedRefreshSettings = useCallback(() => {
        if (settingsDebounceTimer.current) clearTimeout(settingsDebounceTimer.current);
        settingsDebounceTimer.current = setTimeout(() => {
            refreshSettings();
        }, REALTIME_DEBOUNCE_MS);
    }, [refreshSettings]);

    // Bump data version so consumers know to re-check their caches
    const bumpDataVersion = useCallback(() => {
        setDataVersion(v => v + 1);
    }, []);

    const debouncedBumpVersion = useCallback(() => {
        if (transactionDebounceTimer.current) clearTimeout(transactionDebounceTimer.current);
        transactionDebounceTimer.current = setTimeout(() => {
            bumpDataVersion();
        }, REALTIME_DEBOUNCE_MS);
    }, [bumpDataVersion]);

    // REALTIME SUBSCRIPTIONS (debounced)
    useEffect(() => {
        const productSub = supabase
            .channel('public:products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
                debouncedRefreshProducts();
                bumpDataVersion();
            })
            .subscribe();

        const attrSub = supabase
            .channel('public:product_attributes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'product_attributes' }, () => {
                debouncedRefreshAttributes();
            })
            .subscribe();

        const settingsSub = supabase
            .channel('public:brand_settings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'brand_settings' }, () => {
                debouncedRefreshSettings();
            })
            .subscribe();

        const transactionSub = supabase
            .channel('public:transactions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
                debouncedBumpVersion();
            })
            .subscribe();

        const assetSub = supabase
            .channel('public:internal_assets_global')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'internal_assets' }, () => {
                bumpDataVersion();
            })
            .subscribe();

        return () => {
            if (productDebounceTimer.current) clearTimeout(productDebounceTimer.current);
            if (attrDebounceTimer.current) clearTimeout(attrDebounceTimer.current);
            if (settingsDebounceTimer.current) clearTimeout(settingsDebounceTimer.current);
            if (transactionDebounceTimer.current) clearTimeout(transactionDebounceTimer.current);
            supabase.removeChannel(productSub);
            supabase.removeChannel(attrSub);
            supabase.removeChannel(settingsSub);
            supabase.removeChannel(transactionSub);
            supabase.removeChannel(assetSub);
        };
    }, [debouncedRefreshProducts, debouncedRefreshAttributes, debouncedRefreshSettings, debouncedBumpVersion, bumpDataVersion]);

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
            activeAdminTab, setActiveAdminTab,
            dataVersion
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
