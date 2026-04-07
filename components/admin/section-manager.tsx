'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/context/StoreContext';
import { pageLayoutService, PageSection, SECTION_DEFAULTS } from '@/services/pageLayoutService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
    ChevronUp, ChevronDown, Trash2, Eye, EyeOff, Plus,
    Save, GripVertical, Settings2, ExternalLink, Image as ImageIcon
} from 'lucide-react';

// ─── Section Config Editors ────────────────────────────────────────────

const HeroConfigEditor = ({ config, onChange }: { config: Record<string, any>; onChange: (c: Record<string, any>) => void }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Título Principal" value={config.title || ''} onChange={e => onChange({ ...config, title: e.target.value })} className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 dark:text-white" />
        <Input label="Subtítulo" value={config.subtitle || ''} onChange={e => onChange({ ...config, subtitle: e.target.value })} className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 dark:text-white" />
        <div className="md:col-span-2">
            <Input label="URL Imagen de Fondo" value={config.image_url || ''} onChange={e => onChange({ ...config, image_url: e.target.value })} className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 dark:text-white" />
        </div>
        <Input label="Texto del Botón (CTA)" value={config.cta_text || ''} onChange={e => onChange({ ...config, cta_text: e.target.value })} placeholder="Dejar vacío para ocultar" className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 dark:text-white" />
        <Input label="Enlace del Botón" value={config.cta_link || '/'} onChange={e => onChange({ ...config, cta_link: e.target.value })} className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 dark:text-white" />
    </div>
);

const CatalogConfigEditor = ({ config, onChange }: { config: Record<string, any>; onChange: (c: Record<string, any>) => void }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Columnas (Desktop)</label>
            <select value={config.columns || 4} onChange={e => onChange({ ...config, columns: Number(e.target.value) })} className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg py-3 px-4 text-xs dark:text-white focus:outline-none focus:border-gold-500">
                <option value={2}>2 Columnas</option>
                <option value={3}>3 Columnas</option>
                <option value={4}>4 Columnas</option>
            </select>
        </div>
        <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Máx. Productos (0 = todos)</label>
            <input type="number" value={config.max_items || 0} onChange={e => onChange({ ...config, max_items: Number(e.target.value) })} onWheel={e => (e.target as HTMLInputElement).blur()} className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg py-3 px-4 text-xs dark:text-white focus:outline-none focus:border-gold-500" />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={config.show_search !== false} onChange={e => onChange({ ...config, show_search: e.target.checked })} className="w-4 h-4 accent-gold-500 rounded" />
            <span className="text-xs text-stone-600 dark:text-stone-300 font-bold uppercase tracking-wider">Mostrar Buscador</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={config.show_filters !== false} onChange={e => onChange({ ...config, show_filters: e.target.checked })} className="w-4 h-4 accent-gold-500 rounded" />
            <span className="text-xs text-stone-600 dark:text-stone-300 font-bold uppercase tracking-wider">Mostrar Filtros</span>
        </label>
    </div>
);

const FeaturedConfigEditor = ({ config, onChange }: { config: Record<string, any>; onChange: (c: Record<string, any>) => void }) => {
    const { attributes } = useStore();
    const collections = attributes.filter(a => a.type === 'collection');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Título de Sección" value={config.title || ''} onChange={e => onChange({ ...config, title: e.target.value })} className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 dark:text-white" />
            <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Colección</label>
                <div className="relative">
                    <select
                        value={config.collection_name || ''}
                        onChange={e => onChange({ ...config, collection_name: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg py-3 px-4 text-xs dark:text-white focus:outline-none focus:border-gold-500 appearance-none cursor-pointer"
                    >
                        <option value="">— Todas las piezas —</option>
                        {collections.map(col => (
                            <option key={col.id} value={col.name}>{col.name}</option>
                        ))}
                        {collections.length === 0 && <option value="" disabled>Gestiona colecciones en Configuración</option>}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Máx. Productos</label>
                <input type="number" value={config.max_items || 6} onChange={e => onChange({ ...config, max_items: Number(e.target.value) })} onWheel={e => (e.target as HTMLInputElement).blur()} className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg py-3 px-4 text-xs dark:text-white focus:outline-none focus:border-gold-500" />
            </div>
        </div>
    );
};

const TextConfigEditor = ({ config, onChange }: { config: Record<string, any>; onChange: (c: Record<string, any>) => void }) => (
    <div className="space-y-4">
        <Input label="Título" value={config.title || ''} onChange={e => onChange({ ...config, title: e.target.value })} className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 dark:text-white" />
        <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Contenido</label>
            <textarea value={config.body || ''} onChange={e => onChange({ ...config, body: e.target.value })} rows={4} className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-4 text-xs dark:text-white focus:outline-none focus:border-gold-500 resize-none" />
        </div>
        <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Alineación</label>
            <div className="flex gap-2">
                {(['left', 'center', 'right'] as const).map(a => (
                    <button key={a} onClick={() => onChange({ ...config, alignment: a })} className={`px-4 py-2 text-[10px] uppercase tracking-wider font-bold border rounded-lg transition-all ${config.alignment === a ? 'bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900' : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:border-stone-400'}`}>
                        {a === 'left' ? 'Izquierda' : a === 'center' ? 'Centro' : 'Derecha'}
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const ImageConfigEditor = ({ config, onChange }: { config: Record<string, any>; onChange: (c: Record<string, any>) => void }) => (
    <div className="space-y-4">
        <Input label="URL de Imagen" value={config.image_url || ''} onChange={e => onChange({ ...config, image_url: e.target.value })} className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 dark:text-white" />
        <Input label="Texto Alternativo (Alt)" value={config.alt_text || ''} onChange={e => onChange({ ...config, alt_text: e.target.value })} className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 dark:text-white" />
        <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={config.full_width !== false} onChange={e => onChange({ ...config, full_width: e.target.checked })} className="w-4 h-4 accent-gold-500 rounded" />
            <span className="text-xs text-stone-600 dark:text-stone-300 font-bold uppercase tracking-wider">Ancho Completo</span>
        </label>
        {config.image_url && (
            <div className="mt-2 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 max-h-48">
                <img src={config.image_url} alt={config.alt_text || 'Preview'} className="w-full h-full object-cover" />
            </div>
        )}
    </div>
);

const BannerConfigEditor = ({ config, onChange }: { config: Record<string, any>; onChange: (c: Record<string, any>) => void }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
            <Input label="Texto del Banner" value={config.text || ''} onChange={e => onChange({ ...config, text: e.target.value })} className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 dark:text-white" />
        </div>
        <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Color de Fondo</label>
            <div className="flex items-center gap-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2">
                <input type="color" className="w-10 h-10 rounded-md border-none cursor-pointer bg-transparent" value={config.bg_color || '#1c1917'} onChange={e => onChange({ ...config, bg_color: e.target.value })} />
                <code className="text-xs font-mono text-stone-500 uppercase">{config.bg_color}</code>
            </div>
        </div>
        <Input label="Texto del Botón" value={config.btn_text || ''} onChange={e => onChange({ ...config, btn_text: e.target.value })} placeholder="Dejar vacío para ocultar" className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 dark:text-white" />
        <Input label="Enlace del Botón" value={config.btn_link || '/'} onChange={e => onChange({ ...config, btn_link: e.target.value })} className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 dark:text-white" />
    </div>
);

const DividerConfigEditor = ({ config, onChange }: { config: Record<string, any>; onChange: (c: Record<string, any>) => void }) => (
    <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Estilo</label>
        <div className="flex gap-2">
            {(['line', 'space', 'ornament'] as const).map(s => (
                <button key={s} onClick={() => onChange({ ...config, style: s })} className={`px-4 py-2 text-[10px] uppercase tracking-wider font-bold border rounded-lg transition-all ${config.style === s ? 'bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900' : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:border-stone-400'}`}>
                    {s === 'line' ? 'Línea' : s === 'space' ? 'Espacio' : 'Ornamento'}
                </button>
            ))}
        </div>
    </div>
);

const CategoriesConfigEditor = ({ config, onChange }: { config: Record<string, any>; onChange: (c: Record<string, any>) => void }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Título de Sección" value={config.title || ''} onChange={e => onChange({ ...config, title: e.target.value })} className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 dark:text-white" />
        <Input label="Subtítulo (opcional)" value={config.subtitle || ''} onChange={e => onChange({ ...config, subtitle: e.target.value })} className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 dark:text-white" />
        <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Columnas (Desktop)</label>
            <select value={config.columns || 3} onChange={e => onChange({ ...config, columns: Number(e.target.value) })} className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg py-3 px-4 text-xs dark:text-white focus:outline-none focus:border-gold-500">
                <option value={2}>2 Columnas</option>
                <option value={3}>3 Columnas</option>
                <option value={4}>4 Columnas</option>
            </select>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={config.show_product_count !== false} onChange={e => onChange({ ...config, show_product_count: e.target.checked })} className="w-4 h-4 accent-gold-500 rounded" />
            <span className="text-xs text-stone-600 dark:text-stone-300 font-bold uppercase tracking-wider">Mostrar Cantidad de Productos</span>
        </label>
    </div>
);

const CollectionsConfigEditor = ({ config, onChange }: { config: Record<string, any>; onChange: (c: Record<string, any>) => void }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Título de Sección" value={config.title || ''} onChange={e => onChange({ ...config, title: e.target.value })} className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 dark:text-white" />
        <Input label="Subtítulo (opcional)" value={config.subtitle || ''} onChange={e => onChange({ ...config, subtitle: e.target.value })} className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 dark:text-white" />
        <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Columnas (Desktop)</label>
            <select value={config.columns || 2} onChange={e => onChange({ ...config, columns: Number(e.target.value) })} className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg py-3 px-4 text-xs dark:text-white focus:outline-none focus:border-gold-500">
                <option value={2}>2 Columnas</option>
                <option value={3}>3 Columnas</option>
                <option value={4}>4 Columnas</option>
            </select>
        </div>
        <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Máx. Colecciones (0 = todas)</label>
            <input type="number" value={config.max_items || 0} onChange={e => onChange({ ...config, max_items: Number(e.target.value) })} onWheel={e => (e.target as HTMLInputElement).blur()} className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg py-3 px-4 text-xs dark:text-white focus:outline-none focus:border-gold-500" />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={config.show_product_count !== false} onChange={e => onChange({ ...config, show_product_count: e.target.checked })} className="w-4 h-4 accent-gold-500 rounded" />
            <span className="text-xs text-stone-600 dark:text-stone-300 font-bold uppercase tracking-wider">Mostrar Cantidad de Productos</span>
        </label>
    </div>
);

const CONFIG_EDITORS: Record<string, React.FC<{ config: Record<string, any>; onChange: (c: Record<string, any>) => void }>> = {
    hero: HeroConfigEditor,
    catalog: CatalogConfigEditor,
    featured: FeaturedConfigEditor,
    categories: CategoriesConfigEditor,
    collections: CollectionsConfigEditor,
    text: TextConfigEditor,
    image: ImageConfigEditor,
    banner: BannerConfigEditor,
    divider: DividerConfigEditor,
};

// ─── Main Section Manager ──────────────────────────────────────────────

export const SectionManager: React.FC = () => {
    const { addToast } = useStore();
    const [sections, setSections] = useState<PageSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const fetchSections = useCallback(async () => {
        try {
            const data = await pageLayoutService.getAllSections('home');
            setSections(data);
        } catch (e) {
            addToast('error', 'Error al cargar secciones');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => { fetchSections(); }, [fetchSections]);

    // ── Handlers ──

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const updated = [...sections];
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        updated.forEach((s, i) => s.position = i);
        setSections(updated);
        setHasChanges(true);
    };

    const handleMoveDown = (index: number) => {
        if (index === sections.length - 1) return;
        const updated = [...sections];
        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        updated.forEach((s, i) => s.position = i);
        setSections(updated);
        setHasChanges(true);
    };

    const handleToggleVisibility = (id: string) => {
        setSections(prev => prev.map(s => s.id === id ? { ...s, is_visible: !s.is_visible } : s));
        setHasChanges(true);
    };

    const handleConfigChange = (id: string, newConfig: Record<string, any>) => {
        setSections(prev => prev.map(s => s.id === id ? { ...s, config: newConfig } : s));
        setHasChanges(true);
    };

    const handleAddSection = async (type: PageSection['section_type']) => {
        try {
            const defaults = SECTION_DEFAULTS[type];
            const newSection = await pageLayoutService.createSection({
                page_slug: 'home',
                section_type: type,
                position: sections.length,
                config: defaults.config,
            });
            if (newSection) {
                setSections(prev => [...prev, newSection]);
                setExpandedId(newSection.id);
                addToast('success', `Sección "${defaults.label}" agregada`);
            }
            setShowAddModal(false);
        } catch (e) {
            addToast('error', 'Error al agregar sección');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await pageLayoutService.deleteSection(id);
            setSections(prev => prev.filter(s => s.id !== id));
            if (expandedId === id) setExpandedId(null);
            addToast('success', 'Sección eliminada');
        } catch (e) {
            addToast('error', 'Error al eliminar sección');
        }
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            // Save order
            await pageLayoutService.reorderSections(sections.map(s => s.id));
            // Save each section's config and visibility
            await Promise.all(
                sections.map(s =>
                    pageLayoutService.updateSection(s.id, {
                        config: s.config,
                        is_visible: s.is_visible,
                        position: s.position,
                    })
                )
            );
            setHasChanges(false);
            addToast('success', 'Diseño de página guardado');
        } catch (e) {
            addToast('error', 'Error al guardar cambios');
        } finally {
            setIsSaving(false);
        }
    };

    // ── Render ──

    if (isLoading) return (
        <div className="py-24 flex justify-center">
            <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pt-6 pb-32 px-4 md:px-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-serif text-xl md:text-3xl text-stone-900 dark:text-gold-200 tracking-wider mb-1 uppercase">Diseñador de Página</h1>
                    <p className="text-stone-400 text-[10px] md:text-xs font-sans tracking-[0.2em] uppercase font-bold">Agrega, reordena y configura las secciones de tu tienda.</p>
                </div>
                <button
                    onClick={() => window.open('/', '_blank')}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-gold-500 transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden md:inline">Ver Tienda</span>
                </button>
            </div>

            {/* Section List */}
            {sections.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800">
                    <ImageIcon className="w-16 h-16 mx-auto mb-6 text-stone-200 dark:text-stone-700" />
                    <p className="font-serif text-lg text-stone-400 mb-6">No hay secciones configuradas</p>
                    <Button onClick={() => setShowAddModal(true)} className="bg-stone-900 text-white dark:bg-gold-500 dark:text-stone-900 rounded-full px-8 py-3 text-xs font-bold tracking-widest uppercase">
                        <Plus className="w-4 h-4 mr-2" /> Agregar Primera Sección
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {sections.map((section, index) => {
                        const meta = SECTION_DEFAULTS[section.section_type as keyof typeof SECTION_DEFAULTS];
                        const isExpanded = expandedId === section.id;
                        const ConfigEditor = CONFIG_EDITORS[section.section_type];

                        return (
                            <div key={section.id} className={`bg-white dark:bg-stone-900 rounded-xl border transition-all duration-300 ${isExpanded ? 'border-gold-500/50 shadow-lg shadow-gold-500/5' : 'border-stone-100 dark:border-stone-800'} ${!section.is_visible ? 'opacity-50' : ''}`}>
                                {/* Section Row */}
                                <div className="flex items-center gap-3 px-4 md:px-6 py-4">
                                    {/* Grip / Position */}
                                    <div className="flex flex-col items-center gap-0.5 text-stone-300 dark:text-stone-600">
                                        <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-0.5 hover:text-stone-600 dark:hover:text-stone-300 disabled:opacity-20 transition-colors">
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <GripVertical className="w-4 h-4 opacity-30" />
                                        <button onClick={() => handleMoveDown(index)} disabled={index === sections.length - 1} className="p-0.5 hover:text-stone-600 dark:hover:text-stone-300 disabled:opacity-20 transition-colors">
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Icon + Name */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{meta?.icon || '📦'}</span>
                                            <div>
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white">
                                                    {meta?.label || section.section_type}
                                                </h3>
                                                <p className="text-[10px] text-stone-400 uppercase tracking-wider">
                                                    Posición {index + 1}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleToggleVisibility(section.id)} className={`p-2 rounded-full transition-colors ${section.is_visible ? 'text-stone-400 hover:text-stone-600' : 'text-red-400 hover:text-red-600'}`} title={section.is_visible ? 'Ocultar' : 'Mostrar'}>
                                            {section.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => setExpandedId(isExpanded ? null : section.id)} className={`p-2 rounded-full transition-colors ${isExpanded ? 'text-gold-500 bg-gold-50 dark:bg-gold-900/10' : 'text-stone-400 hover:text-stone-600'}`} title="Configurar">
                                            <Settings2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(section.id)} className="p-2 rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors" title="Eliminar">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Config Editor */}
                                {isExpanded && ConfigEditor && (
                                    <div className="px-4 md:px-6 pb-6 pt-2 border-t border-stone-100 dark:border-stone-800">
                                        <ConfigEditor
                                            config={section.config}
                                            onChange={(newConfig) => handleConfigChange(section.id, newConfig)}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Section Button */}
            <button
                onClick={() => setShowAddModal(true)}
                className="w-full mt-4 py-4 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl text-stone-400 hover:text-gold-500 hover:border-gold-500/50 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
            >
                <Plus className="w-4 h-4" /> Agregar Sección
            </button>

            {/* Save FAB */}
            {hasChanges && (
                <div className="sticky bottom-4 md:bottom-8 left-0 right-0 flex justify-center z-40 px-4 mt-8">
                    <Button
                        onClick={handleSaveAll}
                        isLoading={isSaving}
                        size="lg"
                        className="shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] w-full md:w-auto px-12 gap-3 bg-stone-900 text-white hover:bg-black dark:bg-gold-500 dark:text-stone-900 dark:hover:bg-gold-400 rounded-full h-14 text-xs font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
                    >
                        <Save className="w-4 h-4" /> Guardar Cambios
                    </Button>
                </div>
            )}

            {/* Add Section Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Agregar Sección">
                <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(Object.entries(SECTION_DEFAULTS) as [PageSection['section_type'], typeof SECTION_DEFAULTS[keyof typeof SECTION_DEFAULTS]][]).map(([type, meta]) => (
                        <button
                            key={type}
                            onClick={() => handleAddSection(type)}
                            className="flex flex-col items-center gap-3 p-6 bg-stone-50 dark:bg-stone-800 hover:bg-gold-50 dark:hover:bg-gold-900/10 border border-stone-100 dark:border-stone-700 hover:border-gold-500/50 rounded-xl transition-all group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">{meta.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600 dark:text-stone-300 text-center leading-relaxed">
                                {meta.label}
                            </span>
                        </button>
                    ))}
                </div>
            </Modal>
        </div>
    );
};
