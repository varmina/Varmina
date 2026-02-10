import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { Transaction } from '../../types';
import { Button, Input, Modal } from '../UI';
import { useStore } from '../../context/StoreContext';
import {
    Trash2,
    Edit2,
    FileText,
    Search,
    Filter,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Plus,
    Minus,
    DollarSign,
    ArrowUpRight,
    ArrowDownLeft,
    Info,
    TrendingUp,
    TrendingDown
} from 'lucide-react';

const getLocalISODate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const CATEGORIES = {
    income: ['Ventas', 'Servicios', 'Reembolsos', 'Otros'],
    expense: ['Insumos', 'Marketing', 'Logística', 'Servicios Básicos', 'Sueldos', 'Otros']
};

export const FinanceView: React.FC = () => {
    const { addToast } = useStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [balance, setBalance] = useState({ income: 0, expense: 0, balance: 0 });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'income' | 'expense'>('income');

    // Form State
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: '',
        date: getLocalISODate()
    });
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    // List Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewType, setViewType] = useState<'all' | 'income' | 'expense'>('all');

    // Bulk State
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkData, setBulkData] = useState('');
    const [bulkPreview, setBulkPreview] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [txs, bal] = await Promise.all([
                financeService.getAll(50),
                financeService.getBalance()
            ]);
            setTransactions(txs);
            setBalance(bal);
        } catch (error) {
            console.error(error);
            addToast('error', 'Error al cargar datos financieros');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                description: formData.description,
                amount: Number(formData.amount),
                type: modalType,
                category: formData.category || 'General',
                date: formData.date
            };

            if (editingTransaction) {
                await financeService.update(editingTransaction.id, payload);
                addToast('success', 'Transacción actualizada');
            } else {
                await financeService.create(payload);
                addToast('success', 'Transacción registrada');
            }

            setIsModalOpen(false);
            setEditingTransaction(null);
            setFormData({ description: '', amount: '', category: '', date: getLocalISODate() });
            loadData();
        } catch (error) {
            addToast('error', 'Error al guardar');
        }
    };

    const handleEdit = (tx: Transaction) => {
        setEditingTransaction(tx);
        setModalType(tx.type);
        setFormData({
            description: tx.description,
            amount: tx.amount.toString(),
            category: tx.category || '',
            date: tx.date || getLocalISODate()
        });
        setIsModalOpen(true);
    };

    useEffect(() => {
        const lines = bulkData.split('\n').filter(line => line.trim());
        const preview = lines.map((line, index) => {
            const parts = line.split(',').map(s => s.trim());
            const amount = Number(parts[1]);
            const isValid = parts[0] && !isNaN(amount) && amount > 0;
            return {
                id: index,
                description: parts[0] || '---',
                amount: isNaN(amount) ? 0 : amount,
                category: parts[2] || 'General',
                date: parts[3] || getLocalISODate(),
                isValid
            };
        });
        setBulkPreview(preview);
    }, [bulkData]);

    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validTransactions = bulkPreview
            .filter(p => p.isValid)
            .map(p => ({
                description: p.description,
                amount: p.amount,
                type: modalType,
                category: p.category,
                date: p.date
            }));

        if (validTransactions.length === 0) {
            addToast('error', 'No hay datos válidos para importar');
            return;
        }

        try {
            await financeService.createBulk(validTransactions);
            addToast('success', `${validTransactions.length} registros importados`);
            setIsBulkModalOpen(false);
            setBulkData('');
            loadData();
        } catch (error) {
            addToast('error', 'Error en el proceso masivo');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta transacción?')) return;
        try {
            await financeService.delete(id);
            addToast('success', 'Eliminado correctamente');
            loadData();
        } catch (error) {
            addToast('error', 'Error al eliminar');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;
        const matchesType = viewType === 'all' || tx.type === viewType;
        return matchesSearch && matchesCategory && matchesType;
    });

    const expenseRatio = balance.income > 0 ? (balance.expense / balance.income) * 100 : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif text-stone-900 dark:text-white">Finanzas</h2>
                    <p className="text-stone-500 text-sm">Resumen de ingresos y egresos</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => setIsBulkModalOpen(true)}
                        className="gap-2 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                        <FileText className="w-4 h-4" /> Carga Masiva
                    </Button>
                    <Button
                        onClick={() => { setEditingTransaction(null); setModalType('income'); setIsModalOpen(true); }}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                        <Plus className="w-4 h-4" /> Nueva Venta
                    </Button>
                    <Button
                        onClick={() => { setEditingTransaction(null); setModalType('expense'); setIsModalOpen(true); }}
                        className="bg-red-600 hover:bg-red-700 text-white gap-2"
                    >
                        <Minus className="w-4 h-4" /> Nuevo Gasto
                    </Button>
                </div>
            </div>

            {/* Balance Summary Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
                {/* Total Balance Card */}
                <div className="md:col-span-2 bg-stone-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden group border border-stone-800">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <DollarSign className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <p className="text-gold-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Balance Actual</p>
                            <h3 className="text-4xl md:text-5xl font-serif">
                                {formatCurrency(balance.balance)}
                            </h3>
                        </div>
                        <div className="mt-8 space-y-4">
                            <div className="flex justify-between items-end text-xs mb-2">
                                <span className="text-stone-400 uppercase tracking-wider">Flujo de Caja</span>
                                <span className={expenseRatio > 80 ? 'text-red-400' : 'text-green-400'}>
                                    {expenseRatio.toFixed(1)}% Egresos/Ingresos
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${expenseRatio > 80 ? 'bg-red-500' : (expenseRatio > 50 ? 'bg-gold-500' : 'bg-green-500')}`}
                                    style={{ width: `${Math.min(100, expenseRatio)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vertical Stats */}
                <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 flex flex-col justify-center">
                    <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">Ingresos</p>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                        <h4 className="text-2xl font-serif text-green-600">{formatCurrency(balance.income)}</h4>
                    </div>
                    <p className="text-stone-400 text-[10px] italic">Total histórico bruto</p>
                </div>

                <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 flex flex-col justify-center">
                    <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">Egresos</p>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded">
                            <ArrowDownLeft className="w-4 h-4" />
                        </div>
                        <h4 className="text-2xl font-serif text-red-600">{formatCurrency(balance.expense)}</h4>
                    </div>
                    <p className="text-stone-400 text-[10px] italic">Gasto total acumulado</p>
                </div>
            </div>

            {/* List Header & Controls */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50 dark:bg-stone-950/50 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <input
                                type="text"
                                placeholder="Buscar transacciones..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-400"
                            />
                        </div>
                        <div className="flex bg-white dark:bg-stone-900 p-1 rounded-lg border border-stone-200 dark:border-stone-800">
                            <button
                                onClick={() => setViewType('all')}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${viewType === 'all' ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900' : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'}`}
                            >
                                Todas
                            </button>
                            <button
                                onClick={() => setViewType('income')}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${viewType === 'income' ? 'bg-green-600 text-white' : 'text-stone-500 hover:text-green-600'}`}
                            >
                                Ingresos
                            </button>
                            <button
                                onClick={() => setViewType('expense')}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${viewType === 'expense' ? 'bg-red-600 text-white' : 'text-stone-500 hover:text-red-600'}`}
                            >
                                Gastos
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                        <Filter className="w-3.5 h-3.5 text-stone-400 mr-2 shrink-0" />
                        {['All', ...(viewType === 'expense' ? CATEGORIES.expense : CATEGORIES.income)].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-gold-100 text-gold-700 dark:bg-gold-500/20 dark:text-gold-200 border border-gold-200' : 'bg-transparent text-stone-500 border border-transparent hover:border-stone-200'}`}
                            >
                                {cat === 'All' ? 'TODAS LAS CATEGORÍAS' : cat.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
                    <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-950/20">
                        <div className="flex items-center gap-2">
                            <h3 className="font-serif text-lg text-stone-900 dark:text-white">Movimientos</h3>
                            <span className="text-[10px] bg-stone-200 dark:bg-stone-800 px-2 py-0.5 rounded text-stone-500 uppercase tracking-widest">
                                {filteredTransactions.length} registros
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-stone-50/10 dark:bg-stone-950/30 text-[10px] uppercase tracking-[0.2em] text-stone-400 border-b border-stone-100 dark:border-stone-800 text-center">
                                    <th className="p-5 font-bold text-left">Detalle</th>
                                    <th className="p-5 font-bold">Categoría</th>
                                    <th className="p-5 font-bold">Fecha</th>
                                    <th className="p-5 font-bold text-right">Monto</th>
                                    <th className="p-5 font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-50 dark:divide-stone-800/50 text-sm">
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-3 text-stone-400 text-center">
                                                <div className="p-4 bg-stone-50 dark:bg-stone-800/20 rounded-full">
                                                    <Search className="w-8 h-8 opacity-20" />
                                                </div>
                                                <p className="font-serif italic text-lg">No se encontraron movimientos</p>
                                                <p className="text-xs uppercase tracking-widest max-w-[240px]">Prueba ajustando los filtros o realizando un nuevo registro</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map(tx => (
                                        <tr key={tx.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/20 group transition-all duration-300">
                                            <td className="p-5 font-medium text-stone-900 dark:text-white flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${tx.type === 'income' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                                                    {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                                </div>
                                                <span className="uppercase tracking-wide text-xs">{tx.description}</span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className="text-[10px] font-bold bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full text-stone-500 border border-stone-200 dark:border-stone-700 tracking-widest">
                                                    {tx.category?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-5 text-center text-stone-500 font-serif text-xs">
                                                {tx.date ? (() => {
                                                    const [year, month, day] = tx.date.split('-').map(Number);
                                                    return new Date(year, month - 1, day).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
                                                })() : '-'}
                                            </td>
                                            <td className={`p-5 text-right font-medium text-lg font-serif ${tx.type === 'income' ? 'text-green-600' : 'text-red-700 dark:text-red-500'}`}>
                                                {tx.type === 'income' ? '+' : '-'} {formatCurrency(Number(tx.amount))}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => handleEdit(tx)}
                                                        className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-white dark:hover:bg-stone-800 rounded-lg shadow-sm border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-all"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(tx.id)}
                                                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shadow-sm border border-transparent hover:border-red-100 transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Transaction Modal (Add/Edit) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }}
                title={editingTransaction ? 'Editar Transacción' : (modalType === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto')}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Descripción"
                        placeholder="Ej: Venta Anillo Oro"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Monto"
                            type="number"
                            placeholder="0"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                        <Input
                            label="Fecha"
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="transaction-category" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Categoría</label>
                        <select
                            id="transaction-category"
                            name="category"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md p-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 transition-colors text-stone-900 dark:text-white"
                        >
                            <option value="">Seleccionar...</option>
                            {(modalType === 'income' ? CATEGORIES.income : CATEGORIES.expense).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setEditingTransaction(null); }}>Cancelar</Button>
                        <Button
                            type="submit"
                            className={modalType === 'income' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
                        >
                            {editingTransaction ? 'Actualizar' : (modalType === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto')}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Bulk Add Modal */}
            <Modal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                size="xl"
                title="Carga Masiva de Datos"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full max-h-[80vh]">
                    <div className="space-y-6">
                        <div className="bg-stone-50 dark:bg-stone-950 p-6 rounded-xl border border-stone-200 dark:border-stone-800 space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Paso 1: Configuración</h4>

                            <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Tipo de Movimiento</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setModalType('income')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-xs font-bold transition-all ${modalType === 'income' ? 'bg-green-600 border-green-700 text-white shadow-lg' : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-500 hover:border-green-300'}`}
                                    >
                                        <ArrowUpRight className="w-4 h-4" /> INGRESOS
                                    </button>
                                    <button
                                        onClick={() => setModalType('expense')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-xs font-bold transition-all ${modalType === 'expense' ? 'bg-red-600 border-red-700 text-white shadow-lg' : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-500 hover:border-red-300'}`}
                                    >
                                        <ArrowDownLeft className="w-4 h-4" /> EGRESOS
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">Paso 2: Entrada de Datos</label>
                                <button
                                    onClick={() => setBulkData(`Venta Anillo, 150000, Ventas, ${getLocalISODate()}\nVenta Collar, 85000, Ventas, ${getLocalISODate()}`)}
                                    className="text-[10px] text-gold-600 hover:underline"
                                >
                                    Cargar Ejemplo
                                </button>
                            </div>
                            <textarea
                                className="w-full h-48 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl p-4 text-xs font-mono outline-none focus:border-gold-400 transition-all text-stone-800 dark:text-stone-200 shadow-inner"
                                placeholder={"Descripción, Monto, Categoría (opcional), Fecha (opcional) \nEj: Venta Anillo, 150000, Ventas, 2024-02-10"}
                                value={bulkData}
                                onChange={e => setBulkData(e.target.value)}
                            />
                            <div className="flex items-start gap-2 p-3 bg-stone-50 dark:bg-stone-950 rounded-lg text-[10px] text-stone-400 italic">
                                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                <p>Un registro por línea. Formato: Descripción, Monto, Categoría, Fecha. Si omites la fecha se usará la de hoy.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col border-l border-stone-100 dark:border-stone-800 pl-4 md:pl-8">
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-4 flex items-center gap-2">
                            Paso 3: Vista Previa
                            {bulkPreview.length > 0 && (
                                <span className={`text-[9px] px-2 py-0.5 rounded-full ${bulkPreview.every(p => p.isValid) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {bulkPreview.filter(p => p.isValid).length} / {bulkPreview.length} VALIDOS
                                </span>
                            )}
                        </h4>

                        <div className="flex-1 overflow-y-auto min-h-[300px] border rounded-xl border-stone-100 dark:border-stone-800 bg-stone-50/50">
                            {bulkPreview.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-8 opacity-20 text-center">
                                    <FileText className="w-12 h-12 mb-2" />
                                    <p className="text-sm font-serif italic text-balance">Los datos procesados aparecerán aquí para revisión</p>
                                </div>
                            ) : (
                                <table className="w-full text-left text-[11px]">
                                    <thead className="sticky top-0 bg-stone-100 dark:bg-stone-800 z-10">
                                        <tr>
                                            <th className="p-2 first:rounded-tl-xl last:rounded-tr-xl">Estado</th>
                                            <th className="p-2">Detalle</th>
                                            <th className="p-2 text-right">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                        {bulkPreview.map((item) => (
                                            <tr key={item.id} className={item.isValid ? '' : 'bg-red-50 dark:bg-red-900/10'}>
                                                <td className="p-2">
                                                    {item.isValid ?
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> :
                                                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                                    }
                                                </td>
                                                <td className="p-2 font-medium truncate max-w-[120px]">{item.description}</td>
                                                <td className="p-2 text-right font-serif">{formatCurrency(item.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="pt-6 mt-auto flex gap-3">
                            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsBulkModalOpen(false)}>Cancelar</Button>
                            <Button
                                onClick={handleBulkSubmit}
                                disabled={bulkPreview.filter(p => p.isValid).length === 0}
                                className="flex-1 gap-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 relative group overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    IMPORTAR {bulkPreview.filter(p => p.isValid).length} ITEMS
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
