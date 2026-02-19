'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductDetail } from './product-detail';
import { Product } from '@/types';

interface ProductPageWrapperProps {
    product: Product;
}

export const ProductPageWrapper: React.FC<ProductPageWrapperProps> = ({ product }) => {
    const router = useRouter();
    const { currency } = useStore();

    const handleClose = () => {
        // Check if there is history within the app
        if (window.history.length > 1 && document.referrer.includes(window.location.origin)) {
            router.back();
        } else {
            // If opened directly (new tab/window) or from external site, go to home
            router.push('/');
        }
    };

    return (
        <ProductDetail
            product={product}
            currency={currency}
            onClose={handleClose}
        />
    );
};
