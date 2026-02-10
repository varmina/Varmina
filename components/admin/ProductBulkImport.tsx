import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../UI';
import { supabaseProductService } from '../../services/supabaseProductService';
import { ProductStatus } from '../../types';
import { useStore } from '../../context/StoreContext';
import {
    FileText,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Info,
    Plus,
    Trash2,
    Package
} from 'lucide-react';

interface BulkProductItem {
    id: string;
    name: string;
    price: number;
    category: string;
    stock: number;
    isValid: boolean;
    error?: string;
}

interface ProductBulkImportProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ProductBulkImport: React.FC<ProductBulkImportProps> = ({ isOpen, onClose, onSuccess }) => {
    const { addToast } = useStore();
    const [bulkData, setBulkData] = useState('');
    const [preview, setPreview] = useState<BulkProductItem[]>([]);
    const [isImporting, setIsImporting] = useState(false);

    const categories = ['Anillos', 'Collares', 'Aros', 'Pulseras'];

    useEffect(() => {
        const lines = bulkData.split('\n').filter(line => line.trim() !== '');
        const newPreview = lines.map((line, index) => {
            const parts = line.split(',').map(p => p.trim());
            const name = parts[0] || '';
            const price = parseFloat(parts[1]) || 0;
            const category = parts[2] || 'Anillos';
            const stock = parseInt(parts[3]) || 0;

            const isValid = name.length >= 3 && price > 0;

            let error = '';
            if (name.length < 3) error = 'Nombre muy corto';
            else if (price <= 0) error = 'Precio inválido';

            return {
                id: `bulk-${index}`,
                name,
                price,
                category,
                stock,
                isValid,
                error
            };
        });
        setPreview(newPreview);
    }, [bulkData]);

    const handleBulkSubmit = async () => {
        const validItems = preview.filter(item => item.isValid);
        if (validItems.length === 0) return;

        setIsImporting(true);
        try {
            await supabaseProductService.createBulk(validItems.map(item => ({
                name: item.name,
                price: item.price,
                category: item.category,
                stock: item.stock,
                description: '',
                status: ProductStatus.IN_STOCK,
                images: [],
                variants: []
            })));

            addToast('success', `${validItems.length} productos importados correctamente`);
            setBulkData('');
            onSuccess();
            onClose();
        } catch (error) {
            addToast('error', 'Error al importar productos');
        } finally {
            setIsImporting(false);
        }
    };

    const loadExample = () => {
        const example = "Anillo Plata 925, 45000, Anillos, 5\nCollar Perlas Cultivadas, 89000, Collares, 2\nAros Minimalistas Oro, 120000, Aros, 1";
        setBulkData(example);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            title="Carga Masiva de Productos"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full max-h-[80vh]">
                {/* Input Side */}
                <div className="space-y-6">
                    <div className="bg-stone-50 dark:bg-stone-950 p-6 rounded-xl border border-stone-200 dark:border-stone-800 space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Entrada de Datos</h4>
                            <button
                                onClick={loadExample}
                                className="text-[10px] text-gold-600 hover:underline font-bold uppercase tracking-wider"
                            >
                                Cargar Ejemplo
                            </button>
                        </div>

                        <textarea
                            className="w-full h-64 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 text-xs font-mono outline-none focus:border-gold-400 transition-all text-stone-800 dark:text-stone-200 shadow-inner resize-none"
                            placeholder="Nombre, Precio, Categoría, Stock&#10;Ej: Anillo de Oro, 150000, Anillos, 10"
                            value={bulkData}
                            onChange={e => setBulkData(e.target.value)}
                        />

                        <div className="flex items-start gap-2 p-3 bg-white dark:bg-stone-900 rounded-lg text-[10px] text-stone-400 italic border border-stone-100 dark:border-stone-800">
                            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <p>Formato: Nombre, Precio, Categoría, Stock. Un producto por línea. Las categorías válidas son: {categories.join(', ')}.</p>
                        </div>
                    </div>
                </div>

                {/* Preview Side */}
                <div className="flex flex-col border-l border-stone-100 dark:border-stone-800 pl-4 md:pl-8">
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-4 flex items-center justify-between">
                        <span>Vista Previa</span>
                        {preview.length > 0 && (
                            <span className={`text-[9px] px-2 py-0.5 rounded-full ${preview.every(p => p.isValid) ? 'bg-green-100 text-green-700 dark:bg-green-900/20' : 'bg-red-100 text-red-700 dark:bg-red-900/20'}`}>
                                {preview.filter(p => p.isValid).length} / {preview.length} VÁLIDOS
                            </span>
                        )}
                    </h4>

                    <div className="flex-1 overflow-y-auto min-h-[300px] border rounded-xl border-stone-100 dark:border-stone-800 bg-stone-50/50">
                        {preview.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 opacity-20 text-center">
                                <Package className="w-12 h-12 mb-2" />
                                <p className="text-sm font-serif italic">Los productos procesados aparecerán aquí</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-[11px]">
                                <thead className="sticky top-0 bg-stone-100 dark:bg-stone-800 z-10 border-b border-stone-200 dark:border-stone-700">
                                    <tr>
                                        <th className="p-3">Estado</th>
                                        <th className="p-3">Producto</th>
                                        <th className="p-3 text-right">Precio</th>
                                        <th className="p-3 text-center">Stock</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {preview.map((item) => (
                                        <tr key={item.id} className={item.isValid ? '' : 'bg-red-50 dark:bg-red-900/10'}>
                                            <td className="p-3">
                                                {item.isValid ?
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                                }
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium truncate max-w-[150px] uppercase tracking-wide">{item.name}</div>
                                                <div className="text-[9px] text-stone-400 uppercase">{item.category}</div>
                                            </td>
                                            <td className="p-3 text-right font-serif text-stone-600 dark:text-stone-400">
                                                {formatCurrency(item.price)}
                                            </td>
                                            <td className="p-3 text-center font-mono">{item.stock}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="pt-6 mt-auto flex gap-3">
                        <Button type="button" variant="ghost" className="flex-1 text-[10px] font-bold uppercase tracking-widest" onClick={onClose}>Cancelar</Button>
                        <Button
                            onClick={handleBulkSubmit}
                            disabled={preview.filter(p => p.isValid).length === 0 || isImporting}
                            isLoading={isImporting}
                            className="flex-1 gap-2 bg-stone-900 dark:bg-gold-500 text-white dark:text-stone-900 rounded-full shadow-lg group"
                        >
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Importar {preview.filter(p => p.isValid).length} productos</span>
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
