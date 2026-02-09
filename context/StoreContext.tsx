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
  darkMode: boolean;
  toggleDarkMode: () => void;
  refreshProducts: (force?: boolean, silent?: boolean) => Promise<void>;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;

  // Auth (delegated to AuthContext)
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  settings: BrandSettings | null;
  refreshSettings: () => Promise<void>;
  activeAdminTab: 'inventory' | 'analytics' | 'settings';
  setActiveAdminTab: (tab: 'inventory' | 'analytics' | 'settings') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Core Timeout Helper (kept for data fetching resilience)
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
  // 1. Get Auth State from dedicated Context
  const { user, isAdmin, signIn, signOut, loading: authLoading } = useAuth();

  // 2. Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [currency, setCurrency] = useState<'CLP' | 'USD'>('CLP');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('varmina_dark_mode') === 'true');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [settings, setSettings] = useState<BrandSettings | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'inventory' | 'analytics' | 'settings'>('inventory');

  const lastRefreshRef = useRef(0);

  // 3. UI Helpers
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const toggleCurrency = useCallback(() => setCurrency(prev => prev === 'CLP' ? 'USD' : 'CLP'), []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('varmina_dark_mode', String(newVal));
      if (newVal) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return newVal;
    });
  }, []);

  // Sync dark mode on mount
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  // 4. Data Fetching
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


  // 5. Auth Wrappers
  const login = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      addToast('error', error.message);
      throw error;
    }
    // AuthContext listener will handle state update
    addToast('success', 'Bienvenido');
  };

  const logout = async () => {
    try {
      await signOut();
      addToast('success', 'Sesión cerrada');
    } catch (e) {
      console.error(e);
    }
  };

  // 6. Global Loading State (Data only for public pages)
  const globalLoading = dataLoading && products.length === 0;

  return (
    <StoreContext.Provider value={{
      products,
      loading: globalLoading,
      currency, toggleCurrency,
      darkMode, toggleDarkMode,
      refreshProducts,
      toasts, addToast, removeToast,
      isAuthenticated: !!user,
      isAdmin,
      user,
      login, logout,
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
