'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import {
    BarChart3, TrendingUp, Activity, MousePointerClick,
    ShoppingBag, RotateCcw, AlertCircle, DollarSign,
    Wallet, PieChart, Layers, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { ProductStatus, Transaction, InternalAsset } from '@/types';
import { supabaseProductService } from '@/services/supabaseProductService';
import { financeService } from '@/services/financeService';
import { internalAssetService } from '@/services/internalAssetService';
import { Button } from '../ui/button';
import { formatPrice } from '@/lib/format';

export const AnalyticsDashboard: React.FC = () => {
    const { products, refreshProducts, addToast } = useStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [assets, setAssets] = useState<InternalAsset[]>([]);
    const [isResetting, setIsResetting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExtraData();
    }, [products]);

    const loadExtraData = async () => {
        try {
            const [tData, aData] = await Promise.all([
                financeService.getAll(1000), // Increase limit for better insights
                internalAssetService.getAll()
            ]);
            setTransactions(tData);
            setAssets(aData);
        } catch (error) {
            console.error('Error loading analytics supplemental data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetAnalytics = async () => {
        if (!confirm('¿Está seguro de que desea reiniciar todas las estadísticas de interés? Esta acción no se puede deshacer.')) {
            return;
        }

        setIsResetting(true);
        try {
            await supabaseProductService.resetAllAnalytics();
            await refreshProducts(true);
            addToast('success', 'Estadísticas reiniciadas correctamente');
        } catch (error) {
            console.error(error);
            addToast('error', 'Error al reiniciar estadísticas');
        } finally {
            setIsResetting(false);
        }
    };

    // --- CALCULATIONS ---

    // 1. WhatsApp Interest
    const totalClicks = products.reduce((acc, p) => acc + (p.whatsapp_clicks || 0), 0);
    const topProducts = [...products]
        .sort((a, b) => (b.whatsapp_clicks || 0) - (a.whatsapp_clicks || 0))
        .slice(0, 10);

    const engagementRate = products.length > 0 ? (totalClicks / products.length).toFixed(1) : '0';

    // 2. Financials
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyIncome = transactions
        .filter(t => {
            const d = new Date(t.date);
            return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((acc, t) => acc + t.amount, 0);

    // 3. Inventory Valuation
    const inventoryJewelryCost = products.reduce((acc, p) => acc + ((p.unit_cost || 0) * (p.stock || 0)), 0);
    const inventoryJewelrySalesValue = products.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);
    const inventoryAssetsCost = assets.reduce((acc, a) => acc + (a.unit_cost * a.stock), 0);
    const totalCapitalValue = inventoryJewelryCost + inventoryAssetsCost;

    // 4. Categories & Performance
    const categoryStats = Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(cat => {
        const items = products.filter(p => p.category === cat);
        const value = items.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);
        const clicks = items.reduce((acc, p) => acc + (p.whatsapp_clicks || 0), 0);
        return { name: cat as string, value, clicks, count: items.length };
    }).sort((a, b) => b.value - a.value).slice(0, 6);

    const lowStockAssets = assets.filter(a => a.stock <= a.min_stock).length;

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Calculando estadísticas dinámicas...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-700 pt-8 pb-24 px-4">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="font-serif text-4xl text-stone-900 dark:text-gold-200 tracking-[0.1em] mb-2 uppercase">Analítica</h1>
                    <p className="text-stone-400 text-[10px] font-sans tracking-widest uppercase font-bold">Inteligencia de Negocio & Rendimiento</p>
                </div>

                <Button
                    variant="outline"
                    onClick={handleResetAnalytics}
                    disabled={isResetting || products.length === 0}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-stone-200 dark:border-stone-800 rounded-xl px-6 h-12 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                >
                    <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
                    {isResetting ? 'Borrando...' : 'Reiniciar Clicks'}
                </Button>
            </div>

            {/* MAIN KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Financial Summary */}
                <div className="lg:col-span-2 bg-stone-950 dark:bg-black border border-stone-800 rounded-[2rem] p-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                        <DollarSign className="w-48 h-48 text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-8">
                            <Wallet className="w-4 h-4 text-gold-500" />
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">Cartera & Rentabilidad</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-stone-500 mb-2 tracking-widest">Ingresos Totales</p>
                                <p className="text-4xl font-serif text-white tracking-tight">{formatPrice(totalIncome, 'CLP')}</p>
                                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-green-400 uppercase tracking-widest bg-white/5 w-fit px-3 py-1 rounded-full border border-white/5">
                                    <ArrowUpRight className="w-3 h-3" /> Mes Actual: {formatPrice(monthlyIncome, 'CLP')}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-stone-500 mb-2 tracking-widest">Utilidad Estimada</p>
                                <p className={`text-4xl font-serif tracking-tight ${netProfit >= 0 ? 'text-gold-200' : 'text-red-400'}`}>
                                    {formatPrice(netProfit, 'CLP')}
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                    Balance General (Ingresos - Gastos)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Capital Tile */}
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[1.5rem] p-8 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <Layers className="w-4 h-4 text-gold-600" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Activo Fijo</h3>
                        </div>
                        <p className="text-3xl font-serif text-stone-900 dark:text-white mb-2 tracking-tight">{formatPrice(totalCapitalValue, 'CLP')}</p>
                        <p className="text-[10px] text-stone-400 font-medium uppercase tracking-[0.1em]">Capital en Inventario</p>
                    </div>

                    <div className="mt-8 space-y-3">
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold">
                            <span className="text-stone-400 tracking-tighter">Joyería</span>
                            <span className="text-stone-900 dark:text-stone-300">
                                {formatPrice(inventoryJewelryCost, 'CLP')}
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gold-400 transition-all duration-1000" style={{ width: `${(inventoryJewelryCost / (totalCapitalValue || 1)) * 100}%` }} />
                        </div>
                    </div>
                </div>

                {/* Potential Revenue */}
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[1.5rem] p-8 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Valor de Venta</h3>
                        </div>
                        <p className="text-3xl font-serif text-stone-900 dark:text-white mb-2 tracking-tight">{formatPrice(inventoryJewelrySalesValue, 'CLP')}</p>
                        <p className="text-[10px] text-stone-400 font-medium uppercase tracking-[0.1em]">Potencial de Recaudación</p>
                    </div>
                    <div className="mt-8 p-3 bg-gold-50 dark:bg-gold-900/10 rounded-xl border border-gold-100/50 dark:border-gold-800/50">
                        <p className="text-[9px] font-bold text-gold-600 dark:text-gold-400 uppercase tracking-[0.2em] mb-1">Margen Comercial Est.</p>
                        <p className="text-xl font-serif text-gold-700 dark:text-gold-300">
                            {(((inventoryJewelrySalesValue - inventoryJewelryCost) / (inventoryJewelrySalesValue || 1)) * 100).toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* INTEREST KPI */}
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[1.5rem] p-8 shadow-sm col-span-1 border-l-4 border-l-gold-500">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-2">
                            <MousePointerClick className="w-4 h-4 text-gold-600" />
                            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-stone-900 dark:text-white">Interés Digital</h3>
                        </div>
                        <Activity className="w-4 h-4 text-stone-300 animate-pulse" />
                    </div>

                    <div className="space-y-10">
                        <div>
                            <p className="text-5xl font-serif text-stone-900 dark:text-white tracking-tighter">{totalClicks}</p>
                            <p className="text-[10px] uppercase font-bold text-stone-400 mt-2 tracking-[0.15em]">Clicks en WhatsApp</p>
                        </div>
                        <div>
                            <p className="text-4xl font-serif text-stone-900 dark:text-white tracking-tighter">{engagementRate}</p>
                            <p className="text-[10px] uppercase font-bold text-stone-400 mt-2 tracking-[0.15em]">Interés Promedio / Pieza</p>
                        </div>
                        <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${lowStockAssets > 0 ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-stone-600 dark:text-stone-400">
                                    {lowStockAssets === 0 ? 'Stock de Insumos Óptimo' : `${lowStockAssets} Alertas de Reabastecimiento`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CATEGORY BREAKDOWN */}
                <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[1.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-10">
                        <PieChart className="w-4 h-4 text-stone-400" />
                        <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-stone-900 dark:text-white">Valor por Categoría</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {categoryStats.map((cat, idx) => (
                            <div key={cat.name} className="group">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-stone-50 dark:bg-stone-800 flex items-center justify-center text-[10px] font-bold text-stone-400 group-hover:bg-gold-500 group-hover:text-white transition-colors">
                                            0{idx + 1}
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-bold uppercase text-stone-900 dark:text-white block tracking-widest">{cat.name}</span>
                                            <span className="text-[10px] text-stone-400 font-medium tracking-tight">{cat.count} Variedades</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-stone-900 dark:text-white tracking-tight">{formatPrice(cat.value, 'CLP')}</div>
                                        <div className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">Potencial Venta</div>
                                    </div>
                                </div>
                                <div className="w-full h-1 bg-stone-50 dark:bg-stone-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-stone-900 dark:bg-gold-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${((cat.value / (inventoryJewelrySalesValue || 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* TOP PRODUCTS TABLE */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="px-10 py-8 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gold-50 dark:bg-gold-900/20 rounded-2xl">
                            <BarChart3 className="w-6 h-6 text-gold-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-stone-900 dark:text-white">Hottest Pieces</h2>
                            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mt-0.5">Ranking de Deseo (Top 10)</p>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {topProducts.map((p, idx) => (
                        <div key={p.id} className="flex items-center justify-between p-6 px-10 hover:bg-stone-50/50 dark:hover:bg-stone-800/10 transition-all group cursor-default">
                            <div className="flex items-center gap-10 min-w-0">
                                <span className={`text-xl font-serif font-bold w-6 text-center shrink-0 ${idx < 3 ? 'text-gold-600' : 'text-stone-300'}`}>
                                    {idx + 1}
                                </span>
                                <div className="relative w-16 h-20 bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0 rounded-xl shadow-md border border-stone-200/50 dark:border-stone-700">
                                    <img src={p.images[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-in-out" />
                                    <div className="absolute top-1 right-1 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-stone-500">
                                        {p.stock ?? 1} ud.
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-serif text-xl text-stone-900 dark:text-white truncate mb-1 group-hover:text-gold-600 transition-colors uppercase tracking-tight">{p.name}</h4>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-gold-600">{p.category}</span>
                                        {p.collection && (
                                            <span className="text-[10px] text-stone-400 uppercase tracking-widest border-l border-stone-200 dark:border-stone-800 pl-4">{p.collection}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl font-serif text-stone-900 dark:text-white font-bold tracking-tighter">{p.whatsapp_clicks || 0}</div>
                                    <div className="w-8 h-8 rounded-full bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center">
                                        <MousePointerClick className="w-4 h-4 text-gold-500" />
                                    </div>
                                </div>
                                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mt-2">Leads Generados</div>
                            </div>
                        </div>
                    ))}

                    {topProducts.length === 0 && (
                        <div className="p-24 text-center">
                            <AlertCircle className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                            <p className="text-[11px] text-stone-400 uppercase tracking-widest font-bold">No hay datos de interacción disponibles</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
