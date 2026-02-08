import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ToastMessage } from '../types';
import { supabaseProductService } from '../services/supabaseProductService';
import { authService } from '../services/authService';
import { User } from '@supabase/supabase-js';

interface StoreContextType {
  products: Product[];
  loading: boolean;
  currency: 'CLP' | 'USD';
  toggleCurrency: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  refreshProducts: () => Promise<void>;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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

  // Consolidated Initialization
  useEffect(() => {
    const isAdminEmail = (email?: string) => email === 'varminamail@gmail.com';

    const initialize = async () => {
      setLoading(true);
      try {
        // Run both in parallel to reduce load time
        const [currentUser] = await Promise.all([
          authService.getCurrentUser(),
          refreshProducts()
        ]);

        setUser(currentUser);
        setIsAuthenticated(!!currentUser && isAdminEmail(currentUser.email));
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
      const isAuthorized = !!currentUser && isAdminEmail(currentUser.email);

      setUser(currentUser);
      setIsAuthenticated(isAuthorized);

      if (event === 'SIGNED_IN') {
        if (isAuthorized) {
          addToast('success', 'Bienvenido, Admin');
        } else {
          addToast('error', 'Acceso denegado: Solo administradores autorizados');
          await authService.signOut();
        }
        // No need to set loading here if we are already logged in via login function, 
        // but if it's a fresh session detection, we might want to refresh.
        // To be safe, let's only refresh if we aren't already loading.
      } else if (event === 'SIGNED_OUT') {
        addToast('info', 'Sesión cerrada');
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

  const refreshProducts = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setLoading(false);
      addToast('error', 'Error de configuración: Faltan variables de entorno.');
      return;
    }

    setLoading(true);
    try {
      const data = await supabaseProductService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      addToast('error', 'Error al cargar los productos');
    } finally {
      setLoading(false);
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
      logout
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
