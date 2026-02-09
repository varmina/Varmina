import { supabase } from '../lib/supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthService {
    signIn: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; error: AuthError | null }>;
    signUp: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; error: AuthError | null }>;
    signOut: () => Promise<{ error: AuthError | null }>;
    getCurrentUser: () => Promise<User | null>;
    getCurrentSession: () => Promise<Session | null>;
    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => { data: { subscription: any } };
    isAdmin: (userId: string) => Promise<boolean>;
}

export const authService: AuthService = {
    // Check if user is admin
    isAdmin: async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single() as any;

            if (error) {
                console.error('Error fetching admin profile:', error);
                throw error;
            }
            if (!data) return false;
            return data.role === 'admin';
        } catch (err) {
            console.error('isAdmin check exploded:', err);
            throw err;
        }
    },
    // Sign in with email and password
    signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return {
            user: data.user,
            session: data.session,
            error,
        };
    },

    // Sign up with email and password
    signUp: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        return {
            user: data.user,
            session: data.session,
            error,
        };
    },

    // Sign out
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    // Get current user
    getCurrentUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // Get current session
    getCurrentSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    // Listen to auth state changes
    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
        return supabase.auth.onAuthStateChange(callback);
    },
};
