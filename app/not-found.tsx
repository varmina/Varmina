'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            {/* Background Decor - Animated Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[120px] animate-pulse-gold pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-stone-900/5 dark:bg-white/5 rounded-full blur-[100px] animate-float pointer-events-none" />

            <div className="relative z-10 space-y-8 max-w-lg">
                {/* Visual Ornament */}
                <div className="flex justify-center items-center gap-4 animate-fade-in">
                    <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-gold-400" />
                    <div className="w-2 h-2 rotate-45 border border-gold-500" />
                    <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-gold-400" />
                </div>

                <div className="relative">
                    <h1 className="font-serif text-[120px] md:text-[180px] leading-none text-stone-200 dark:text-stone-900/40 tracking-tighter select-none animate-float opacity-50 dark:opacity-30">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <h2 className="text-xl md:text-2xl font-serif text-stone-900 dark:text-gold-200 uppercase tracking-[0.5em] animate-fade-in-up stagger-2">
                            Extraviado
                        </h2>
                    </div>
                </div>

                <div className="space-y-4 animate-fade-in-up stagger-3">
                    <p className="text-stone-500 dark:text-stone-400 font-sans text-xs md:text-sm uppercase tracking-[0.3em] font-bold">
                        La pieza que buscas no está en nuestra colección.
                    </p>
                    <div className="premium-divider w-16 mx-auto opacity-50" />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up stagger-4">
                    <Link
                        href="/"
                        className="group relative inline-flex items-center gap-3 bg-stone-900 dark:bg-gold-500 text-white dark:text-stone-900 px-10 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:shadow-gold-500/20"
                    >
                        <Home className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Retornar al Inicio</span>
                    </Link>

                    <button
                        onClick={() => typeof window !== 'undefined' && window.history.back()}
                        className="inline-flex items-center gap-3 px-10 py-4 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors text-[10px] font-bold uppercase tracking-[0.3em]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Regresar
                    </button>
                </div>
            </div>

            {/* Subtle Texture */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>
    );
}
