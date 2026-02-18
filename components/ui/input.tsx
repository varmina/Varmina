'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, hint, className = '', id, ...props }) => {
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
                onFocus={(e) => {
                    if (props.type === 'number') e.target.select();
                    props.onFocus?.(e);
                }}
                onWheel={(e) => {
                    if (props.type === 'number') (e.target as HTMLInputElement).blur();
                }}
                className={cn(
                    "w-full bg-transparent border-b border-stone-300 py-2.5 px-3 text-stone-900 font-serif text-lg focus:border-gold-400 focus:outline-none transition-colors dark:border-stone-700 dark:text-stone-100",
                    error && "border-red-500 focus:border-red-500",
                    className
                )}
                {...props}
                value={props.type === 'number' && (props.value === 0 || props.value === '0') ? '' : props.value}
            />
            {hint && !error && <span className="text-[10px] text-stone-400 mt-1 block">{hint}</span>}
            {error && <span className="text-[10px] text-red-500 mt-1 uppercase tracking-wider block">{error}</span>}
        </div>
    );
};
