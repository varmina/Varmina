'use client';

import { AuthProvider } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { CartProvider } from '@/context/CartContext';

import { ToastContainer } from '@/components/ui/toast-container';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <StoreProvider>
                <ThemeProvider>
                    <CartProvider>
                        {children}
                        <ToastContainer />
                    </CartProvider>
                </ThemeProvider>
            </StoreProvider>
        </AuthProvider>
    );
}
