'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { financeService } from '@/services/financeService';
import { ProductStatus, Transaction } from '@/types';
import { formatPrice } from '@/lib/format';
import {
    Package, ShoppingCart, DollarSign, ArrowRight,
    TrendingUp, TrendingDown, AlertTriangle, Gem,
    BarChart3, Clock, Wallet, ArrowUpRight, ArrowDownRight,
    Activity
} from 'lucide-react';

export const AdminHomeView: React.FC = () => {
    const { products, setActiveAdminTab, dataVersion } = useStore();

    const [balance, setBalance] = useState({ income: 0, expense: 0, balance: 0 });
    const [todayBalance, setTodayBalance] = useState({ income: 0, expense: 0, balance: 0 });
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const outOfStockCount = products.filter(p => p.status === ProductStatus.SOLD_OUT).length;
    const lowStockCount = products.filter(p => p.status === ProductStatus.IN_STOCK && p.stock !== undefined && p.stock > 0 && p.stock <= 3).length;
    const activeCount = products.filter(p => p.status === ProductStatus.IN_STOCK).length;

    // Total inventory value
    const inventoryValue = products.reduce((sum, p) => {
        const stock = p.stock || 0;
        return sum + (p.price * stock);
    }, 0);

    // Top 5 most expensive products (as "featured")
    const topProducts = [...products]
        .filter(p => p.status === ProductStatus.IN_STOCK)
        .sort((a, b) => b.price - a.price)
        .slice(0, 5);

    // Module-level cache to avoid refetching on tab switches
    const cacheRef = React.useRef<{ data: any; timestamp: number } | null>(null);
    const CACHE_TTL = 30000; // 30s

    useEffect(() => {
        // Invalidate cache when dataVersion changes (realtime update)
        if (cacheRef.current) {
            cacheRef.current = null;
        }
        const load = async () => {
            try {
                const today = new Date();
                const isoToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const firstOfMonth = isoToday.substring(0, 8) + '01';

                const [monthBal, dayBal, recent] = await Promise.all([
                    financeService.getBalance(firstOfMonth, isoToday),
                    financeService.getBalance(isoToday, isoToday),
                    financeService.getAll(8),
                ]);

                setBalance(monthBal);
                setTodayBalance(dayBal);
                setRecentTransactions(recent);
                cacheRef.current = { data: { monthBal, dayBal, recent }, timestamp: Date.now() };
            } catch (e) {
                console.error('Error loading home data:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [dataVersion]);

    const StatCard = ({ icon: Icon, label, value, sub, color, onClick }: {
        icon: React.ElementType; label: string; value: string; sub?: string; color: string; onClick?: () => void
    }) => (
        <button
            onClick={onClick}
            className={`relative p-5 rounded-2xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm flex flex-col gap-3 text-left transition-all hover:shadow-md hover:-translate-y-0.5 group overflow-hidden ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-[0.06] ${color}`} />
            <div className={`p-2.5 rounded-xl w-fit ${color} bg-opacity-10`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-stone-400 mb-1">{label}</p>
                <h4 className="text-2xl font-serif text-stone-900 dark:text-white leading-none">{value}</h4>
                {sub && <p className="text-[10px] text-stone-400 mt-1.5">{sub}</p>}
            </div>
            {onClick && <ArrowRight className="w-4 h-4 absolute bottom-4 right-4 text-stone-300 group-hover:text-gold-500 transition-colors" />}
        </button>
    );

    return (
        <div className="space-y-8 p-5 lg:p-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="font-serif text-xl md:text-3xl text-stone-900 dark:text-gold-200 tracking-wider mb-1 uppercase">Panel de Control</h1>
                    <p className="text-stone-400 text-[10px] md:text-xs font-sans tracking-[0.2em] uppercase font-bold">
                        {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveAdminTab('orders')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white dark:bg-gold-500 dark:text-stone-900 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                    >
                        <ShoppingCart className="w-4 h-4" /> Nueva Venta
                    </button>
                    <button
                        onClick={() => setActiveAdminTab('inventory')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-stone-700 transition-all"
                    >
                        <Package className="w-4 h-4" /> Añadir Pieza
                    </button>
                </div>
            </div>

            {/* Financial Overview Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Wallet}
                    label="Ventas Hoy"
                    value={loading ? '...' : formatPrice(todayBalance.income, 'CLP')}
                    sub={todayBalance.income > 0 ? `${formatPrice(todayBalance.expense, 'CLP')} en gastos` : 'Sin movimientos aún'}
                    color="text-green-600"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Ingresos del Mes"
                    value={loading ? '...' : formatPrice(balance.income, 'CLP')}
                    sub={`Balance: ${formatPrice(balance.balance, 'CLP')}`}
                    color="text-emerald-600"
                />
                <StatCard
                    icon={TrendingDown}
                    label="Gastos del Mes"
                    value={loading ? '...' : formatPrice(balance.expense, 'CLP')}
                    color="text-red-500"
                />
                <StatCard
                    icon={Gem}
                    label="Valor Inventario"
                    value={formatPrice(inventoryValue, 'CLP')}
                    sub={`${activeCount} piezas activas`}
                    color="text-gold-600"
                />
            </div>

            {/* Inventory Alerts + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inventory Status */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5" /> Estado del Inventario
                    </h3>
                    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-xs text-stone-600 dark:text-stone-300">En Stock</span>
                            </div>
                            <span className="text-sm font-bold font-mono text-stone-900 dark:text-white">{activeCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-gold-500" />
                                <span className="text-xs text-stone-600 dark:text-stone-300">Bajo Stock (≤3)</span>
                            </div>
                            <span className="text-sm font-bold font-mono text-gold-600">{lowStockCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-xs text-stone-600 dark:text-stone-300">Agotados</span>
                            </div>
                            <span className="text-sm font-bold font-mono text-red-500">{outOfStockCount}</span>
                        </div>

                        {/* Simple bar visualization */}
                        <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
                            <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden flex">
                                {products.length > 0 && (
                                    <>
                                        <div
                                            className="h-full bg-green-500 transition-all duration-700"
                                            style={{ width: `${(activeCount / products.length) * 100}%` }}
                                        />
                                        <div
                                            className="h-full bg-gold-500 transition-all duration-700"
                                            style={{ width: `${(lowStockCount / products.length) * 100}%` }}
                                        />
                                        <div
                                            className="h-full bg-red-500 transition-all duration-700"
                                            style={{ width: `${(outOfStockCount / products.length) * 100}%` }}
                                        />
                                    </>
                                )}
                            </div>
                            <p className="text-[9px] text-stone-400 mt-2 text-center">{products.length} productos totales</p>
                        </div>
                    </div>

                    {(outOfStockCount > 0 || lowStockCount > 0) && (
                        <button
                            onClick={() => setActiveAdminTab('inventory')}
                            className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest text-gold-600 hover:text-gold-500 bg-gold-50 dark:bg-gold-950/20 border border-gold-200 dark:border-gold-900/30 rounded-xl transition-colors"
                        >
                            <AlertTriangle className="w-3.5 h-3.5" /> Revisar productos con bajo stock
                        </button>
                    )}
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" /> Movimientos Recientes
                        </h3>
                        <button
                            onClick={() => setActiveAdminTab('finance')}
                            className="text-[10px] font-bold uppercase tracking-widest text-gold-600 hover:text-gold-500 flex items-center gap-1 transition-colors"
                        >
                            Ver Todo <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-10 flex items-center justify-center text-stone-400">
                                <div className="w-5 h-5 border-2 border-stone-300 border-t-gold-500 rounded-full animate-spin" />
                            </div>
                        ) : recentTransactions.length === 0 ? (
                            <div className="p-10 flex flex-col items-center justify-center text-stone-400">
                                <BarChart3 className="w-8 h-8 mb-2 opacity-30" />
                                <p className="text-xs">Sin transacciones registradas</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-stone-100 dark:divide-stone-800">
                                {recentTransactions.map((t) => (
                                    <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                        <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-green-50 dark:bg-green-950/30 text-green-600' : 'bg-red-50 dark:bg-red-950/30 text-red-500'}`}>
                                            {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">{t.description}</p>
                                            <p className="text-[10px] text-stone-400">{t.category} · {new Date(t.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}</p>
                                        </div>
                                        <span className={`text-sm font-bold font-mono whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                                            {t.type === 'income' ? '+' : '-'}{formatPrice(t.amount, 'CLP')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Products Row */}
            {topProducts.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                            <Gem className="w-3.5 h-3.5" /> Piezas Destacadas
                        </h3>
                        <button
                            onClick={() => setActiveAdminTab('inventory')}
                            className="text-[10px] font-bold uppercase tracking-widest text-gold-600 hover:text-gold-500 flex items-center gap-1 transition-colors"
                        >
                            Ver Catálogo <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {topProducts.map(p => (
                            <div key={p.id} className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm group hover:shadow-md transition-all hover:-translate-y-0.5">
                                <div className="aspect-square bg-stone-100 dark:bg-stone-800 overflow-hidden">
                                    {p.images?.[0] ? (
                                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300 dark:text-stone-600">
                                            <Gem className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <p className="text-[10px] font-bold text-stone-800 dark:text-stone-200 truncate leading-tight">{p.name}</p>
                                    <div className="flex items-center justify-between mt-1.5">
                                        <span className="text-[10px] font-mono font-bold text-gold-600">{formatPrice(p.price, 'CLP')}</span>
                                        <span className="text-[8px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">{p.stock ?? 0}u</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
