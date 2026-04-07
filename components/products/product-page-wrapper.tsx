'use client';

import { useStore } from '@/context/StoreContext';
import { ProductDetail } from './product-detail';
import { Product } from '@/types';

interface ProductPageWrapperProps {
    product: Product;
}

export const ProductPageWrapper: React.FC<ProductPageWrapperProps> = ({ product }) => {
    const { currency } = useStore();

    return (
        <ProductDetail
            product={product}
            currency={currency}
        />
    );
};
