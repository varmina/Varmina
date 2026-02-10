import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Product, ToastMessage } from '../types';
import { supabaseProductService } from '../services/supabaseProductService';
import { User } from '@supabase/supabase-js';
import { settingsService, BrandSettings } from '../services/settingsService';
import { useAuth } from './AuthContext';

interface StoreContextType {
  products: Product[];
  loading: boolean;
  currency: 'CLP' | 'USD';
  toggleCurrency: () => void;
  refreshProducts: (force?: boolean, silent?: boolean) => Promise<void>;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
  settings: BrandSettings | null;
  refreshSettings: () => Promise<void>;
  activeAdminTab: 'inventory' | 'analytics' | 'finance' | 'settings';
  setActiveAdminTab: (tab: 'inventory' | 'analytics' | 'finance' | 'settings') => void;
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
  const [dataLoading, setDataLoading] = useState(true);
  const [currency, setCurrency] = useState<'CLP' | 'USD'>('CLP');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [settings, setSettings] = useState<BrandSettings | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'inventory' | 'analytics' | 'finance' | 'settings'>('inventory');

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

  const toggleCurrency = useCallback(() => setCurrency(prev => prev === 'CLP' ? 'USD' : 'CLP'), []);

  // Data Fetching
  const refreshSettings = useCallback(async () => {
    try {
      const data = await withTimeout(settingsService.getSettings(), 5000, null);
      if (data) setSettings(data);
    } catch (e) {
      console.error('Settings Fetch Fail:', e);
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
      if (!silent) addToast('error', 'Error al cargar productos publicos');
    } finally {
      if (!silent) setDataLoading(false);
    }
  }, [addToast]);

  // Initial Data Load
  useEffect(() => {
    refreshSettings();
    refreshProducts();
  }, [refreshSettings, refreshProducts]);

  return (
    <StoreContext.Provider value={{
      products,
      loading: dataLoading,
      currency, toggleCurrency,
      refreshProducts,
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
