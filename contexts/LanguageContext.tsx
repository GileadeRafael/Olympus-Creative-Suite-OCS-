import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations, LanguageCode } from '../lib/i18n';

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (language: LanguageCode) => void;
    t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<LanguageCode>('en');

    const t = (key: string, replacements: Record<string, string | number> = {}) => {
        let translation = translations[language][key] || translations['en'][key] || key;
        Object.keys(replacements).forEach(placeholder => {
            translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
        });
        return translation;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
