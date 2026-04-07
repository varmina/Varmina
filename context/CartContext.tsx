/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Product } from '@/types';

export interface CartItem {
    product: Product;
    quantity: number;
    selectedVariant?: string; // ID or Name of variant
}

interface CartContextType {
    items: CartItem[];
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    addItem: (product: Product, quantity?: number, variant?: string) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number; // Optional, useful for estimated value
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Persistence logic can be added here (localStorage)
    useEffect(() => {
        const stored = localStorage.getItem('varmina_cart');
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('varmina_cart', JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((product: Product, quantity = 1, variant?: string) => {
        setItems(prev => {
            const existing = prev.find(i => i.product.id === product.id && i.selectedVariant === variant);
            if (existing) {
                return prev.map(i =>
                    (i.product.id === product.id && i.selectedVariant === variant)
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            }
            return [...prev, { product, quantity, selectedVariant: variant }];
        });
        setIsOpen(true); // Auto open on add
    }, []);

    const removeItem = useCallback((productId: string) => {
        setItems(prev => prev.filter(i => i.product.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(productId);
            return;
        }
        setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
    }, [removeItem]);

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
    const totalPrice = useMemo(() => items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0), [items]);

    const contextValue = useMemo(() => ({
        items, isOpen, setIsOpen, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice
    }), [items, isOpen, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
