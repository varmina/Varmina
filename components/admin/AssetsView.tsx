import React, { useState, useEffect } from 'react';
import { internalAssetService, CreateAssetInput } from '../../services/internalAssetService';
import { InternalAsset } from '../../types';
import { Button, Input, Modal } from '../UI';
import { useStore } from '../../context/StoreContext';
import {
    Package,
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    AlertTriangle,
    Box,
    Truck,
    Warehouse,
    MoreVertical,
    ArrowUpDown,
    CheckCircle2
} from 'lucide-react';

export const AssetsView: React.FC = () => {
    const { addToast } = useStore();
    const [assets, setAssets] = useState<InternalAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [editingAsset, setEditingAsset] = useState<InternalAsset | null>(null);

    const [formData, setFormData] = useState<CreateAssetInput>({
        name: '',
        category: 'Insumos',
        stock: 0,
        min_stock: 5,
        unit_cost: 0,
        location: '',
        description: ''
    });

    const categories = ['Insumos', 'Packaging', 'Transporte', 'Almacenamiento', 'Mobiliario', 'Herramientas'];

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        try {
            setLoading(true);
            const data = await internalAssetService.getAll();
            setAssets(data);
        } catch (error) {
            addToast('error', 'Error al cargar inventario interno');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAsset) {
                await internalAssetService.update(editingAsset.id, formData);
                addToast('success', 'Activo actualizado');
            } else {
                await internalAssetService.create(formData);
                addToast('success', 'Activo registrado');
            }
            setIsModalOpen(false);
            setEditingAsset(null);
            resetForm();
            loadAssets();
        } catch (error) {
            addToast('error', 'Error al guardar');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'Insumos',
            stock: 0,
            min_stock: 5,
            unit_cost: 0,
            location: '',
            description: ''
        });
    };

    const handleEdit = (asset: InternalAsset) => {
        setEditingAsset(asset);
        setFormData({
            name: asset.name,
            category: asset.category,
            stock: asset.stock,
            min_stock: asset.min_stock,
            unit_cost: asset.unit_cost,
            location: asset.location || '',
            description: asset.description || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este activo del inventario?')) return;
        try {
            await internalAssetService.delete(id);
            addToast('success', 'Activo eliminado');
            loadAssets();
        } catch (error) {
            addToast('error', 'Error al eliminar');
        }
    };

    const filteredAssets = assets.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const totalValue = assets.reduce((acc, curr) => acc + (curr.stock * curr.unit_cost), 0);
    const lowStockCount = assets.filter(a => a.stock <= a.min_stock).length;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif text-stone-900 dark:text-white uppercase tracking-widest">Activos y Suministros</h2>
                    <p className="text-stone-500 text-sm">Gestión de inventario interno para operaciones ERP</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setEditingAsset(null); setIsModalOpen(true); }}
                    className="bg-stone-900 text-white dark:bg-gold-500 dark:text-stone-900 flex items-center gap-2 px-6 rounded-full shadow-lg"
                >
                    <Plus className="w-4 h-4" /> Nuevo Activo
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:scale-110 transition-transform">
                        <Warehouse className="w-24 h-24" />
                    </div>
                    <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">Valor Inventario</p>
                    <h4 className="text-3xl font-serif text-stone-900 dark:text-gold-200">{formatCurrency(totalValue)}</h4>
                    <p className="text-[10px] text-stone-400 mt-2 font-medium uppercase tracking-wide">Valor totalizado en bodega</p>
                </div>

                <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:scale-110 transition-transform">
                        <Package className="w-24 h-24" />
                    </div>
                    <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Ítems</p>
                    <h4 className="text-3xl font-serif text-stone-900 dark:text-white">{assets.length}</h4>
                    <p className="text-[10px] text-stone-400 mt-2 font-medium uppercase tracking-wide">Categorías registradas</p>
                </div>

                <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden group transition-colors ${lowStockCount > 0 ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800' : 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800'}`}>
                    <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:scale-110 transition-transform">
                        <AlertTriangle className="w-24 h-24" />
                    </div>
                    <p className={`${lowStockCount > 0 ? 'text-amber-600' : 'text-stone-400'} text-[10px] font-bold uppercase tracking-widest mb-1`}>Alertas Stock</p>
                    <h4 className={`text-3xl font-serif ${lowStockCount > 0 ? 'text-amber-600' : 'text-stone-900 dark:text-white'}`}>{lowStockCount}</h4>
                    <p className="text-[10px] text-stone-400 mt-2 font-medium uppercase tracking-wide">Ítems bajo el stock mínimo</p>
                </div>
            </div>

            {/* List Controls */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
                <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Buscar activo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                        <Filter className="w-3.5 h-3.5 text-stone-400 mr-2" />
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${selectedCategory === 'All' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                        >
                            Todos
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-gold-500 text-stone-900' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-stone-50/50 dark:bg-stone-950/30 text-[10px] uppercase tracking-[0.2em] text-stone-400 border-b border-stone-100 dark:border-stone-800">
                                <th className="p-5 font-bold">Detalle / Ubicación</th>
                                <th className="p-5 font-bold">Categoría</th>
                                <th className="p-5 font-bold text-center">Stock</th>
                                <th className="p-5 font-bold text-right">Costo Unit.</th>
                                <th className="p-5 font-bold text-right">Valor Total</th>
                                <th className="p-5 font-bold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50 dark:divide-stone-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mr-2"></div>
                                        <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-4">Cargando inventario...</p>
                                    </td>
                                </tr>
                            ) : filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <Box className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                                        <p className="font-serif italic text-stone-400">No se encontraron activos registrados</p>
                                    </td>
                                </tr>
                            ) : filteredAssets.map(asset => (
                                <tr key={asset.id} className="hover:bg-stone-50/30 dark:hover:bg-stone-800/30 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 group-hover:scale-110 transition-transform">
                                                {asset.category === 'Transporte' ? <Truck className="w-5 h-5" /> : <Box className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h5 className="font-medium text-stone-900 dark:text-white uppercase tracking-wide text-xs">{asset.name}</h5>
                                                <p className="text-[10px] text-stone-400">{asset.location || 'Ub. no definida'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-[9px] font-bold bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full text-stone-500 border border-stone-200 dark:border-stone-700 tracking-widest uppercase">
                                            {asset.category}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-xs font-bold ${asset.stock <= asset.min_stock ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-green-50 text-green-600 dark:bg-green-900/20'}`}>
                                            {asset.stock}
                                            {asset.stock <= asset.min_stock && <AlertTriangle className="w-3 h-3" />}
                                        </div>
                                    </td>
                                    <td className="p-5 text-right font-serif text-stone-600 dark:text-stone-400">
                                        {formatCurrency(asset.unit_cost)}
                                    </td>
                                    <td className="p-5 text-right font-serif font-bold text-stone-900 dark:text-white">
                                        {formatCurrency(asset.stock * asset.unit_cost)}
                                    </td>
                                    <td className="p-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleEdit(asset)} className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors" title="Editar">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDelete(asset.id)} className="p-2 text-stone-400 hover:text-red-600 transition-colors" title="Eliminar">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Asset Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingAsset ? 'Editar Activo' : 'Registrar Nuevo Activo'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Input
                                label="Nombre del Activo"
                                placeholder="Ej: Cajas Premium Varmina M"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <div>
                                <label htmlFor="asset-category" className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Categoría</label>
                                <select
                                    id="asset-category"
                                    name="category"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Stock Actual"
                                    type="number"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                    required
                                />
                                <Input
                                    label="Stock Mínimo (Alerta)"
                                    type="number"
                                    value={formData.min_stock}
                                    onChange={e => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Costo Unitario (NETO)"
                                type="number"
                                value={formData.unit_cost}
                                onChange={e => setFormData({ ...formData, unit_cost: Number(e.target.value) })}
                                placeholder="0"
                            />
                            <Input
                                label="Ubicación Física"
                                placeholder="Ej: Bodega Central A-2"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                            <div>
                                <label htmlFor="asset-description" className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Descripción / Notas</label>
                                <textarea
                                    id="asset-description"
                                    name="description"
                                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 min-h-[100px]"
                                    placeholder="Detalles adicionales sobre el activo..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="bg-stone-900 text-white dark:bg-gold-500 dark:text-stone-900 px-8">
                            {editingAsset ? 'Actualizar' : 'Registrar Activo'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
