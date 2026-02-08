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
        <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pt-4 md:pt-8 px-4 md:px-0">
            <h2 className="text-xl md:text-2xl font-serif text-stone-900 dark:text-white mb-6 md:mb-8 border-b border-stone-100 dark:border-stone-800 pb-4 uppercase tracking-widest">Configuración General</h2>
            <form onSubmit={handleSave} className="space-y-8 md:space-y-12 pb-24">

                {/* 2. NOTIFICACIONES Y ESTADO (NEW) */}
                <section className="space-y-6 md:space-y-8 bg-white dark:bg-stone-900/10 p-6 md:p-8 border border-stone-100 dark:border-stone-900 rounded-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Bell className="w-4 h-4 md:w-5 md:h-5 text-gold-600" />
                        <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-gold-100">Avisos y Estado</h2>
                    </div>

                    <div className="flex items-center justify-between p-3 md:p-4 bg-stone-50 dark:bg-stone-900/50 rounded-sm border border-stone-100 dark:border-stone-800">
                        <div className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
                            <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" />
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Modo Mantenimiento</span>
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
                            <label className="block text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Color del Anuncio</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    className="w-8 h-8 md:w-10 md:h-10 bg-transparent border-none cursor-pointer"
                                    value={settings?.announcement_color}
                                    onChange={e => setSettings(prev => ({ ...prev!, announcement_color: e.target.value }))}
                                />
                                <code className="text-[9px] md:text-[10px] text-stone-400 uppercase">{settings?.announcement_color}</code>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-8 md:gap-12">

                    {/* 3. SEO & IDENTITY */}
                    <div className="space-y-6 md:space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Globe className="w-4 h-4 md:w-5 md:h-5 text-gold-600" />
                            <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-gold-100">Buscadores y SEO</h2>
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
                            <label className="block text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-stone-400">Descripción Meta (Google)</label>
                            <textarea
                                className="w-full bg-transparent border border-stone-100 dark:border-stone-800 p-4 text-xs dark:text-white focus:outline-none focus:border-gold-500 transition-colors h-24"
                                value={settings?.site_description}
                                onChange={e => setSettings(prev => ({ ...prev!, site_description: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* 4. CONTACT & CONVERSION */}
                    <div className="space-y-6 md:space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-gold-600" />
                            <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-gold-100">Conversión y Contacto</h2>
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
                            <label className="block text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-stone-400">Plantilla de Consulta</label>
                            <textarea
                                className="w-full bg-transparent border border-stone-100 dark:border-stone-800 p-4 font-mono text-[9px] md:text-[10px] dark:text-gold-100 focus:outline-none focus:border-gold-500 h-24"
                                value={settings?.whatsapp_template}
                                onChange={e => setSettings(prev => ({ ...prev!, whatsapp_template: e.target.value }))}
                            />
                            <p className="text-[8px] text-stone-400 uppercase tracking-widest">Usa {"{{product_name}}"} y {"{{product_id}}"} como marcadores.</p>
                        </div>
                    </div>

                    {/* 5. CONTENT / HERO SECTION */}
                    <div className="space-y-6 md:space-y-8 border-t border-stone-100 dark:border-stone-900 pt-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Layout className="w-4 h-4 md:w-5 md:h-5 text-gold-600" />
                            <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-gold-100">Página de Inicio (Hero)</h2>
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
