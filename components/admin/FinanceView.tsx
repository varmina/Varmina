import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { Transaction } from '../../types';
import { Button, Input, Modal } from '../UI';
import { useStore } from '../../context/StoreContext';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    Plus,
    Minus,
    ArrowUpRight,
    ArrowDownLeft,
    PieChart,
    Trash2,
    Edit2,
    FileText
} from 'lucide-react';

const getLocalISODate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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

    // Bulk State
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkData, setBulkData] = useState('');

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

    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const lines = bulkData.split('\n').filter(line => line.trim());
        const newTransactions = lines.map(line => {
            // Format: Descripcón, Monto, Categoría (opcional), Fecha (opcional)
            const parts = line.split(',').map(s => s.trim());
            const description = parts[0];
            const amount = Number(parts[1]);
            const category = parts[2] || 'General';
            const date = parts[3] || getLocalISODate();

            return {
                description,
                amount,
                type: modalType,
                category,
                date
            };
        }).filter(t => t.description && !isNaN(t.amount));

        if (newTransactions.length === 0) {
            addToast('error', 'No se encontraron transacciones válidas. Use el formato: Descripción, Monto, Categoría, Fecha');
            return;
        }

        try {
            await financeService.createBulk(newTransactions);
            addToast('success', `${newTransactions.length} transacciones registradas`);
            setIsBulkModalOpen(false);
            setBulkData('');
            loadData();
        } catch (error) {
            addToast('error', 'Error en el registro masivo');
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

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Balance */}
                <div className="bg-white dark:bg-stone-900 p-6 rounded-xl shadow-sm border border-stone-100 dark:border-stone-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <DollarSign className="w-24 h-24 text-stone-900 dark:text-white" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-2">Balance Total</p>
                    <h3 className={`text-3xl font-serif ${balance.balance >= 0 ? 'text-stone-900 dark:text-white' : 'text-red-600'}`}>
                        {formatCurrency(balance.balance)}
                    </h3>
                    <div className="mt-4 flex items-center gap-2 text-xs text-stone-500">
                        <Calendar className="w-3 h-3" />
                        <span>Histórico</span>
                    </div>
                </div>

                {/* Income */}
                <div className="bg-white dark:bg-stone-900 p-6 rounded-xl shadow-sm border border-stone-100 dark:border-stone-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-24 h-24 text-green-600" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-2">Ingresos</p>
                    <h3 className="text-3xl font-serif text-green-600">
                        {formatCurrency(balance.income)}
                    </h3>
                    <div className="mt-4 flex items-center gap-2 text-xs text-green-600/80">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>Entradas registradas</span>
                    </div>
                </div>

                {/* Expenses */}
                <div className="bg-white dark:bg-stone-900 p-6 rounded-xl shadow-sm border border-stone-100 dark:border-stone-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingDown className="w-24 h-24 text-red-600" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-2">Egresos</p>
                    <h3 className="text-3xl font-serif text-red-600">
                        {formatCurrency(balance.expense)}
                    </h3>
                    <div className="mt-4 flex items-center gap-2 text-xs text-red-600/80">
                        <ArrowDownLeft className="w-3 h-3" />
                        <span>Salidas registradas</span>
                    </div>
                </div>
            </div>

            {/* Recent Transactions List */}
            <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
                <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
                    <h3 className="font-serif text-lg text-stone-900 dark:text-white">Movimientos Recientes</h3>
                    <span className="text-xs text-stone-400 italic">Últimos 50 movimientos</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-stone-50 dark:bg-stone-950/30 text-[10px] uppercase tracking-widest text-stone-400">
                                <th className="p-4 font-bold">Descripción</th>
                                <th className="p-4 font-bold">Categoría</th>
                                <th className="p-4 font-bold">Fecha</th>
                                <th className="p-4 font-bold text-right">Monto</th>
                                <th className="p-4 font-bold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-sm">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-stone-400">No hay movimientos registrados.</td>
                                </tr>
                            ) : (
                                transactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                                        <td className="p-4 font-medium text-stone-900 dark:text-white flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                                                {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                            </div>
                                            {tx.description}
                                        </td>
                                        <td className="p-4 text-stone-500">
                                            <span className="bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded text-xs">{tx.category}</span>
                                        </td>
                                        <td className="p-4 text-stone-500">
                                            {tx.date ? (() => {
                                                const [year, month, day] = tx.date.split('-').map(Number);
                                                return new Date(year, month - 1, day).toLocaleDateString();
                                            })() : '-'}
                                        </td>
                                        <td className={`p-4 text-right font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'income' ? '+' : '-'} {formatCurrency(Number(tx.amount))}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(tx)}
                                                    className="p-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tx.id)}
                                                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Categoría</label>
                        <select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md p-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 transition-colors text-stone-900 dark:text-white"
                        >
                            <option value="">Seleccionar...</option>
                            {modalType === 'income' ? (
                                <>
                                    <option value="Ventas">Ventas</option>
                                    <option value="Servicios">Servicios</option>
                                    <option value="Otros">Otros</option>
                                </>
                            ) : (
                                <>
                                    <option value="Insumos">Insumos</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Logística">Logística</option>
                                    <option value="Servicios">Servicios Básicos</option>
                                    <option value="Otros">Otros</option>
                                </>
                            )}
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
                title="Carga Masiva de Datos"
            >
                <form onSubmit={handleBulkSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Tipo de Movimiento</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="bulkType"
                                    checked={modalType === 'income'}
                                    onChange={() => setModalType('income')}
                                    className="accent-green-600"
                                />
                                <span className="text-sm">Ingresos</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="bulkType"
                                    checked={modalType === 'expense'}
                                    onChange={() => setModalType('expense')}
                                    className="accent-red-600"
                                />
                                <span className="text-sm">Egresos</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Datos (CSV)</label>
                        <textarea
                            className="w-full h-48 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md p-3 text-sm font-mono outline-none focus:border-stone-900 dark:focus:border-stone-500 transition-colors text-stone-900 dark:text-white"
                            placeholder="Descripción, Monto, Categoría, YYYY-MM-DD&#10;Venta Anillo, 150000, Ventas, 2024-02-10"
                            value={bulkData}
                            onChange={e => setBulkData(e.target.value)}
                        />
                        <p className="text-[10px] text-stone-400 italic">
                            Un movimiento por línea. Formato: Descripción, Monto, Categoría, Fecha
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsBulkModalOpen(false)}>Cancelar</Button>
                        <Button
                            type="submit"
                            className="bg-stone-900 dark:bg-white text-white dark:text-stone-900"
                        >
                            Importar Datos
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
