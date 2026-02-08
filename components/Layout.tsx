import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { APP_NAME } from '../constants';
import { LayoutGrid, Sun, Moon, Store, LogOut, Award } from 'lucide-react';
import { ToastContainer, LoadingScreen } from './UI';
import { LoginPage } from '../pages/LoginPage';

export const Layout: React.FC<{
    children: React.ReactNode,
    view: 'public' | 'admin'
}> = ({ children, view }) => {
    const {
        darkMode, toggleDarkMode,
        currency, toggleCurrency,
        isAuthenticated, logout,
        activeAdminTab, setActiveAdminTab
    } = useStore();
    const navigate = useNavigate();

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? 'dark bg-stone-950' : 'bg-stone-50'}`}>

            {/* Top Bar */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur border-b border-stone-200 dark:border-stone-800 h-16 flex items-center justify-between px-4 md:px-6 transition-colors">

                {/* Logo Area */}
                <div className="flex items-center gap-4 md:gap-8">
                    <h1
                        className="font-serif text-lg md:text-2xl tracking-widest text-stone-900 dark:text-gold-200 cursor-pointer select-none"
                        onClick={() => navigate('/')}
                    >
                        {APP_NAME}
                    </h1>

                    {/* Nav Links - Admin Indicator Only */}
                    {view === 'admin' && (
                        <nav className="flex gap-3 md:gap-6 text-[10px] md:text-xs uppercase tracking-widest font-bold text-stone-500">
                            <span className="text-gold-500 py-2 px-1 border-b-2 border-gold-500 md:border-none">
                                Administración
                            </span>
                        </nav>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 md:gap-2">
                    {view === 'public' && (
                        <button onClick={toggleCurrency} className="p-2 md:p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors" title="Cambiar Moneda">
                            <span className="font-serif font-bold text-xs">{currency}</span>
                        </button>
                    )}
                    <button onClick={toggleDarkMode} className="p-2 md:p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 transition-colors" title="Cambiar Tema">
                        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full flex flex-col">
                {view === 'admin' ? (
                    isAuthenticated ? (
                        <div className="flex flex-1 min-h-[calc(100vh-64px)] overflow-hidden">
                            <aside className="w-72 border-r border-stone-100 dark:border-stone-800 bg-white dark:bg-[#0A0A0A] hidden lg:flex flex-col justify-between">
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
                                                    onClick={() => setActiveAdminTab('brand')}
                                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-sm text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${activeAdminTab === 'brand' ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}
                                                >
                                                    <Award className={`w-4 h-4 ${activeAdminTab === 'brand' ? 'text-gold-400' : ''}`} />
                                                    <span>Gestión de Marca</span>
                                                </button>
                                            </li>
                                            <li className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-900">
                                                <button
                                                    onClick={() => navigate('/')}
                                                    className="w-full flex items-center gap-4 px-4 py-3 text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-900 rounded-sm text-[11px] font-bold uppercase tracking-[0.15em] transition-all group"
                                                >
                                                    <Store className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    <span>Tienda Pública</span>
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                                <div className="p-8 border-t border-stone-50 dark:border-stone-800">
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-sm text-[11px] font-bold uppercase tracking-[0.15em] transition-all"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Cerrar Sesión</span>
                                    </button>
                                </div>
                            </aside>
                            <div className="flex-1 bg-stone-50 dark:bg-stone-950 overflow-y-auto">
                                {children}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-4">
                            {children}
                        </div>
                    )
                ) : (
                    children
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-stone-100 dark:border-stone-800 py-12 text-center text-[9px] text-stone-400 uppercase tracking-[0.3em] bg-white dark:bg-[#0A0A0A]">
                &copy; {new Date().getFullYear()} {APP_NAME}
            </footer>

            <ToastContainer />
        </div>
    );
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useStore();

    if (loading) return <LoadingScreen />;

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return <>{children}</>;
};
