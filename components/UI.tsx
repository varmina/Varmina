import React, { Fragment, ReactNode } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductStatus } from '../types';
import { X, Check, Info, Loader2 } from 'lucide-react';

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', isLoading, className = '', ...props
}) => {
  const base = "inline-flex items-center justify-center uppercase tracking-[0.2em] font-serif transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#1A1A1A] text-white hover:bg-gold-500 active:bg-black",
    secondary: "bg-gold-400 text-white hover:bg-gold-500",
    outline: "border border-stone-200 text-stone-900 hover:border-stone-900 dark:border-stone-700 dark:text-stone-100",
    ghost: "text-stone-400 hover:text-stone-900 dark:text-stone-500 dark:hover:text-white transition-colors",
    danger: "text-red-500 hover:text-red-700 hover:bg-red-50 px-2 rounded-full transition-all",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[10px]",
    md: "px-8 py-2.5 text-xs font-bold",
    lg: "px-10 py-3.5 text-sm font-bold",
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {isLoading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

// --- INPUT ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={generatedId}
          className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-stone-400 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={generatedId}
        name={props.name || generatedId}
        className={`w-full bg-transparent border-b border-stone-300 py-2.5 text-stone-900 font-serif text-lg focus:border-gold-400 focus:outline-none transition-colors dark:border-stone-700 dark:text-stone-100 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-[10px] text-red-500 mt-1 uppercase tracking-wider">{error}</span>}
    </div>
  );
};

// --- BADGE ---
export const StatusBadge: React.FC<{ status: ProductStatus }> = ({ status }) => {
  const styles = {
    [ProductStatus.IN_STOCK]: "bg-[#E6F4EA] text-[#1E8E3E] border-[#CEEAD6]",
    [ProductStatus.MADE_TO_ORDER]: "bg-[#FFF4E5] text-[#B45D00] border-[#FFE5C2]",
    [ProductStatus.SOLD_OUT]: "bg-[#F1F3F4] text-[#70757A] border-[#E8EAED]",
  };

  const labels = {
    [ProductStatus.IN_STOCK]: "DISPONIBLE",
    [ProductStatus.MADE_TO_ORDER]: "POR ENCARGO",
    [ProductStatus.SOLD_OUT]: "AGOTADO",
  };

  return (
    <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] border rounded-sm ${styles[status] || styles[ProductStatus.IN_STOCK]}`}>
      {labels[status] || status}
    </span>
  );
};

// --- MODAL ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className={`relative bg-white dark:bg-stone-900 w-full ${sizeClasses[size]} max-h-[100vh] md:max-h-[95vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-300 rounded-t-3xl md:rounded-2xl`}>
        {title ? (
          <div className="flex items-center justify-between p-6 md:p-8 border-b border-stone-100 dark:border-stone-800 sticky top-0 bg-white dark:bg-stone-900 z-10">
            <h3 className="font-serif text-xl md:text-2xl uppercase tracking-[0.1em] text-stone-900 dark:text-white">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-stone-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-[40] p-2 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md hover:bg-white dark:hover:bg-stone-800 rounded-full transition-colors border border-stone-100 dark:border-stone-800 shadow-sm"
          >
            <X className="w-4 h-4 text-stone-900 dark:text-white" />
          </button>
        )}
        <div className={title ? "p-6 md:p-8" : "p-0"}>
          {children}
        </div>
      </div>
    </div>
  );
};

// --- TOAST CONTAINER ---
export const ToastContainer = () => {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-4 px-6 py-4 shadow-2xl min-w-[320px] border-l-2
            animate-in slide-in-from-right duration-500
            ${toast.type === 'success' ? 'bg-white border-green-500 text-stone-800' : ''}
            ${toast.type === 'error' ? 'bg-white border-red-500 text-stone-800' : ''}
            ${toast.type === 'info' ? 'bg-[#1A1A1A] border-gold-400 text-white' : ''}
          `}
        >
          <div className="flex-shrink-0">
            {toast.type === 'success' && <Check className="w-4 h-4 text-green-500" />}
            {toast.type === 'error' && <X className="w-4 h-4 text-red-500" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-gold-400" />}
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider flex-1 leading-relaxed">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="p-1 hover:bg-stone-100 dark:hover:bg-white/10 rounded-full transition-colors opacity-50 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

// --- LOADING SCREEN ---
export const LoadingScreen: React.FC = () => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-50 dark:bg-stone-950 flex-col gap-6">
    <div className="relative">
      <div className="w-16 h-16 border-2 border-stone-200 dark:border-stone-800 rounded-full" />
      <div className="absolute inset-0 w-16 h-16 border-t-2 border-gold-400 rounded-full animate-spin" />
    </div>
    <div className="text-center">
      <h2 className="font-serif text-lg tracking-[0.3em] text-stone-900 dark:text-gold-200 uppercase mb-1">Varmina</h2>
      <div className="w-12 h-[1px] bg-gold-200 mx-auto" />
    </div>
  </div>
);

// --- SKELETON ---
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-stone-200 dark:bg-stone-800 ${className}`} />
);