import { useStore } from '@/context/StoreContext';

export function useInventory() {
    const { products, loading, refreshProducts, addToast } = useStore();

    const refreshInventory = async () => {
        try {
            await refreshProducts(true);
        } catch (error) {
            console.error("Failed to load inventory:", error);
            addToast('error', 'Error al cargar inventario');
        }
    };

    return { products, loading, refreshInventory };
}
