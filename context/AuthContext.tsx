import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isAdmin: boolean;
    loading: boolean;
    signIn: typeof authService.signIn;
    signOut: typeof authService.signOut;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAdminStatus = async (userId: string) => {
        try {
            const isAdm = await authService.isAdmin(userId);
            setIsAdmin(isAdm);
            return isAdm;
        } catch (err) {
            console.error('Error checking admin status:', err);
            // Don't flip to false if we had a network error but still have a session? 
            // Actually, safety first for admin routes.
            setIsAdmin(false);
            return false;
        }
    };

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                // Get initial session
                const { data: { session: currentSession } } = await supabase.auth.getSession();

                if (!mounted) return;

                if (currentSession) {
                    setSession(currentSession);
                    setUser(currentSession.user);
                    await checkAdminStatus(currentSession.user.id);
                }
            } catch (error) {
                console.error('Auth init error:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        // Initialize
        initAuth();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (!mounted) return;

            console.log(`[Auth] Event: ${event}`, newSession?.user?.email);

            setSession(newSession);
            setUser(newSession?.user ?? null);

            if (newSession?.user) {
                // Check admin status on sign in, initial session, or if we don't know yet
                // We also check on TOKEN_REFRESHED if we weren't already confirmed as admin
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
                    await checkAdminStatus(newSession.user.id);
                }
            } else {
                setIsAdmin(false);
            }

            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const value = {
        user,
        session,
        isAdmin,
        loading,
        signIn: authService.signIn,
        signOut: async () => {
            const { error } = await authService.signOut();
            setIsAdmin(false);
            setUser(null);
            setSession(null);
            return { error: error as AuthError };
        }
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
