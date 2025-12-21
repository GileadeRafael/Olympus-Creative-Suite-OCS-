import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { LanguageCode } from '../lib/i18n';
import { useGamification } from '../contexts/GamificationContext';
import { GamificationEvent } from '../constants/badges';

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

interface LanguageSelectorProps {
  activeChatId: string | 'new' | null;
}


const LanguageSelector: React.FC<LanguageSelectorProps> = ({ activeChatId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const { trackAction } = useGamification();
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
        trackAction(GamificationEvent.LANGUAGE_CHANGED, { code: lang.code, chatId: activeChatId });
        setLanguage(lang.code);
        setIsOpen(false);
    };

    const isSidebar = activeChatId !== null;
    const dropdownClasses = isSidebar 
        ? "left-full ml-4 bottom-0 flex-col space-y-2 bg-black/90 min-w-[48px]" // Sidebar: Open to the right of the pill
        : "top-full mt-3 left-1/2 -translate-x-1/2 flex-col space-y-2 bg-gray-100 dark:bg-ocs-dark-sidebar min-w-[48px]"; // Welcome Screen: Center

    return (
        <div ref={wrapperRef} className="relative flex items-center justify-center">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-gray-500 hover:bg-white/10 transition-colors duration-200 focus:outline-none"
                title={t('select_language')}
                aria-label={t('select_language')}
            >
                <img src={selectedLang.flagUrl} alt={selectedLang.name} className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover shadow-sm border border-white/10" />
            </button>
            {isOpen && (
                <div className={`absolute ${dropdownClasses} p-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-[100] border border-white/10 backdrop-blur-xl animate-modal-enter`}>
                    {languages.filter(lang => lang.code !== selectedLang.code).map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelectLang(lang)}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-200 transform hover:scale-110 focus:outline-none"
                            title={lang.name}
                            aria-label={t('switch_to_language', { languageName: lang.name })}
                        >
                             <img src={lang.flagUrl} alt={lang.name} className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover border border-white/10" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;