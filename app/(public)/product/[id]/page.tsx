import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductPageWrapper } from "@/components/products/product-page-wrapper";

// Force dynamic rendering for product pages to ensure fresh data
export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
    const supabase = await createClient();
    const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !product) {
        return null;
    }

    // Ensure numeric types
    return {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock)
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return {
            title: "Producto no encontrado | Varmina Joyas",
        };
    }

    return {
        title: product.name,
        description: product.description || `Detalles de ${product.name}`,
        openGraph: {
            title: product.name,
            description: product.description || `Detalles de ${product.name}`,
            images: product.images && product.images.length > 0 ? [product.images[0]] : [],
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center p-4">
            <ProductPageWrapper product={product} />
        </div>
    );
}
