'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { pageLayoutService, PageSection } from '@/services/pageLayoutService';

// Lazy load both components
const SectionRenderer = dynamic(() => import('@/components/public/section-renderer').then(m => ({ default: m.SectionRenderer })), {
    loading: () => (
        <div className="w-full min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
    ),
});

const PublicCatalog = dynamic(() => import('@/components/public/public-catalog').then(m => ({ default: m.PublicCatalog })), {
    loading: () => (
        <div className="w-full min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
    ),
});

// Module-level cache for sections (survives component re-mounts)
let sectionsCache: { data: PageSection[]; timestamp: number } | null = null;
const SECTIONS_CACHE_TTL = 120000; // 2 minutes

export default function Page() {
    const [sections, setSections] = useState<PageSection[] | null>(() => {
        // Initialize from cache instantly
        if (sectionsCache && Date.now() - sectionsCache.timestamp < SECTIONS_CACHE_TTL) {
            return sectionsCache.data;
        }
        return null;
    });

    useEffect(() => {
        // If cache is fresh, skip fetch
        if (sectionsCache && Date.now() - sectionsCache.timestamp < SECTIONS_CACHE_TTL) {
            return;
        }

        const fetch = async () => {
            try {
                const data = await pageLayoutService.getSections('home');
                setSections(data);
                sectionsCache = { data, timestamp: Date.now() };
            } catch {
                setSections([]);
            }
        };
        fetch();
    }, []);

    // Loading state
    if (sections === null) {
        return (
            <div className="w-full min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Section-based rendering — pass sections to avoid double fetch
    if (sections.length > 0) {
        return <SectionRenderer prefetchedSections={sections} />;
    }

    // Fallback to original catalog
    return <PublicCatalog />;
}
