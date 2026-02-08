import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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
  activeAdminTab: 'inventory' | 'analytics' | 'settings';
  setActiveAdminTab: (tab: 'inventory' | 'analytics' | 'settings') => void;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<'CLP' | 'USD'>('CLP');
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('varmina_dark_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // No longer optimistic
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<BrandSettings | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'inventory' | 'analytics' | 'settings'>('inventory');

  const lastRefreshRef = useRef(0);
  const isInitializingRef = useRef(false);
  const authCheckedRef = useRef(false);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await withTimeout(settingsService.getSettings(), 4000, null);
      if (data) setSettings(data);
    } catch (e) {
      console.error('Settings Fail:', e);
    }
  }, []);

  const refreshProducts = useCallback(async (force = false, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await withTimeout(supabaseProductService.getAll(), 6000, []);
      setProducts(data);
      lastRefreshRef.current = Date.now();
    } catch (e) {
      console.error('Products Fail:', e);
      if (!silent) addToast('error', 'Error al sincronizar inventario');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [addToast]);

  // Helper to verify admin status strictly
  const verifyAdmin = useCallback(async (userId: string) => {
    try {
      console.log('⚡ [Auth] Verifying admin status for:', userId);
      const isAuthorized = await withTimeout(authService.isAdmin(userId), 15000, false);
      console.log('⚡ [Auth] Admin check result:', isAuthorized);
      setIsAuthenticated(isAuthorized);
      return isAuthorized;
    } catch (e) {
      console.error('Verify Admin Fail:', e);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // SINGLE INITIALIZATION EFFECT
  useEffect(() => {
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;

    const initialize = async () => {
      console.log('⚡ [Auth] App initialization started');
      setLoading(true);

      try {
        // 1. Get session first
        const session = await authService.getCurrentSession();
        const currentUser = session?.user || null;
        setUser(currentUser);

        // 2. Fetch critical app data
        await Promise.all([
          refreshSettings().catch(e => console.error('BG Settings:', e)),
          refreshProducts(true, true).catch(e => console.error('BG Products:', e))
        ]);

        // 3. If logged in, verify admin status strictly before finishing loader
        if (currentUser) {
          await verifyAdmin(currentUser.id);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('⚡ [Auth] Init Error:', err);
      } finally {
        setLoading(false);
        console.log('🏁 [Auth] Initialization finished');
      }
    };

    initialize();

    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      console.log('🔐 [Auth] Event:', event);
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          await verifyAdmin(currentUser.id);
        }
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshSettings, refreshProducts, verifyAdmin]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const toggleCurrency = useCallback(() => setCurrency(prev => prev === 'CLP' ? 'USD' : 'CLP'), []);
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('varmina_dark_mode', String(newVal));
      return newVal;
    });
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Attempting login for:', email);
    const { user: authUser, error } = await authService.signIn(email, password);

    if (error) {
      console.error('Login error:', error.message);
      addToast('error', error.message);
      throw error;
    }

    if (authUser) {
      console.log('Login successful, verifying admin status for:', authUser.id);
      const isAuthorized = await verifyAdmin(authUser.id);

      if (isAuthorized) {
        setUser(authUser);
        setIsAuthenticated(true);
        addToast('success', 'Acceso concedido. Bienvenido.');
      } else {
        addToast('error', 'Su cuenta no tiene permisos de administrador.');
        throw new Error('Not authorized as admin');
      }
    }
  };

  const logout = useCallback(async () => {
    try {
      await authService.signOut();
      setUser(null);
      setIsAuthenticated(false);
      addToast('success', 'Sesión cerrada correctamente');
    } catch (err) {
      console.error('Logout error:', err);
      // Even if signOut fails, let's clear local state
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [addToast]);

  return (
    <StoreContext.Provider value={{
      products, loading, currency, toggleCurrency, darkMode, toggleDarkMode,
      refreshProducts, toasts, addToast, removeToast, isAuthenticated, user,
      login, logout, settings, refreshSettings, activeAdminTab, setActiveAdminTab
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
