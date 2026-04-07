import { PublicCatalog } from '@/components/public/public-catalog';
import { Suspense } from 'react';

export const generateMetadata = async ({ params }: { params: Promise<{ name: string }> }) => {
    const { name } = await params;
    return {
        title: `Categoría ${decodeURIComponent(name)} | Varmina`,
    };
};

export default async function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    
    return (
        <div className="min-h-screen bg-white dark:bg-stone-950">
            <Suspense fallback={
                <div className="w-full min-h-screen flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                </div>
            }>
                <PublicCatalog categoryName={decodeURIComponent(name)} />
            </Suspense>
        </div>
    );
}
