import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { LanguageCode } from '../lib/i18n';

interface Language {
  code: LanguageCode;
  name: string;
  flagUrl: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg' },
  { code: 'pt', name: 'Português', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg' },
  { code: 'es', name: 'Español', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg' },
  { code: 'zh', name: '中文', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg' },
  { code: 'fr', name: 'Français', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg' },
];

const LanguageSelector: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const [selectedLang, setSelectedLang] = useState<Language>(languages.find(l => l.code === language) || languages[0]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedLang(languages.find(l => l.code === language) || languages[0]);
    }, [language]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    const handleSelectLang = (lang: Language) => {
        setLanguage(lang.code);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative flex items-center">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-ocs-dark-hover transition-colors duration-200 ease-in-out focus:outline-none"
                title={t('select_language')}
                aria-label={t('select_language')}
            >
                <img src={selectedLang.flagUrl} alt={selectedLang.name} className="w-8 h-8 rounded-full object-cover" />
            </button>
            {isOpen && (
                <div className="absolute left-full ml-3 flex space-x-2 bg-gray-100 dark:bg-ocs-dark-sidebar p-2 rounded-full shadow-lg z-10">
                    {languages.filter(lang => lang.code !== selectedLang.code).map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelectLang(lang)}
                            className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-ocs-dark-hover transition-colors duration-200 ease-in-out transform hover:scale-110 focus:outline-none"
                            title={lang.name}
                            aria-label={t('switch_to_language', { languageName: lang.name })}
                        >
                             <img src={lang.flagUrl} alt={lang.name} className="w-8 h-8 rounded-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
