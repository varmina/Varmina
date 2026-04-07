import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Product } from '@/types';

// Module-level in-memory cache (survives component re-mounts, not page refreshes)
let memoryCache: { products: Product[]; timestamp: number } | null = null;
const MEMORY_CACHE_TTL = 60000; // 60s in-memory
const SESSION_CACHE_KEY = 'varmina_public_products';
const SESSION_CACHE_TTL = 300000; // 5 minutes for sessionStorage

function getSessionCache(): Product[] | null {
    try {
        const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.timestamp > SESSION_CACHE_TTL) {
            sessionStorage.removeItem(SESSION_CACHE_KEY);
            return null;
        }
        return parsed.products;
    } catch {
        return null;
    }
}

function setSessionCache(products: Product[]) {
    try {
        sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({ products, timestamp: Date.now() }));
    } catch {
        // sessionStorage full or unavailable — ignore
    }
}

export const usePublicProducts = () => {
    const [products, setProducts] = useState<Product[]>(() => {
        // Initialize from memory cache immediately (no loading flash)
        if (memoryCache && Date.now() - memoryCache.timestamp < MEMORY_CACHE_TTL) {
            return memoryCache.products;
        }
        return [];
    });
    const [loading, setLoading] = useState(() => {
        return !(memoryCache && Date.now() - memoryCache.timestamp < MEMORY_CACHE_TTL);
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const supabase = createClient();

        // If memory cache is valid, skip fetch entirely
        if (memoryCache && Date.now() - memoryCache.timestamp < MEMORY_CACHE_TTL) {
            return;
        }

        // Check sessionStorage as a secondary cache
        const sessionCached = getSessionCache();
        if (sessionCached && sessionCached.length > 0) {
            setProducts(sessionCached);
            setLoading(false);
            memoryCache = { products: sessionCached, timestamp: Date.now() };
            // Background refresh (stale-while-revalidate)
            fetchFresh(false);
            return;
        }

        // No cache at all — full fetch
        fetchFresh(true);

        async function fetchFresh(showLoading: boolean) {
            if (showLoading && mounted) setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!mounted) return;
                if (error) throw error;

                const parsed = (data as Record<string, unknown>[])?.map(p => ({
                    ...p,
                    price: Number(p.price),
                    stock: Number(p.stock)
                })) as Product[] || [];

                setProducts(parsed);
                memoryCache = { products: parsed, timestamp: Date.now() };
                setSessionCache(parsed);
            } catch (err: unknown) {
                console.error('Public fetch error:', err);
                if (mounted) setError(err instanceof Error ? err.message : String(err));
            } finally {
                if (mounted) setLoading(false);
            }
        }

        return () => {
            mounted = false;
        };
    }, []);

    return { products, loading, error };
};
