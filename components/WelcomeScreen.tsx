import React from 'react';
import { SparklesIcon } from './icons/CoreIcons';
import { useLanguage } from '../contexts/LanguageContext';

const WelcomeScreen: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="relative mb-4">
                <SparklesIcon className="w-16 h-16 text-ocs-accent" />
                <div className="absolute inset-0 -z-10 bg-ocs-accent blur-2xl rounded-full"></div>
            </div>
            <p className="text-zinc-500 dark:text-ocs-text-muted text-lg mb-2">{t('welcome_to_ocs')}</p>
            <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-12">
                {t('how_can_i_help')}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-500">{t('select_assistant_prompt')}</p>
        </div>
    );
};

export default WelcomeScreen;
