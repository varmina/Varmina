import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/UI';
import { Shield, ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const { signIn } = useAuth();
  const { addToast } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      addToast('success', 'Bienvenido a Varmina');
      navigate('/admin');
    } catch (error: any) {
      console.error('Login failed:', error);
      addToast('error', error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-stone-900/5 dark:bg-white/5 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-stone-900 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-stone-100 dark:border-stone-800 rounded-3xl p-8 md:p-12 animate-in fade-in zoom-in-95 duration-700">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-stone-200 dark:border-stone-700 rotate-3 transform hover:rotate-6 transition-transform duration-500">
              <Shield className="w-8 h-8 text-stone-900 dark:text-gold-500" />
            </div>
            <h1 className="font-serif text-3xl text-stone-900 dark:text-white mb-2">Varmina Admin</h1>
            <p className="text-xs uppercase tracking-widest text-stone-400 font-bold">Portal de Gestión Exclusivo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-gold-600 transition-colors">Email Corporativo</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-4 text-sm font-medium outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all placeholder:text-stone-300 dark:text-white"
                    placeholder="admin@varmina.cl"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-green-500 opacity-0 transition-opacity duration-300" style={{ opacity: email.includes('@') ? 1 : 0 }} />
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-gold-600 transition-colors">Contraseña Segura</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-4 text-sm font-medium outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all dark:text-white"
                    placeholder="••••••••••••"
                    required
                  />
                  <Lock className="w-4 h-4 text-stone-300 absolute right-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full py-4 rounded-xl bg-stone-900 hover:bg-black dark:bg-gold-500 dark:text-stone-900 hover:dark:bg-gold-400 text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
                isLoading={isLoading}
              >
                <span>Ingresar al Sistema</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          <button
            onClick={() => window.location.href = '/'}
            className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-gold-400 transition-colors border-b border-transparent hover:border-stone-900 pb-1"
          >
            ← Volver a la Tienda Pública
          </button>
          <p className="mt-8 text-[9px] text-stone-300 uppercase tracking-widest">
            © 2026 Varmina Joyas • Sistema Seguro Encajonado
          </p>
        </div>
      </div>
    </div>
  );
};