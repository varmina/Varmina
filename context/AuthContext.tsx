import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: typeof authService.signIn;
    signOut: typeof authService.signOut;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

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

            console.log(`[Auth] Event: ${event} for ${newSession?.user?.email ?? 'no user'}`);

            setSession(newSession);
            setUser(newSession?.user ?? null);
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
        loading,
        signIn: authService.signIn,
        signOut: async () => {
            const { error } = await authService.signOut();
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
