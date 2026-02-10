import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { APP_NAME } from '../constants';
import { Sun, Moon } from 'lucide-react';
import { ToastContainer, Logo, AppLoader } from './UI';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currency, toggleCurrency, settings, loading } = useStore();
    const { darkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? 'dark bg-stone-950' : 'bg-stone-50'}`}>
            {loading && <AppLoader />}

            {/* Announcement Bar */}
            {settings?.announcement_text && (
                <div
                    className="w-full py-2 px-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500"
                    style={{
                        backgroundColor: settings.announcement_color || '#b49f4c',
                        color: 'white'
                    }}
                >
                    {settings.announcement_text}
                </div>
            )}

            {/* Public Header */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur border-b border-stone-200 dark:border-stone-800 h-16 flex items-center justify-between px-4 md:px-6 transition-colors">

                {/* Logo Area */}
                <div className="flex items-center gap-4 md:gap-8">
                    <Logo />
                </div>

                {/* Public Actions */}
                <div className="flex items-center gap-1 md:gap-2">
                    <button onClick={toggleCurrency} className="p-2 md:p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors" title="Cambiar Moneda">
                        <span className="font-serif font-bold text-xs">{currency}</span>
                    </button>
                    <button onClick={toggleDarkMode} className="p-2 md:p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors" title="Cambiar Tema">
                        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => navigate('/admin')}
                        className="ml-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-gold-400 border border-transparent hover:border-stone-200 dark:hover:border-stone-800 rounded-sm transition-all"
                    >
                        Admin
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full flex flex-col items-center justify-start">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-stone-100 dark:border-stone-800 py-16 px-6 bg-white dark:bg-[#0A0A0A]">
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
                    {/* Social Links */}
                    <div className="flex items-center gap-6">
                        {settings?.instagram_url && (
                            <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Instagram</span>
                            </a>
                        )}
                        {settings?.tiktok_url && (
                            <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">TikTok</span>
                            </a>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <p className="text-[9px] text-stone-400 uppercase tracking-[0.4em] font-light">
                            &copy; {new Date().getFullYear()} {settings?.brand_name || APP_NAME}
                        </p>
                        <p className="text-[8px] text-stone-300 dark:text-stone-800 uppercase tracking-[0.2em]">
                            Santiago, Chile
                        </p>
                    </div>
                </div>
            </footer>

            <ToastContainer />
        </div>
    );
};
