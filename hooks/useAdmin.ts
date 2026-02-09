import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const checkAdmin = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    if (mounted) {
                        setIsAdmin(false);
                        setLoading(false);
                    }
                    return;
                }

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
    }, []);

    return { isAdmin, loading };
}
