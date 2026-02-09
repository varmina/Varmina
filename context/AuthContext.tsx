import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
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
    const lastCheckedUserId = useRef<string | null>(null);

    const checkAdminStatus = async (userId: string, isInitial = false) => {
        // Optimization: skip if check is already done for this user and we are admin
        if (userId === lastCheckedUserId.current && isAdmin && !isInitial) return true;

        try {
            const isAdm = await authService.isAdmin(userId);
            setIsAdmin(isAdm);
            lastCheckedUserId.current = userId;
            return isAdm;
        } catch (err) {
            console.warn('[Auth] Could not verify admin status (network error). Preserving current state.', err);
            // If we already verified this user as admin before, we trust that for now
            if (userId === lastCheckedUserId.current) {
                return isAdmin;
            }
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
                    await checkAdminStatus(currentSession.user.id, true);
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

            if (newSession?.user) {
                // If it's a sign-out followed by sign-in (new user), reset the cache
                if (event === 'SIGNED_IN') {
                    lastCheckedUserId.current = null;
                }
                await checkAdminStatus(newSession.user.id);
            } else {
                setIsAdmin(false);
                lastCheckedUserId.current = null;
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
            lastCheckedUserId.current = null;
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
