import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from './UI';
import { LoginPage } from '../pages/LoginPage';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAdmin, loading: authLoading } = useAuth();

    if (authLoading) {
        return <LoadingScreen />;
    }

    if (!isAdmin) {
        return <LoginPage />;
    }

    return <>{children}</>;
};
