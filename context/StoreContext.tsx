import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ToastMessage } from '../types';
import { supabaseProductService } from '../services/supabaseProductService';
import { authService } from '../services/authService';
import { User } from '@supabase/supabase-js';
import { settingsService, BrandSettings } from '../services/settingsService';

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
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  settings: BrandSettings | null;
  refreshSettings: () => Promise<void>;
  activeAdminTab: 'inventory' | 'brand';
  setActiveAdminTab: (tab: 'inventory' | 'brand') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<'CLP' | 'USD'>('CLP');
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<BrandSettings | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'inventory' | 'brand'>('inventory');
  const [lastRefresh, setLastRefresh] = useState(0);

  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshProducts = async (force = false, silent = false) => {
    const now = Date.now();

    // SIMPLE CACHE: Don't fetch if fetched in last 2 seconds unless forced
    if (!force && now - lastRefresh < 2000) return;

    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);

    try {
      const data = await supabaseProductService.getAll();
      setProducts(data);
      setLastRefresh(now);
    } catch (error) {
      console.error('Error loading products:', error);
      addToast('error', 'Error al conectar con la base de datos');
    } finally {
      // Safety net: always ensure loading is false
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Consolidated Initialization
  useEffect(() => {
    const initialize = async () => {
      console.log('App: Initializing...');
      setLoading(true);
      try {
        // Fetch user first to set auth state
        const currentUser = await authService.getCurrentUser().catch(() => null);
        setUser(currentUser);

        if (currentUser) {
          const isAuthorized = await authService.isAdmin(currentUser.id).catch(() => false);
          setIsAuthenticated(isAuthorized);
        } else {
          setIsAuthenticated(false);
        }

        // Fetch remaining data
        await Promise.all([
          refreshSettings().catch(() => null),
          refreshProducts(true, true).catch(() => null)
        ]);
      } catch (error) {
        console.error('App: Initialization failed', error);
      } finally {
        console.log('App: Initialization finished');
        setLoading(false);
      }
    };

    initialize();

    // Listen to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const isAuthorized = await authService.isAdmin(currentUser.id).catch(() => false);
        setIsAuthenticated(isAuthorized);

        if (event === 'SIGNED_IN' && !isAuthorized) {
          addToast('error', 'Acceso denegado: Solo administradores autorizados');
          await authService.signOut();
        }
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Dark Mode Side Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleCurrency = () => setCurrency(prev => prev === 'CLP' ? 'USD' : 'CLP');
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const login = async (email: string, password: string) => {
    const { error } = await authService.signIn(email, password);
    if (error) {
      addToast('error', error.message || 'Error al iniciar sesión');
      throw error;
    }
  };

  const logout = async () => {
    await authService.signOut();
  };

  return (
    <StoreContext.Provider value={{
      products,
      loading,
      currency,
      toggleCurrency,
      darkMode,
      toggleDarkMode,
      refreshProducts,
      toasts,
      addToast,
      removeToast,
      isAuthenticated,
      user,
      login,
      logout,
      settings,
      refreshSettings,
      activeAdminTab,
      setActiveAdminTab
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
