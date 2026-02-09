import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useAdmin() {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const checkAdmin = async () => {
            if (!user) {
                if (mounted) {
                    setIsAdmin(false);
                    setLoading(false);
                }
                return;
            }

            // If we have a user, we must check if they are admin
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (mounted) {
                    if (error || !data || (data as any).role !== 'admin') {
                        setIsAdmin(false);
                    } else {
                        setIsAdmin(true);
                    }
                }
            } catch (err) {
                console.error("Admin check failed", err);
                if (mounted) setIsAdmin(false);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        checkAdmin();

        return () => {
            mounted = false;
        };
    }, [user]); // Re-run when user changes

    return { isAdmin, loading };
}
