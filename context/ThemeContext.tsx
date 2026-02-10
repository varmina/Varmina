import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface ThemeContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        // Check local storage or system preference
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('varmina_dark_mode');
            if (stored !== null) return stored === 'true';
            // Default to light mode unless explicitly set to dark
            return false;
        }
        return false;
    });

    const toggleDarkMode = useCallback(() => {
        setDarkMode(prev => !prev);
    }, []);

    // Effect to apply class
    useEffect(() => {
        localStorage.setItem('varmina_dark_mode', String(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
