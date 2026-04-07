/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

interface ThemeContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
    setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Always start with false (light mode) to match server render and avoid hydration mismatch.
    const [darkMode, setDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    // On first client mount, read the stored preference
    useEffect(() => {
        const stored = localStorage.getItem('varmina_dark_mode');
        if (stored === 'true') {
            setDarkMode(true);
        }
        setMounted(true);
    }, []);

    const toggleDarkMode = useCallback(() => {
        setDarkMode(prev => !prev);
    }, []);

    // Apply dark class and persist preference
    useEffect(() => {
        if (!mounted) return; // Don't persist on initial mount before reading storage
        localStorage.setItem('varmina_dark_mode', String(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode, mounted]);

    const contextValue = useMemo(() => ({ darkMode, toggleDarkMode, setDarkMode }), [darkMode, toggleDarkMode]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
