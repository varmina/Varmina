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
  refreshProducts: (force?: boolean) => Promise<void>;
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

  // Consolidated Initialization
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const [currentUser] = await Promise.all([
          authService.getCurrentUser(),
          refreshProducts(),
          refreshSettings()
        ]);

        setUser(currentUser);
        if (currentUser) {
          const isAuthorized = await authService.isAdmin(currentUser.id);
          setIsAuthenticated(isAuthorized);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    // Listen to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const isAuthorized = await authService.isAdmin(currentUser.id);
        setIsAuthenticated(isAuthorized);

        if (event === 'SIGNED_IN' && !isAuthorized) {
          addToast('error', 'Acceso denegado: Solo administradores autorizados');
          await authService.signOut();
        }
      } else {
        setIsAuthenticated(false);
        if (event === 'SIGNED_OUT') {
          addToast('info', 'Sesión cerrada');
        }
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

  const [lastRefresh, setLastRefresh] = useState(0);

  const refreshProducts = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastRefresh < 5000) return; // Cache for 5 seconds

    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await supabaseProductService.getAll();
      setProducts(data);
      setLastRefresh(now);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
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

  const toggleCurrency = () => setCurrency(prev => prev === 'CLP' ? 'USD' : 'CLP');
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

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
