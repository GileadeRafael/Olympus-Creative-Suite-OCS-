import React, { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from './icons/CoreIcons';
import { useLanguage } from '../contexts/LanguageContext';

type Theme = 'light' | 'dark';

const ThemeToggle: React.FC = () => {
    const { t } = useLanguage();
    // Initialize theme from localStorage or system preference, default to dark.
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'dark';
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) return savedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-ocs-dark-hover transition-colors duration-200 ease-in-out focus:outline-none"
            title={theme === 'light' ? t('switch_to_dark_mode') : t('switch_to_light_mode')}
            aria-label={theme === 'light' ? t('switch_to_dark_mode') : t('switch_to_light_mode')}
        >
            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
    );
};

export default ThemeToggle;
