'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { usePublicProducts } from '@/hooks/use-public-products';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductStatus } from '@/types';

export const CollectionsList = () => {
    const { attributes } = useStore();
    const { products, loading } = usePublicProducts();

    const collections = useMemo(() => {
        const dbCollections = attributes?.filter(a => a.type === 'collection') || [];
        
        return dbCollections.map(col => {
            // Find products in this collection
            const collectionProducts = products.filter(p => 
                p.collections?.includes(col.name) && p.status !== ProductStatus.SOLD_OUT
            );
            
            // Get the first product's image as the collection cover, if available
            const coverImage = collectionProducts.length > 0 && collectionProducts[0].images.length > 0 
                ? collectionProducts[0].images[0] 
                : null;
                
            return {
                id: col.id,
                name: col.name,
                coverImage,
                itemCount: collectionProducts.length,
            };
        }).filter(col => col.itemCount > 0); // Only show collections that have products
    }, [attributes, products]);

    if (loading) {
        return (
            <div className="w-full min-h-screen pt-24 pb-12 px-4 bg-stone-50 dark:bg-stone-950">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <Skeleton className="h-10 w-64 mx-auto mb-4" />
                        <Skeleton className="h-4 w-40 mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="aspect-[4/5] w-full rounded-none" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen pt-24 md:pt-32 pb-16 px-4 bg-stone-50 dark:bg-stone-950">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 animate-fade-in-up">
                    <p className="text-[10px] font-bold text-gold-600 dark:text-gold-400 uppercase tracking-[0.3em] mb-4">
                        Descubre Nuestras
                    </p>
                    <h1 className="font-serif text-3xl md:text-5xl text-stone-900 dark:text-white uppercase tracking-[0.15em] mb-6">
                        Colecciones
                    </h1>
                    <div className="w-16 h-[1px] bg-gold-500 mx-auto" />
                </div>

                {collections.length === 0 ? (
                    <div className="text-center py-20 text-stone-500 dark:text-stone-400 uppercase tracking-widest text-xs">
                        No hay colecciones disponibles en este momento.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 animate-fade-in">
                        {collections.map(col => (
                            <Link 
                                key={col.id}
                                href={`/collection/${encodeURIComponent(col.name)}`}
                                className="group block relative aspect-[4/5] overflow-hidden bg-stone-200 dark:bg-stone-900"
                            >
                                {col.coverImage ? (
                                    <Image
                                        src={col.coverImage}
                                        alt={col.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-[10s] group-hover:scale-110 ease-linear"
                                        unoptimized={col.coverImage.startsWith('data:')}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-900 text-stone-300 dark:text-stone-700">
                                        <span className="font-serif text-2xl uppercase tracking-widest text-center px-4">
                                            {col.name}
                                        </span>
                                    </div>
                                )}
                                
                                {/* Overlay overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-10 transition-opacity duration-300">
                                    <h2 className="font-serif text-2xl md:text-3xl text-white uppercase tracking-[0.15em] mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        {col.name}
                                    </h2>
                                    <div className="w-12 h-[1px] bg-gold-400/80 mb-4 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 delay-100" />
                                    <p className="text-[10px] text-white/80 uppercase tracking-[0.3em] font-bold transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-150">
                                        {col.itemCount} Pieza{col.itemCount !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
