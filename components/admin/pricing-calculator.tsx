'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { formatPrice } from '@/lib/format';
import { Calculator, DollarSign, TrendingUp, Percent, Package, Gem, Info, Search, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/hooks/use-inventory';
import { Product } from '@/types';

interface CostItem {
    id: string;
    label: string;
    value: number;
}

const DEFAULT_MARKUP = 2.5; // 250% markup as default for jewelry

export const PricingCalculator: React.FC = () => {
    const { addToast } = useStore();
    const { products, loading: productsLoading } = useInventory();

    // मटेरियल costs
    const [costItems, setCostItems] = useState<CostItem[]>([
        { id: 'material', label: 'Costo Base (Producción/Compra)', value: 0 },
        { id: 'gems', label: 'Insumos / Piedras', value: 0 },
        { id: 'labor', label: 'Mano de Obra', value: 0 },
        { id: 'packaging', label: 'Empaque y Presentación', value: 0 },
        { id: 'shipping', label: 'Envío / Logística', value: 0 },
    ]);

    const [customCosts, setCustomCosts] = useState<CostItem[]>([]);
    const [markupMultiplier, setMarkupMultiplier] = useState(DEFAULT_MARKUP);
    const [targetPrice, setTargetPrice] = useState<number | ''>('');
    const [mode, setMode] = useState<'markup' | 'target'>('target');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const loadProduct = (product: Product) => {
        setSelectedProduct(product);
        setCostItems(prev => prev.map(item => {
            if (item.id === 'material') return { ...item, value: product.unit_cost || 0 };
            return { ...item, value: 0 };
        }));
        setCustomCosts([]);
        setTargetPrice(product.price);
        setMode('target');
        addToast('info', `Datos cargados de: ${product.name}`);
        setSearchTerm('');
    };

    const updateCostItem = (id: string, value: number) => {
        setCostItems((prev: CostItem[]) => prev.map((item: CostItem) => item.id === id ? { ...item, value } : item));
    };

    const addCustomCost = () => {
        setCustomCosts((prev: CostItem[]) => [...prev, {
            id: `custom-${Date.now()}`,
            label: 'Costo Adicional',
            value: 0
        }]);
    };

    const updateCustomCost = (id: string, field: 'label' | 'value', val: string | number) => {
        setCustomCosts((prev: CostItem[]) => prev.map((item: CostItem) =>
            item.id === id ? { ...item, [field]: val } : item
        ));
    };

    const removeCustomCost = (id: string) => {
        setCustomCosts((prev: CostItem[]) => prev.filter((item: CostItem) => item.id !== id));
    };

    // Calculations
    const calculations = useMemo(() => {
        const totalCost = [...costItems, ...customCosts].reduce((sum, item) => sum + item.value, 0);

        if (mode === 'markup') {
            const suggestedPrice = Math.round(totalCost * markupMultiplier);
            const grossProfit = suggestedPrice - totalCost;
            const marginPercent = suggestedPrice > 0 ? (grossProfit / suggestedPrice) * 100 : 0;
            const roi = totalCost > 0 ? (grossProfit / totalCost) * 100 : 0;
            return { totalCost, suggestedPrice, grossProfit, marginPercent, roi };
        } else {
            const priceVal = typeof targetPrice === 'number' ? targetPrice : 0;
            const grossProfit = priceVal - totalCost;
            const marginPercent = priceVal > 0 ? (grossProfit / priceVal) * 100 : 0;
            const roi = totalCost > 0 ? (grossProfit / totalCost) * 100 : 0;
            const impliedMarkup = totalCost > 0 ? priceVal / totalCost : 0;
            return { totalCost, suggestedPrice: priceVal, grossProfit, marginPercent, roi, impliedMarkup };
        }
    }, [costItems, customCosts, markupMultiplier, targetPrice, mode]);

    const handleReset = () => {
        setCostItems((prev: CostItem[]) => prev.map((item: CostItem) => ({ ...item, value: 0 })));
        setCustomCosts([]);
        setMarkupMultiplier(DEFAULT_MARKUP);
        setTargetPrice('');
        setSelectedProduct(null);
        addToast('success', 'Calculadora reiniciada');
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    const productRoiList = products
        .filter(p => p.unit_cost && p.unit_cost > 0)
        .map(p => {
            const cost = p.unit_cost || 0;
            const profit = p.price - cost;
            const roi = (profit / cost) * 100;
            const margin = (profit / p.price) * 100;
            return { ...p, roi, margin, profit };
        })
        .sort((a, b) => b.roi - a.roi);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-gold-200 uppercase tracking-wider flex items-center gap-3">
                        <Calculator className="w-8 h-8 text-gold-500" />
                        Analítica de ROI y Precios
                    </h1>
                    <p className="text-stone-500 text-[10px] md:text-sm uppercase tracking-[0.2em] font-bold mt-1">Gabinete de control de rentabilidad e inversión</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={handleReset} className="text-[10px] font-bold uppercase tracking-widest border border-stone-200 dark:border-stone-800 rounded-xl px-6">
                        Reiniciar
                    </Button>
                </div>
            </div>

            {/* Top Section: Loading & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Product Search & Load */}
                <div className="lg:col-span-2 bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 flex items-center gap-2">
                        <Search className="w-4 h-4 text-gold-500" /> Cargar Producto de Inventario
                    </h3>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Buscar pieza para analizar ROI..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl pl-10 pr-4 py-3 text-xs outline-none focus:border-gold-500 transition-all dark:text-white uppercase tracking-wider"
                        />
                        {searchTerm && filteredProducts.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                {filteredProducts.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => loadProduct(p)}
                                        className="w-full flex items-center gap-4 p-4 hover:bg-gold-50 dark:hover:bg-gold-900/10 transition-colors border-b border-stone-100 dark:border-stone-800 last:border-0"
                                    >
                                        <img src={p.images[0]} alt="" className="w-10 h-10 rounded object-cover shadow-sm" />
                                        <div className="text-left">
                                            <p className="text-xs font-bold uppercase tracking-wide text-stone-900 dark:text-white">{p.name}</p>
                                            <p className="text-[10px] text-stone-500 uppercase">Costo: {formatPrice(p.unit_cost || 0)} | Precio: {formatPrice(p.price)}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 ml-auto text-gold-500" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {selectedProduct ? (
                        <div className="flex items-center gap-4 p-4 bg-gold-50/50 dark:bg-gold-900/10 rounded-xl border border-gold-100 dark:border-gold-900/30">
                            <img src={selectedProduct.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover shadow-md" />
                            <div>
                                <p className="text-[10px] text-gold-600 font-bold uppercase tracking-widest mb-1">Analizando Pieza</p>
                                <h4 className="text-sm font-serif text-stone-900 dark:text-white uppercase tracking-wider">{selectedProduct.name}</h4>
                            </div>
                            <button onClick={() => setSelectedProduct(null)} className="ml-auto p-2 text-stone-400 hover:text-red-500">
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-stone-50 dark:bg-stone-950 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                            <Package className="w-8 h-8 mx-auto mb-3 text-stone-300" />
                            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Selecciona una pieza para cargar sus costos históricos</p>
                        </div>
                    )}
                </div>

                {/* Quick ROI Comparison */}
                <div className="lg:col-span-2 bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden flex flex-col">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 flex items-center justify-between">
                        <span>Top Rentabilidad (Inventario)</span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    </h3>
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[160px] scrollbar-hide">
                        {productRoiList.slice(0, 4).map(p => (
                            <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-[10px] font-bold text-stone-600 dark:text-white uppercase truncate max-w-[120px]">{p.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[11px] font-serif font-bold text-green-600">+{p.roi.toFixed(0)}% ROI</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left: Cost Inputs */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Standard Costs */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-6 md:p-8 shadow-sm">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Desglose de Costos
                        </h3>

                        {costItems.map(item => (
                            <div key={item.id} className="flex items-center gap-4">
                                <label className="flex-1 text-xs font-medium text-stone-700 dark:text-stone-300">{item.label}</label>
                                <div className="relative w-40">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">$</span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={item.value || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCostItem(item.id, Number(e.target.value))}
                                        onFocus={(e) => e.target.select()}
                                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                        placeholder="0"
                                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg pl-7 pr-3 py-2 text-sm text-right outline-none focus:border-gold-400 transition-colors dark:text-white"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Custom costs */}
                        {customCosts.map(item => (
                            <div key={item.id} className="flex items-center gap-3 bg-stone-50 dark:bg-stone-950 p-3 rounded-lg border border-dashed border-stone-200 dark:border-stone-800">
                                <input
                                    type="text"
                                    value={item.label}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCustomCost(item.id, 'label', e.target.value)}
                                    className="flex-1 bg-transparent text-xs font-medium text-stone-700 dark:text-stone-300 outline-none"
                                />
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">$</span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={item.value || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCustomCost(item.id, 'value', Number(e.target.value))}
                                        onFocus={(e) => e.target.select()}
                                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                        placeholder="0"
                                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg pl-7 pr-3 py-2 text-sm text-right outline-none focus:border-gold-400 dark:text-white"
                                    />
                                </div>
                                <button
                                    onClick={() => removeCustomCost(item.id)}
                                    className="text-stone-400 hover:text-red-500 text-xs"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={addCustomCost}
                            className="w-full py-2 border border-dashed border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-400 hover:text-gold-500 hover:border-gold-400 transition-colors"
                        >
                            + Agregar Costo Adicional
                        </button>
                    </div>

                    {/* Pricing Strategy */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-6 md:p-8 space-y-5 shadow-sm">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gold-500" /> Estrategia y Objetivos
                        </h3>

                        {/* Mode toggle */}
                        <div className="flex bg-stone-50 dark:bg-stone-950 p-1.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-inner">
                            <button
                                onClick={() => setMode('markup')}
                                className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'markup' ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900' : 'text-stone-500'}`}
                            >
                                Por Multiplicador
                            </button>
                            <button
                                onClick={() => setMode('target')}
                                className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'target' ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900' : 'text-stone-500'}`}
                            >
                                Precio Objetivo
                            </button>
                        </div>

                        {mode === 'markup' ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-stone-700 dark:text-stone-300">Multiplicador</label>
                                    <span className="text-lg font-serif font-bold text-gold-500">{markupMultiplier}x</span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    step={0.1}
                                    value={markupMultiplier}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMarkupMultiplier(Number(e.target.value))}
                                    className="w-full accent-gold-500"
                                />
                                <div className="flex justify-between text-[10px] text-stone-400 uppercase tracking-widest">
                                    <span>1x (Sin margen)</span>
                                    <span>10x (Premium)</span>
                                </div>
                                {/* Common presets */}
                                <div className="flex gap-2 pt-2">
                                    {[1.5, 2, 2.5, 3, 4, 5].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setMarkupMultiplier(m)}
                                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold border transition-all ${markupMultiplier === m ? 'bg-gold-500 text-white border-gold-600' : 'border-stone-200 dark:border-stone-700 text-stone-500 hover:border-gold-400'}`}
                                        >
                                            {m}x
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <label className="text-xs font-medium text-stone-700 dark:text-stone-300">Precio de Venta Deseado</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={targetPrice || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetPrice(e.target.value ? Number(e.target.value) : '')}
                                        onFocus={(e) => e.target.select()}
                                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                        placeholder="Ej: 250000"
                                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg pl-7 pr-4 py-3 text-lg font-serif text-right outline-none focus:border-gold-400 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Helpful Info */}
                        <div className="flex items-start gap-2 p-3 bg-stone-50 dark:bg-stone-950 rounded-lg text-[10px] text-stone-400 italic">
                            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <p>En joyería artesanal, un multiplicador de 2.5x–4x es estándar. Para piezas de alta gama o exclusivas, 4x–8x es común.</p>
                        </div>
                    </div>
                </div>

                {/* Right: Results Panel */}
                <div className="lg:col-span-2">
                    <div className="sticky top-6 space-y-6">
                        {/* Results Card */}
                        <div className="bg-stone-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <Gem className="w-28 h-28" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400">Resultado</h3>

                                {/* Total Cost */}
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Costo Total</p>
                                    <p className="text-2xl font-serif">{formatPrice(calculations.totalCost)}</p>
                                </div>

                                {/* Suggested Price */}
                                <div className="pt-4 border-t border-stone-800">
                                    <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">
                                        {mode === 'markup' ? 'Precio Sugerido' : 'Precio Objetivo'}
                                    </p>
                                    <p className="text-4xl font-serif text-gold-400">{formatPrice(calculations.suggestedPrice)}</p>
                                </div>

                                {/* Profit */}
                                <div className="pt-4 border-t border-stone-800">
                                    <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Ganancia Bruta</p>
                                    <p className={`text-xl font-serif ${calculations.grossProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {calculations.grossProfit >= 0 ? '+' : ''}{formatPrice(calculations.grossProfit)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl p-5 text-center">
                                <div className="inline-flex p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg mb-2">
                                    <Percent className="w-4 h-4" />
                                </div>
                                <p className="text-2xl font-serif font-bold text-stone-900 dark:text-white">{calculations.marginPercent.toFixed(1)}%</p>
                                <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">Margen</p>
                            </div>
                            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl p-5 text-center">
                                <div className="inline-flex p-2 bg-gold-100 dark:bg-gold-500/10 text-gold-600 rounded-lg mb-2">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <p className="text-2xl font-serif font-bold text-stone-900 dark:text-white">{calculations.roi.toFixed(0)}%</p>
                                <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">ROI</p>
                            </div>
                        </div>

                        {/* Target mode: Show implied markup */}
                        {mode === 'target' && calculations.totalCost > 0 && (
                            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-6 text-center shadow-sm">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-2 font-bold">Multiplicador Logrado</p>
                                <p className="text-4xl font-serif font-bold text-gold-500">
                                    {((calculations as any).impliedMarkup || 0).toFixed(2)}x
                                </p>
                                <p className="text-[9px] text-stone-400 mt-2 italic uppercase tracking-widest">Efectividad de la inversión</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Full Inventory ROI List */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-950/20">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">Desempeño Global de Inversión</h3>
                    <span className="text-[10px] bg-stone-200 dark:bg-stone-800 px-3 py-1 rounded-full text-stone-500 font-bold uppercase tracking-widest">
                        {productRoiList.length} Piezas Analizadas
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-stone-50/10 dark:bg-stone-950/30 text-[9px] uppercase tracking-[0.2em] text-stone-400 border-b border-stone-100 dark:border-stone-800">
                                <th className="p-5 font-bold">Producto</th>
                                <th className="p-5 font-bold text-right">Costo unit.</th>
                                <th className="p-5 font-bold text-right">Precio Venta</th>
                                <th className="p-5 font-bold text-right">Ganancia</th>
                                <th className="p-5 font-bold text-center">Margen</th>
                                <th className="p-5 font-bold text-center">ROI</th>
                                <th className="p-5 font-bold text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                            {productRoiList.map(p => (
                                <tr key={p.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/20 group transition-colors">
                                    <td className="p-5 flex items-center gap-3">
                                        <img src={p.images[0]} className="w-8 h-8 rounded object-cover shadow-sm bg-stone-100" />
                                        <span className="text-xs font-bold uppercase tracking-wide text-stone-900 dark:text-white truncate max-w-[200px]">{p.name}</span>
                                    </td>
                                    <td className="p-5 text-right text-xs font-mono text-stone-500">{formatPrice(p.unit_cost || 0)}</td>
                                    <td className="p-5 text-right text-xs font-mono font-medium">{formatPrice(p.price)}</td>
                                    <td className="p-5 text-right text-xs font-mono text-green-600 font-bold">+{formatPrice(p.profit)}</td>
                                    <td className="p-5 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{p.margin.toFixed(1)}%</span>
                                            <div className="w-12 h-1 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-stone-900 dark:bg-gold-500" style={{ width: `${p.margin}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-widest ${p.roi > 200 ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-gold-50 text-gold-700 dark:bg-gold-900/20'}`}>
                                            {p.roi.toFixed(0)}% ROI
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <button
                                            onClick={() => loadProduct(p)}
                                            className="p-2 text-stone-400 hover:text-gold-500 hover:bg-gold-50 dark:hover:bg-gold-900/20 rounded-lg transition-all"
                                            title="Analizar en profundidad"
                                        >
                                            <Calculator className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

