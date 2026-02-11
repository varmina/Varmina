
import React, { useState, useEffect } from 'react';
import { Button, Input } from '../UI';
import { Plus, Trash2, List, Grid, Layers, X } from 'lucide-react';
import { attributeService, ProductAttribute, AttributeType } from '../../services/attributeService';
import { useStore } from '../../context/StoreContext';

const ATTRIBUTE_TYPES: { type: AttributeType; label: string; icon: React.ReactNode }[] = [
    { type: 'collection', label: 'Colecciones', icon: <Grid className="w-4 h-4" /> },
    { type: 'category', label: 'Categorías (Tienda)', icon: <List className="w-4 h-4" /> },
    { type: 'erp_category', label: 'Categorías (ERP)', icon: <Layers className="w-4 h-4" /> },
];

export const AttributeManagerSection: React.FC = () => {
    const { addToast } = useStore();
    const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeType, setActiveType] = useState<AttributeType>('collection');
    const [newAttributeName, setNewAttributeName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadAttributes();
    }, []);

    const loadAttributes = async () => {
        setLoading(true);
        try {
            const data = await attributeService.getAll();
            setAttributes(data);
        } catch (error) {
            console.error(error);
            // addToast('error', 'Error al cargar atributos');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
        if (e && 'preventDefault' in e) e.preventDefault();
        if (!newAttributeName.trim()) return;

        setIsAdding(true);
        try {
            const newAttr = await attributeService.create(activeType, newAttributeName);
            setAttributes([...attributes, newAttr]);
            setNewAttributeName('');
            addToast('success', 'Elemento agregado');
        } catch (error) {
            addToast('error', 'Error al crear elemento');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este elemento?')) return;
        try {
            await attributeService.delete(id);
            setAttributes(attributes.filter(a => a.id !== id));
            addToast('success', 'Elemento eliminado');
        } catch (error) {
            addToast('error', 'Error al eliminar');
        }
    };

    const filteredAttributes = attributes.filter(a => a.type === activeType);

    return (
        <section className="bg-white dark:bg-stone-900 rounded-xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-stone-100 dark:border-stone-800 p-5 md:p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-stone-100 dark:border-stone-800 pb-4">
                <div className="p-2 bg-gold-50 dark:bg-gold-900/10 rounded-full">
                    <List className="w-4 h-4 md:w-5 md:h-5 text-gold-600" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white">Listas y Categorías</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Types */}
                <div className="w-full md:w-1/3 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
                    {ATTRIBUTE_TYPES.map(type => (
                        <button
                            key={type.type}
                            onClick={() => setActiveType(type.type)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${activeType === type.type
                                ? 'bg-stone-900 text-white dark:bg-gold-500 dark:text-stone-900 shadow-md'
                                : 'bg-stone-50 text-stone-500 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'
                                }`}
                        >
                            {type.icon}
                            {type.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="w-full md:w-2/3 space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder={`Nueva ${activeType === 'collection' ? 'Colección' : 'Categoría'}...`}
                            value={newAttributeName}
                            onChange={e => setNewAttributeName(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAdd(e);
                                }
                            }}
                            className="bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-700 rounded-lg py-2 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                        />
                        <Button
                            type="button"
                            onClick={handleAdd}
                            isLoading={isAdding}
                            disabled={!newAttributeName.trim()}
                            className="bg-stone-900 text-white dark:bg-gold-500 dark:text-stone-900 rounded-lg px-4"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="bg-stone-50 dark:bg-stone-950/30 rounded-lg border border-stone-100 dark:border-stone-800 min-h-[200px] max-h-[400px] overflow-y-auto p-2">
                        {loading ? (
                            <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div></div>
                        ) : filteredAttributes.length === 0 ? (
                            <div className="text-center p-8 text-stone-400 text-xs uppercase tracking-wide">
                                No hay elementos registrados
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredAttributes.map(attr => (
                                    <div key={attr.id} className="flex items-center justify-between p-3 bg-white dark:bg-stone-900 rounded-md border border-stone-100 dark:border-stone-800 group hover:border-gold-200 dark:hover:border-gold-900 transition-colors">
                                        <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{attr.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(attr.id)}
                                            className="text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
