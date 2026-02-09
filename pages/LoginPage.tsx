import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { Button, Input } from '../components/UI';
import { Shield } from 'lucide-react';
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

      addToast('success', 'Bienvenido');
      navigate('/admin');
    } catch (error: any) {
      console.error('Login failed:', error);
      addToast('error', error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 rounded-lg animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gold-500 border border-stone-200 dark:border-stone-700">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl text-stone-900 dark:text-white uppercase tracking-wider">Acceso Admin</h2>
          <p className="text-sm text-stone-500 mt-2">Gestión exclusiva para personal autorizado.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=""
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full py-3" isLoading={isLoading}>
            Ingresar al Sistema
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800 text-center">
          <p className="text-[10px] text-stone-400 uppercase tracking-widest">
            Varmina Joyas • Secure System
          </p>
        </div>
      </div>

      <button
        onClick={() => window.location.href = '/'}
        className="mt-8 text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-gold-400 transition-colors"
      >
        Volver a la tienda
      </button>
    </div>
  );
};