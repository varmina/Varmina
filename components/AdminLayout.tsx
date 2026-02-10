import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext'; // Added useTheme import
import { useAuth } from '../context/AuthContext';
import { APP_NAME } from '../constants';
import { LayoutGrid, Sun, Moon, Store, LogOut, Award, BarChart3, DollarSign } from 'lucide-react';
import { ToastContainer } from './UI';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { darkMode, toggleDarkMode } = useTheme(); // Changed to useTheme
    const { // Remaining items from useStore
        activeAdminTab, setActiveAdminTab,
        addToast
    } = useStore();
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut();
            addToast('success', 'Sesión cerrada');
            navigate('/');
        } catch (err) {
            console.error('Logout failed:', err);
            navigate('/'); // Force redirection anyway
        }
    };

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? 'dark bg-stone-950' : 'bg-stone-50'}`}>

            {/* Admin Header */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur border-b border-stone-200 dark:border-stone-800 h-16 flex items-center justify-between px-4 md:px-6 transition-colors">

                {/* Logo & Indicator */}
                <div className="flex items-center gap-4 md:gap-8">
                    <h1
                        className="font-serif text-lg md:text-2xl tracking-widest text-stone-900 dark:text-gold-200 cursor-pointer select-none"
                        onClick={() => navigate('/')}
                    >
                        {APP_NAME}
                    </h1>
                    <nav className="flex gap-3 md:gap-6 text-[10px] md:text-xs uppercase tracking-widest font-bold text-stone-500">
                        <span className="text-gold-500 py-2 px-1 border-b-2 border-gold-500 md:border-none">
                            Administración
                        </span>
                    </nav>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 md:gap-2">
                    <button onClick={toggleDarkMode} className="p-2 md:p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors" title="Cambiar Tema">
                        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-2 md:p-3 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full text-red-400 transition-colors"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Admin Layout Structure */}
            <div className="flex flex-1 min-h-[calc(100vh-64px)] overflow-hidden">

                {/* Desktop Sidebar */}
                <aside className="w-72 border-r border-stone-100 dark:border-stone-800 bg-white dark:bg-[#0A0A0A] hidden lg:flex flex-col justify-between transition-colors">
                    <div className="p-8">
                        <div className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.2em] mb-8">Administración</div>
                        <nav>
                            <ul className="space-y-4">
                                <li>
                                    <button
                                        onClick={() => setActiveAdminTab('inventory')}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-sm text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${activeAdminTab === 'inventory' ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}
                                    >
                                        <LayoutGrid className={`w-4 h-4 ${activeAdminTab === 'inventory' ? 'text-gold-400' : ''}`} />
                                        <span>Inventario</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveAdminTab('analytics')}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-sm text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${activeAdminTab === 'analytics' ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}
                                    >
                                        <BarChart3 className={`w-4 h-4 ${activeAdminTab === 'analytics' ? 'text-gold-400' : ''}`} />
                                        <span>Analítica</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveAdminTab('finance')}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-sm text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${activeAdminTab === 'finance' ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}
                                    >
                                        <DollarSign className={`w-4 h-4 ${activeAdminTab === 'finance' ? 'text-gold-400' : ''}`} />
                                        <span>Finanzas</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveAdminTab('settings')}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-sm text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${activeAdminTab === 'settings' ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}
                                    >
                                        <Award className={`w-4 h-4 ${activeAdminTab === 'settings' ? 'text-gold-400' : ''}`} />
                                        <span>Configuración</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => window.open('/', '_blank')}
                                        className="w-full flex items-center gap-4 px-4 py-3 text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-900 rounded-sm text-[11px] font-bold uppercase tracking-[0.15em] transition-all group"
                                    >
                                        <Store className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        <span>Ver Tienda</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                    {/* Simplified Logout in Sidebar Bottom */}
                    <div className="p-8 border-t border-stone-50 dark:border-stone-800">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-sm text-[11px] font-bold uppercase tracking-[0.15em] transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 bg-stone-50 dark:bg-stone-950 overflow-y-auto pb-20 lg:pb-0 scrollbar-thin">
                    {children}
                </div>

                {/* Mobile Bottom Nav */}
                <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-stone-900/90 backdrop-blur border-t border-stone-200 dark:border-stone-800 lg:hidden px-2 py-1">
                    <ul className="flex items-center justify-around h-16">
                        <li>
                            <button
                                onClick={() => setActiveAdminTab('inventory')}
                                className={`flex flex-col items-center gap-1 p-2 transition-all ${activeAdminTab === 'inventory' ? 'text-stone-900 dark:text-gold-400' : 'text-stone-400'}`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Piezas</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveAdminTab('analytics')}
                                className={`flex flex-col items-center gap-1 p-2 transition-all ${activeAdminTab === 'analytics' ? 'text-stone-900 dark:text-gold-400' : 'text-stone-400'}`}
                            >
                                <BarChart3 className="w-5 h-5" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Analítica</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveAdminTab('finance')}
                                className={`flex flex-col items-center gap-1 p-2 transition-all ${activeAdminTab === 'finance' ? 'text-stone-900 dark:text-gold-400' : 'text-stone-400'}`}
                            >
                                <DollarSign className="w-5 h-5" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Finanzas</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveAdminTab('settings')}
                                className={`flex flex-col items-center gap-1 p-2 transition-all ${activeAdminTab === 'settings' ? 'text-stone-900 dark:text-gold-400' : 'text-stone-400'}`}
                            >
                                <Award className="w-5 h-5" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Ajustes</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => window.open('/', '_blank')}
                                className="flex flex-col items-center gap-1 p-2 text-stone-400 hover:text-stone-900 dark:hover:text-gold-400 transition-all"
                            >
                                <Store className="w-5 h-5" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Tienda</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className="flex flex-col items-center gap-1 p-2 text-red-500/70"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Salir</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Admin Footer (Optional, usually omitted in dashboards to save space, but kept for consistency if needed) */}
            <footer className="lg:hidden border-t border-stone-100 dark:border-stone-800 py-4 text-center text-[8px] text-stone-400 uppercase tracking-[0.3em] bg-white dark:bg-[#0A0A0A] mb-16">
                &copy; {new Date().getFullYear()} {APP_NAME} Admin
            </footer>

            <ToastContainer />
        </div>
    );
};
