import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductPageWrapper } from "@/components/products/product-page-wrapper";
import { ProductStatus } from "@/types";

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
            title: "Producto no encontrado | Varmina",
        };
    }

    return {
        title: `${product.name} | Varmina`,
        description: product.description?.slice(0, 160) || `Descubre ${product.name} en Varmina. Joyería de lujo con diseños exclusivos.`,
        openGraph: {
            title: `${product.name} | Varmina`,
            description: product.description?.slice(0, 160) || `Descubre ${product.name} en Varmina.`,
            images: product.images && product.images.length > 0 ? [product.images[0]] : [],
            type: 'website',
        },
    };
}

// Generate JSON-LD structured data for SEO
function generateProductJsonLd(product: any) {
    const availability = product.status === ProductStatus.SOLD_OUT
        ? 'https://schema.org/OutOfStock'
        : product.status === ProductStatus.MADE_TO_ORDER
            ? 'https://schema.org/PreOrder'
            : 'https://schema.org/InStock';

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description || '',
        image: product.images || [],
        category: product.category || 'Joyería',
        brand: {
            '@type': 'Brand',
            name: 'Varmina',
        },
        offers: {
            '@type': 'Offer',
            url: `https://varmina.cl/product/${product.id}`,
            priceCurrency: 'CLP',
            price: product.price,
            availability,
            itemCondition: 'https://schema.org/NewCondition',
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    const jsonLd = generateProductJsonLd(product);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductPageWrapper product={product} />
        </>
    );
}
