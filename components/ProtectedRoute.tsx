import React from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { LoadingScreen } from './UI';
import { LoginPage } from '../pages/LoginPage';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAdmin, loading } = useAdmin();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!isAdmin) {
        return <LoginPage />;
    }

    return <>{children}</>;
};
