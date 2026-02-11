import React, { useState, useEffect } from 'react';
import { settingsService, BrandSettings } from '../../services/settingsService';
import { useStore } from '../../context/StoreContext';
import { Button, Input, LoadingScreen } from '../UI';
import { Globe, MessageCircle, Share2, Layout, Save, Bell, AlertTriangle, Activity } from 'lucide-react';

// --- SETTINGS VIEW COMPONENT ---
export const SettingsView: React.FC = () => {
    const { addToast } = useStore();
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

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pt-6 pb-32 px-4 md:px-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl md:text-2xl font-serif text-stone-900 dark:text-white mb-2">Configuración</h2>
                    <p className="text-xs text-stone-500">Gestiona la identidad y funciones de tu marca.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6 md:space-y-8">

                {/* 1. NOTIFICACIONES Y ESTADO */}
                <section className="bg-white dark:bg-stone-900 rounded-xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-stone-100 dark:border-stone-800 p-5 md:p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-stone-100 dark:border-stone-800 pb-4">
                        <div className="p-2 bg-gold-50 dark:bg-gold-900/10 rounded-full">
                            <Bell className="w-4 h-4 md:w-5 md:h-5 text-gold-600" />
                        </div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white">Avisos y Estado</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-950/30 rounded-lg border border-stone-100 dark:border-stone-800">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                <div>
                                    <span className="block text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-200">Modo Mantenimiento</span>
                                    <span className="text-[10px] text-stone-500">Cierra la tienda al público temporalmente.</span>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings?.maintenance_mode || false}
                                    onChange={e => settings && setSettings({ ...settings, maintenance_mode: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 dark:peer-focus:ring-gold-800 rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gold-500"></div>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Barra de Anuncio (Texto)"
                                placeholder="Ej: Envío gratis por compras sobre $100.000"
                                value={settings?.announcement_text || ''}
                                onChange={e => settings && setSettings({ ...settings, announcement_text: e.target.value })}
                                className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 dark:text-white"
                            />
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Color del Anuncio</label>
                                <div className="flex items-center gap-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2">
                                    <input
                                        type="color"
                                        className="w-10 h-10 rounded-md border-none cursor-pointer bg-transparent"
                                        value={settings?.announcement_color || '#000000'}
                                        onChange={e => settings && setSettings({ ...settings, announcement_color: e.target.value })}
                                    />
                                    <code className="text-xs font-mono text-stone-500 uppercase">{settings?.announcement_color}</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* 2. SEO & IDENTITY */}
                    <section className="bg-white dark:bg-stone-900 rounded-xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-stone-100 dark:border-stone-800 p-5 md:p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-stone-100 dark:border-stone-800 pb-4">
                            <div className="p-2 bg-gold-50 dark:bg-gold-900/10 rounded-full">
                                <Globe className="w-4 h-4 md:w-5 md:h-5 text-gold-600" />
                            </div>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white">Buscadores y SEO</h2>
                        </div>
                        <div className="space-y-6">
                            <Input
                                label="Título del Sitio"
                                value={settings?.site_title || ''}
                                onChange={e => settings && setSettings({ ...settings, site_title: e.target.value })}
                                className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 dark:text-white"
                            />
                            <Input
                                label="Tipo de Cambio (CLP/USD)"
                                type="number"
                                value={settings?.usd_exchange_rate || ''}
                                onChange={e => settings && setSettings({ ...settings, usd_exchange_rate: Number(e.target.value) })}
                                className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 dark:text-white"
                            />
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Descripción Meta (Google)</label>
                                <textarea
                                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-4 text-xs font-medium dark:text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all h-24 resize-none"
                                    value={settings?.site_description || ''}
                                    onChange={e => settings && setSettings({ ...settings, site_description: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* 3. CONTACT & CONVERSION */}
                    <section className="bg-white dark:bg-stone-900 rounded-xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-stone-100 dark:border-stone-800 p-5 md:p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-stone-100 dark:border-stone-800 pb-4">
                            <div className="p-2 bg-gold-50 dark:bg-gold-900/10 rounded-full">
                                <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-gold-600" />
                            </div>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white">Conversión y Contacto</h2>
                        </div>
                        <div className="space-y-6">
                            <Input
                                label="Email de Contacto"
                                type="email"
                                placeholder="contacto@varmina.cl"
                                value={settings?.contact_email || ''}
                                onChange={e => settings && setSettings({ ...settings, contact_email: e.target.value })}
                                className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 dark:text-white"
                            />
                            <Input
                                label="WhatsApp (Número con código)"
                                placeholder="569XXXXXXXX"
                                value={settings?.whatsapp_number || ''}
                                onChange={e => settings && setSettings({ ...settings, whatsapp_number: e.target.value })}
                                className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 dark:text-white"
                            />
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Plantilla de Consulta</label>
                                <textarea
                                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-4 font-mono text-[10px] dark:text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 h-24 resize-none"
                                    value={settings?.whatsapp_template || ''}
                                    onChange={e => settings && setSettings({ ...settings, whatsapp_template: e.target.value })}
                                />
                                <p className="text-[9px] text-stone-400">Usa {"{{product_name}}"} y {"{{product_id}}"} como variables.</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* 4. CONTENT / HERO SECTION */}
                <section className="bg-white dark:bg-stone-900 rounded-xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-stone-100 dark:border-stone-800 p-5 md:p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-stone-100 dark:border-stone-800 pb-4">
                        <div className="p-2 bg-gold-50 dark:bg-gold-900/10 rounded-full">
                            <Layout className="w-4 h-4 md:w-5 md:h-5 text-gold-600" />
                        </div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white">Página de Inicio (Hero)</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Título Principal"
                            value={settings?.hero_title || ''}
                            onChange={e => settings && setSettings({ ...settings, hero_title: e.target.value })}
                            className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 dark:text-white"
                        />
                        <Input
                            label="Subtítulo"
                            value={settings?.hero_subtitle || ''}
                            onChange={e => settings && setSettings({ ...settings, hero_subtitle: e.target.value })}
                            className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 dark:text-white"
                        />
                        <div className="md:col-span-2">
                            <Input
                                label="URL Imagen Hero"
                                value={settings?.hero_image_url || ''}
                                onChange={e => settings && setSettings({ ...settings, hero_image_url: e.target.value })}
                                className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 dark:text-white"
                            />
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* 5. SOCIAL & DESIGN */}
                    <section className="bg-white dark:bg-stone-900 rounded-xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-stone-100 dark:border-stone-800 p-5 md:p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-stone-100 dark:border-stone-800 pb-4">
                            <div className="p-2 bg-gold-50 dark:bg-gold-900/10 rounded-full">
                                <Share2 className="w-4 h-4 md:w-5 md:h-5 text-gold-600" />
                            </div>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white">Redes y Diseño</h2>
                        </div>
                        <div className="space-y-6">
                            <Input
                                label="Instagram URL"
                                value={settings?.instagram_url || ''}
                                onChange={e => settings && setSettings({ ...settings, instagram_url: e.target.value })}
                                className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 dark:text-white"
                            />
                            <Input
                                label="TikTok URL"
                                value={settings?.tiktok_url || ''}
                                onChange={e => settings && setSettings({ ...settings, tiktok_url: e.target.value })}
                                className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 dark:text-white"
                            />
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Color Primario de Marca</label>
                                <div className="flex items-center gap-4 bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-700 rounded-lg p-2">
                                    <input
                                        type="color"
                                        className="w-10 h-10 rounded-md border-none cursor-pointer bg-transparent"
                                        value={settings?.primary_color || '#000000'}
                                        onChange={e => settings && setSettings({ ...settings, primary_color: e.target.value })}
                                    />
                                    <code className="text-xs font-mono text-stone-500 uppercase">{settings?.primary_color}</code>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 6. ANALYTICS */}
                    <section className="bg-white dark:bg-stone-900 rounded-xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-stone-100 dark:border-stone-800 p-5 md:p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-stone-100 dark:border-stone-800 pb-4">
                            <div className="p-2 bg-gold-50 dark:bg-gold-900/10 rounded-full">
                                <Activity className="w-4 h-4 md:w-5 md:h-5 text-gold-600" />
                            </div>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white">Analítica Avanzada</h2>
                        </div>
                        <div className="space-y-6">
                            <Input
                                label="Google Analytics Measurement ID"
                                placeholder="G-XXXXXXXXXX"
                                value={settings?.google_analytics_id || ''}
                                onChange={e => settings && setSettings({ ...settings, google_analytics_id: e.target.value })}
                                className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 rounded-lg py-3 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 placeholder:text-stone-400 dark:text-white"
                            />
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900">
                                <p className="text-[10px] text-blue-600 dark:text-blue-300 leading-relaxed">
                                    Conecta Google Analytics para rastrear visitas, conversiones y comportamiento de usuarios en tu tienda.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>


                <div className="sticky bottom-4 md:bottom-8 left-0 right-0 flex justify-center z-40 px-4">
                    <Button type="submit" isLoading={isSaving} size="lg" className="shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] w-full md:w-auto px-12 gap-3 bg-stone-900 text-white hover:bg-black dark:bg-gold-500 dark:text-stone-900 dark:hover:bg-gold-400 rounded-full h-14 text-xs font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95">
                        <Save className="w-4 h-4" /> Guardar Cambios
                    </Button>
                </div>
            </form>
        </div>
    );
};
