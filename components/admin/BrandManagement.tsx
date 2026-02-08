import React, { useState, useEffect } from 'react';
import { settingsService, BrandSettings } from '../../services/settingsService';
import { useStore } from '../../context/StoreContext';
import { Button, Input, LoadingScreen } from '../UI';
import { Globe, MessageCircle, Share2, Image as ImageIcon, Layout, BarChart3, Save, Bell, AlertTriangle, Mail, Activity } from 'lucide-react';

export const BrandManagement: React.FC = () => {
    const { addToast, products } = useStore();
    const [settings, setSettings] = useState<BrandSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsService.getSettings();
                setSettings(data);
            } catch (e) {
                addToast('error', 'Error al cargar configuración');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        setIsSaving(true);
        try {
            await settingsService.updateSettings(settings);
            addToast('success', 'Configuración de marca guardada');
        } catch (e) {
            addToast('error', 'Error al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="py-20 flex justify-center"><LoadingScreen /></div>;

    const topProducts = [...products]
        .sort((a, b) => (b.whatsapp_clicks || 0) - (a.whatsapp_clicks || 0))
        .slice(0, 5);

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
            <header className="mb-12">
                <h1 className="font-serif text-3xl text-stone-900 dark:text-gold-200 uppercase tracking-widest mb-2">Gestión de Marca</h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Controla la identidad y el rendimiento de Varmina</p>
            </header>

            <form onSubmit={handleSave} className="space-y-12 pb-24">

                {/* 1. ANALYTICS PREVIEW */}
                <section className="bg-stone-50 dark:bg-stone-900/30 border border-stone-100 dark:border-stone-800 p-8 rounded-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <BarChart3 className="w-5 h-5 text-gold-600" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-gold-100">Rendimiento de Interés</h2>
                    </div>
                    <div className="space-y-4">
                        {topProducts.map((p, idx) => (
                            <div key={p.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-mono text-stone-300">0{idx + 1}</span>
                                    <img src={p.images[0]} className="w-8 h-10 object-cover grayscale group-hover:grayscale-0 transition-all border border-stone-100 dark:border-stone-800" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-tight text-stone-700 dark:text-stone-300">{p.name}</p>
                                        <p className="text-[9px] text-stone-400 uppercase tracking-widest">{p.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-serif text-gold-600 font-bold">{p.whatsapp_clicks || 0}</p>
                                    <p className="text-[8px] text-stone-400 uppercase tracking-tighter">Clicks</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. NOTIFICACIONES Y ESTADO (NEW) */}
                <section className="space-y-8 bg-white dark:bg-stone-900/10 p-8 border border-stone-100 dark:border-stone-900 rounded-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Bell className="w-5 h-5 text-gold-600" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-gold-100">Avisos y Estado</h2>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-900/50 rounded-sm border border-stone-100 dark:border-stone-800">
                        <div className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Modo Mantenimiento</span>
                        </div>
                        <input
                            type="checkbox"
                            className="w-4 h-4 accent-gold-500"
                            checked={settings?.maintenance_mode}
                            onChange={e => setSettings(prev => ({ ...prev!, maintenance_mode: e.target.checked }))}
                        />
                    </div>

                    <Input
                        label="Barra de Anuncio (Texto)"
                        placeholder="Ej: Envío gratis por compras sobre $100.000"
                        value={settings?.announcement_text}
                        onChange={e => setSettings(prev => ({ ...prev!, announcement_text: e.target.value }))}
                    />

                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Color del Anuncio</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    className="w-10 h-10 bg-transparent border-none cursor-pointer"
                                    value={settings?.announcement_color}
                                    onChange={e => setSettings(prev => ({ ...prev!, announcement_color: e.target.value }))}
                                />
                                <code className="text-[10px] text-stone-400 uppercase">{settings?.announcement_color}</code>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-12"> {/* CHANGED TO SINGLE COLUMN */}

                    {/* 3. SEO & IDENTITY */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Globe className="w-5 h-5 text-gold-600" />
                            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-gold-100">Buscadores y SEO</h2>
                        </div>
                        <Input
                            label="Título del Sitio"
                            value={settings?.site_title}
                            onChange={e => setSettings(prev => ({ ...prev!, site_title: e.target.value }))}
                        />
                        <Input
                            label="Tipo de Cambio (1 USD = ? CLP)"
                            type="number"
                            value={settings?.usd_exchange_rate}
                            onChange={e => setSettings(prev => ({ ...prev!, usd_exchange_rate: Number(e.target.value) }))}
                        />
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Descripción Meta (Google)</label>
                            <textarea
                                className="w-full bg-transparent border border-stone-100 dark:border-stone-800 p-4 text-xs dark:text-white focus:outline-none focus:border-gold-500 transition-colors h-24"
                                value={settings?.site_description}
                                onChange={e => setSettings(prev => ({ ...prev!, site_description: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* 4. CONTACT & CONVERSION */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <MessageCircle className="w-5 h-5 text-gold-600" />
                            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-gold-100">Conversión y Contacto</h2>
                        </div>
                        <Input
                            label="Email de Contacto"
                            type="email"
                            placeholder="contacto@varmina.cl"
                            value={settings?.contact_email}
                            onChange={e => setSettings(prev => ({ ...prev!, contact_email: e.target.value }))}
                        />
                        <Input
                            label="WhatsApp (Número con código)"
                            placeholder="569XXXXXXXX"
                            value={settings?.whatsapp_number}
                            onChange={e => setSettings(prev => ({ ...prev!, whatsapp_number: e.target.value }))}
                        />
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Plantilla de Consulta</label>
                            <textarea
                                className="w-full bg-transparent border border-stone-100 dark:border-stone-800 p-4 font-mono text-[10px] dark:text-gold-100 focus:outline-none focus:border-gold-500 h-24"
                                value={settings?.whatsapp_template}
                                onChange={e => setSettings(prev => ({ ...prev!, whatsapp_template: e.target.value }))}
                            />
                            <p className="text-[8px] text-stone-400 uppercase tracking-widest">Usa {"{{product_name}}"} y {"{{product_id}}"} como marcadores.</p>
                        </div>
                    </div>

                    {/* 5. CONTENT / HERO SECTION */}
                    <div className="space-y-8 border-t border-stone-100 dark:border-stone-900 pt-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Layout className="w-5 h-5 text-gold-600" />
                            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-gold-100">Página de Inicio (Hero)</h2>
                        </div>
                        <Input
                            label="Título Principal"
                            value={settings?.hero_title}
                            onChange={e => setSettings(prev => ({ ...prev!, hero_title: e.target.value }))}
                        />
                        <Input
                            label="Subtítulo"
                            value={settings?.hero_subtitle}
                            onChange={e => setSettings(prev => ({ ...prev!, hero_subtitle: e.target.value }))}
                        />
                        <Input
                            label="URL Imagen Hero"
                            value={settings?.hero_image_url}
                            onChange={e => setSettings(prev => ({ ...prev!, hero_image_url: e.target.value }))}
                        />
                    </div>

                    {/* 6. SOCIAL & DESIGN */}
                    <div className="space-y-8 border-t border-stone-100 dark:border-stone-900 pt-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Share2 className="w-5 h-5 text-gold-600" />
                            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-gold-100">Redes y Diseño</h2>
                        </div>
                        <Input
                            label="Instagram URL"
                            value={settings?.instagram_url}
                            onChange={e => setSettings(prev => ({ ...prev!, instagram_url: e.target.value }))}
                        />
                        <Input
                            label="TikTok URL"
                            value={settings?.tiktok_url}
                            onChange={e => setSettings(prev => ({ ...prev!, tiktok_url: e.target.value }))}
                        />
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Color Primario de Marca</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="color"
                                        className="w-10 h-10 bg-transparent border-none cursor-pointer"
                                        value={settings?.primary_color}
                                        onChange={e => setSettings(prev => ({ ...prev!, primary_color: e.target.value }))}
                                    />
                                    <code className="text-[10px] text-stone-400 uppercase">{settings?.primary_color}</code>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 7. ANALYTICS (NEW) */}
                    <div className="space-y-8 border-t border-stone-100 dark:border-stone-900 pt-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="w-5 h-5 text-gold-600" />
                            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-gold-100">Analítica Avanzada</h2>
                        </div>
                        <Input
                            label="Google Analytics Measurement ID"
                            placeholder="G-XXXXXXXXXX"
                            value={settings?.google_analytics_id}
                            onChange={e => setSettings(prev => ({ ...prev!, google_analytics_id: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="sticky bottom-8 left-0 right-0 flex justify-center z-50">
                    <Button type="submit" isLoading={isSaving} size="lg" className="shadow-2xl px-12 gap-3 bg-stone-900 dark:bg-gold-600 dark:text-white">
                        <Save className="w-4 h-4" /> Guardar Todos los Cambios
                    </Button>
                </div>
            </form>
        </div>
    );
};
