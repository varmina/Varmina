import React from 'react';
import { useStore } from '../../context/StoreContext';
import { BarChart3, TrendingUp, Package, Activity, MousePointerClick, ShoppingBag } from 'lucide-react';
import { ProductStatus } from '../../types';

export const AnalyticsDashboard: React.FC = () => {
    const { products } = useStore();

    // Stats Calculations
    const totalClicks = products.reduce((acc, p) => acc + (p.whatsapp_clicks || 0), 0);
    const topProducts = [...products]
        .sort((a, b) => (b.whatsapp_clicks || 0) - (a.whatsapp_clicks || 0))
        .slice(0, 10); // Show top 10 now

    const inStock = products.filter(p => p.status === ProductStatus.IN_STOCK).length;
    const totalProducts = products.length;
    const engagementRate = totalProducts > 0 ? (totalClicks / totalProducts).toFixed(1) : 0;

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pt-8 pb-24">

            <div className="mb-8 md:mb-12">
                <h1 className="font-serif text-3xl md:text-4xl text-stone-900 dark:text-gold-200 tracking-wider mb-2 uppercase">Analítica</h1>
                <p className="text-stone-400 text-[10px] md:text-sm font-sans tracking-wide uppercase font-bold">Rendimiento e Interés del Cliente</p>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">

                {/* Total Interest */}
                <div className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gold-100/50 dark:bg-gold-900/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gold-50 dark:bg-gold-900/20 text-gold-600 rounded-full">
                                <MousePointerClick className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-stone-500">Interés Total</h3>
                        </div>
                        <p className="text-4xl md:text-5xl font-serif text-stone-900 dark:text-white mb-2">{totalClicks}</p>
                        <p className="text-[9px] md:text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Clicks Históricos
                        </p>
                    </div>
                </div>

                {/* Engagement Rate */}
                <div className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-stone-100 dark:bg-stone-800 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full">
                                <Activity className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-stone-500">Ratio de Interés</h3>
                        </div>
                        <p className="text-4xl md:text-5xl font-serif text-stone-900 dark:text-white mb-2">{engagementRate}</p>
                        <p className="text-[9px] md:text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                            Clicks Promedio / Pieza
                        </p>
                    </div>
                </div>

                {/* Inventory Health */}
                <div className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-blue-50 dark:bg-blue-900/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full">
                                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-stone-500">Salud de Inventario</h3>
                        </div>
                        <p className="text-4xl md:text-5xl font-serif text-stone-900 dark:text-white mb-2">{inStock}<span className="text-lg md:text-xl text-stone-300">/{totalProducts}</span></p>
                        <p className="text-[9px] md:text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                            Piezas Disponibles
                        </p>
                    </div>
                </div>

            </div>

            {/* TOP PRODUCTS TABLE */}
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-sm overflow-hidden mb-12 lg:mb-0">
                <div className="px-6 md:px-8 py-4 md:py-6 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-gold-600" />
                        <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white">Ranking de Piezas (Top 10)</h2>
                    </div>
                </div>

                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {topProducts.map((p, idx) => (
                        <div key={p.id} className="flex items-center justify-between p-4 md:p-6 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group">
                            <div className="flex items-center gap-3 md:gap-6 min-w-0">
                                <span className={`text-sm md:text-lg font-serif font-bold w-6 md:w-8 flex-shrink-0 ${idx < 3 ? 'text-gold-600' : 'text-stone-300'}`}>
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                                <div className="relative w-10 h-12 md:w-12 md:h-16 bg-stone-100 dark:bg-stone-800 overflow-hidden flex-shrink-0">
                                    <img src={p.images[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                </div>
                                <div className="min-w-0 truncate">
                                    <h4 className="font-serif text-base md:text-lg text-stone-900 dark:text-white truncate">{p.name}</h4>
                                    <div className="flex gap-2">
                                        <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-stone-400">{p.category}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right pl-4 flex-shrink-0">
                                <div className="text-xl md:text-2xl font-serif text-stone-900 dark:text-white font-bold">{p.whatsapp_clicks || 0}</div>
                                <div className="text-[8px] md:text-[9px] uppercase tracking-widest text-gold-600">Interesados</div>
                            </div>
                        </div>
                    ))}

                    {topProducts.length === 0 && (
                        <div className="p-12 text-center text-stone-400 uppercase tracking-widest text-[10px]">
                            No hay datos suficientes aún.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
