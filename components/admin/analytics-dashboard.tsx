'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import {
    BarChart3, TrendingUp, Activity, MousePointerClick,
    RotateCcw, AlertCircle, DollarSign,
    Box, PieChart, Layers, ArrowUpRight
} from 'lucide-react';
import { ProductStatus } from '@/types';
import { supabaseProductService } from '@/services/supabaseProductService';
import { attributeService } from '@/services/attributeService';
import { Button } from '../ui/button';
import { formatPrice } from '@/lib/format';

export const AnalyticsDashboard: React.FC = () => {
    const { products, refreshProducts, addToast } = useStore();
    const [isResetting, setIsResetting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [masterCategories, setMasterCategories] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, [products]);

    const loadData = async () => {
        try {
            const attrCats = await attributeService.getByType('category');
            setMasterCategories(attrCats.map(c => c.name));
        } catch (error) {
            console.error('Error loading analytics categories:', error);
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

    // 2. Inventory Valuation (EXCLUSIVELY JEWELRY)
    const totalInventoryCost = products.reduce((acc, p) => acc + ((p.unit_cost || 0) * (p.stock || 0)), 0);
    const totalPotentialSales = products.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);
    const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);

    // 3. Categories & Performance (ONLY MASTER LIST CATEGORIES)
    const categoryStats = masterCategories.map(cat => {
        const items = products.filter(p => p.category === cat);
        const value = items.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);
        const clicks = items.reduce((acc, p) => acc + (p.whatsapp_clicks || 0), 0);
        return { name: cat, value, clicks, count: items.length };
    }).filter(c => c.count > 0 || c.clicks > 0).sort((a, b) => b.value - a.value);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Analizando inventario...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-700 pt-8 pb-24 px-4">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-stone-100 dark:border-stone-800 pb-12">
                <div>
                    <h1 className="font-serif text-4xl text-stone-900 dark:text-gold-200 tracking-[0.1em] mb-2 uppercase">Analítica</h1>
                    <p className="text-stone-400 text-[10px] font-sans tracking-[0.3em] uppercase font-bold">Rendimiento de Joyería e Inventario</p>
                </div>
            </div>

            {/* PRODUCT VALUATION GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Capital Card */}
                <div className="group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border-b-4 border-b-stone-900 dark:border-b-gold-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded-xl">
                            <Layers className="w-5 h-5 text-stone-600 dark:text-gold-400" />
                        </div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Inversión en Productos</h3>
                    </div>
                    <p className="text-4xl font-serif text-stone-900 dark:text-white mb-2 tracking-tight">
                        {formatPrice(totalInventoryCost, 'CLP')}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                        <span className="text-[11px] font-bold text-stone-900 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full uppercase tracking-widest">
                            {totalUnits} Unidades Totales
                        </span>
                    </div>
                </div>

                {/* Potential Card */}
                <div className="group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border-b-4 border-b-green-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-50 dark:bg-green-900/10 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Venta Proyectada</h3>
                    </div>
                    <p className="text-4xl font-serif text-stone-900 dark:text-white mb-2 tracking-tight">
                        {formatPrice(totalPotentialSales, 'CLP')}
                    </p>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-4">Valor de mercado del stock</p>
                </div>

                {/* Margin Card */}
                <div className="group bg-stone-950 dark:bg-black border border-stone-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <DollarSign className="w-24 h-24 text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                                <ArrowUpRight className="w-5 h-5 text-gold-400" />
                            </div>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Rentabilidad Bruta</h3>
                        </div>
                        <p className="text-5xl font-serif text-white mb-2 tracking-tighter italic">
                            {(((totalPotentialSales - totalInventoryCost) / (totalPotentialSales || 1)) * 100).toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-[0.2em] mt-4">Margen esperado sobre venta</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* INTEREST METRICS */}
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-sm border-l-8 border-l-gold-500">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <MousePointerClick className="w-5 h-5 text-gold-600" />
                            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-stone-900 dark:text-white">Interés Digital</h3>
                        </div>
                        <Activity className="w-4 h-4 text-stone-300 animate-pulse" />
                    </div>

                    <div className="space-y-12">
                        <div>
                            <p className="text-6xl font-serif text-stone-900 dark:text-white tracking-tighter">{totalClicks}</p>
                            <p className="text-[10px] uppercase font-bold text-stone-400 mt-2 tracking-[0.2em]">Leads de WhatsApp Totales</p>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-serif text-stone-900 dark:text-white tracking-tighter">{engagementRate}</p>
                                <span className="text-stone-400 text-xs font-bold uppercase">clicks/pieza</span>
                            </div>
                            <p className="text-[10px] uppercase font-bold text-stone-400 mt-2 tracking-[0.2em]">Tasa de Interés Promedio</p>
                        </div>
                    </div>
                </div>

                {/* CATEGORY PERFORMANCE */}
                <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-10">
                        <PieChart className="w-5 h-5 text-stone-400" />
                        <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-stone-900 dark:text-white">Desglose por Categoría Maestra</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {categoryStats.length === 0 ? (
                            <div className="text-center py-12 text-stone-400 uppercase text-[10px] tracking-widest font-bold">
                                No hay productos asociados a tus categorías aún
                            </div>
                        ) : categoryStats.map((cat, idx) => (
                            <div key={cat.name} className="group">
                                <div className="flex justify-between items-end mb-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-stone-50 dark:bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-400 group-hover:bg-gold-500 group-hover:text-black transition-all">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold uppercase text-stone-900 dark:text-white block tracking-[0.1em]">{cat.name}</span>
                                            <div className="flex gap-3 mt-1">
                                                <span className="text-[9px] text-stone-400 font-bold tracking-widest uppercase">{cat.count} Variedades</span>
                                                <span className="text-[9px] text-gold-600 font-bold tracking-widest uppercase">{cat.clicks} Clicks</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-base font-bold text-stone-900 dark:text-white tracking-tight">{formatPrice(cat.value, 'CLP')}</div>
                                        <div className="text-[8px] text-stone-400 uppercase tracking-widest font-bold">Potencial Venta</div>
                                    </div>
                                </div>
                                <div className="w-full h-1 bg-stone-50 dark:bg-stone-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-stone-900 dark:bg-gold-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${((cat.value / (totalPotentialSales || 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* PRODUCT RANKING */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="px-10 py-10 border-b border-stone-100 dark:border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gold-50 dark:bg-gold-900/20 rounded-2xl">
                            <BarChart3 className="w-7 h-7 text-gold-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold uppercase tracking-[0.3em] text-stone-900 dark:text-white">RANKING DE DESEO</h2>
                            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mt-1">Top 10 piezas con más consultas en WhatsApp</p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleResetAnalytics}
                        disabled={isResetting || products.length === 0}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-stone-200 dark:border-stone-800 rounded-xl px-6 h-12 hover:bg-stone-900 hover:text-white dark:hover:bg-gold-500 dark:hover:text-stone-900 transition-all shadow-sm"
                    >
                        <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
                        Reiniciar Métricas de Interés
                    </Button>
                </div>

                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {topProducts.map((p, idx) => (
                        <div key={p.id} className="flex items-center justify-between p-8 px-10 hover:bg-stone-50/50 dark:hover:bg-stone-800/10 transition-all group cursor-default">
                            <div className="flex items-center gap-10 min-w-0">
                                <span className={`text-2xl font-serif font-bold w-8 text-center shrink-0 ${idx < 3 ? 'text-gold-600' : 'text-stone-300'}`}>
                                    {idx + 1}
                                </span>
                                <div className="relative w-16 h-20 bg-stone-100 dark:bg-stone-800 shrink-0 rounded-xl overflow-hidden shadow-lg border border-stone-200/50 dark:border-stone-700">
                                    <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-serif text-2xl text-stone-900 dark:text-white truncate mb-1 group-hover:text-gold-600 transition-colors uppercase tracking-tight">{p.name}</h4>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-gold-600 bg-gold-50 dark:bg-gold-900/20 px-2 py-0.5 rounded">{p.category}</span>
                                        <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">{p.stock || 0} Unidades en Stock</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl font-serif text-stone-900 dark:text-white font-bold tracking-tighter">{p.whatsapp_clicks || 0}</div>
                                    <div className="w-10 h-10 rounded-full bg-stone-900 dark:bg-white flex items-center justify-center text-white dark:text-black">
                                        <MousePointerClick className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mt-2">Consultas</div>
                            </div>
                        </div>
                    ))}

                    {topProducts.length === 0 && (
                        <div className="p-32 text-center">
                            <AlertCircle className="w-16 h-16 text-stone-200 mx-auto mb-6" />
                            <p className="text-xs text-stone-400 uppercase tracking-[0.3em] font-bold">No hay datos de interacción registrados</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
