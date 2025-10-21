import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { User } from '@supabase/supabase-js';
import type { PersonalizedWelcomeItem } from '../App';
import type { Assistant } from '../types';
import { SparklesIcon } from './icons/CoreIcons';

const subtitles = [
    'welcome_subtitle_1',
    'welcome_subtitle_2',
    'welcome_subtitle_3',
    'welcome_subtitle_4',
];

const quotes = [
    'quote_1', 'quote_2', 'quote_3', 'quote_4', 'quote_5',
    'quote_6', 'quote_7', 'quote_8', 'quote_9', 'quote_10'
];

interface WelcomeScreenProps {
    user: User | null;
    personalizedData: PersonalizedWelcomeItem[] | null;
    onAssistantClick: (assistant: Assistant) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ user, personalizedData, onAssistantClick }) => {
    const { t, language } = useLanguage();
    const [greetingKey, setGreetingKey] = useState(0); // For re-triggering animation
    const [dynamicSubtitle] = useState(() => subtitles[Math.floor(Math.random() * subtitles.length)]);
    const [dynamicQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

    useEffect(() => {
        // Re-trigger the typing animation if the user logs in/out or language changes
        setGreetingKey(prev => prev + 1);
    }, [user, language]);
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return t('greeting_morning');
        if (hour >= 12 && hour < 18) return t('greeting_afternoon');
        return t('greeting_evening');
    };

    const username = user?.user_metadata?.username || 'User';
    const greetingText = t('personalized_greeting', { greeting: getGreeting(), username });

    const PersonalizedContent = () => {
        if (!personalizedData || personalizedData.length === 0) return null;

        const renderActivity = (activity: PersonalizedWelcomeItem, index: number) => {
            const { type, assistant, timeAgo, badgeName, badgeIcon } = activity;

            let iconElement: React.ReactNode;
            let textElement: React.ReactNode;

            switch (type) {
                case 'last_chat':
                    iconElement = <img src={assistant!.iconUrl} alt={assistant!.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover" />;
                    textElement = (
                        <>
                            {t('last_used_prompt_1')}{' '}
                            <button onClick={() => onAssistantClick(assistant!)} className="font-semibold text-white hover:underline">{assistant!.name}</button>{' '}
                            <span className="text-white/70">({t('last_used_prompt_2')} {timeAgo})</span>.
                        </>
                    );
                    break;
                case 'recent_badge':
                    iconElement = <span className="text-xl sm:text-2xl">{badgeIcon}</span>;
                    textElement = (
                        <>
                            {t('recent_badge_prompt_1')}{' '}
                            <span className="font-semibold text-white">"{badgeName}"</span>{' '}
                            <span className="text-white/70">({timeAgo})</span>.{' '}
                            {t('recent_badge_prompt_2')}
                        </>
                    );
                    break;
                case 'suggestion':
                    iconElement = <img src={assistant!.iconUrl} alt={assistant!.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover" />;
                    textElement = (
                        <>
                            {t('suggestion_prompt_1')}{' '}
                            <button onClick={() => onAssistantClick(assistant!)} className="font-semibold text-white hover:underline">{assistant!.name}</button>
                            {t('suggestion_prompt_2')}
                        </>
                    );
                    break;
                default:
                    return null;
            }

            return (
                <div key={index} className="flex items-center space-x-3 sm:space-x-4 w-full bg-white/10 px-3 py-2 rounded-2xl border border-white/10 shadow-lg text-left transition-all duration-300 hover:bg-white/20 hover:border-white/20 transform hover:scale-105">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-black/20 rounded-full flex items-center justify-center">
                        {iconElement}
                    </div>
                    <p className="text-xs sm:text-sm text-white/90">
                        {textElement}
                    </p>
                </div>
            );
        };

        return (
            <div className="mt-10 w-full max-w-md mx-auto space-y-3">
                {personalizedData.map(renderActivity)}
            </div>
        );
    };

    return (
        <div className="relative flex flex-col items-center justify-center h-full text-center overflow-hidden">
            {/* Animated background layer that will be blurred by the overlay */}
            <div className="absolute inset-0 w-full h-full aurora-background z-0"></div>
            
            {/* Glassmorphism overlay covering the whole screen */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6 py-4 bg-black/10 backdrop-blur-xl">
                <div className="max-w-3xl">
                    <h1
                        key={greetingKey}
                        className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 mx-auto animate-typing [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]"
                        style={{
                            '--animation-duration': `${(greetingText.length + 2) * 0.07}s`,
                            '--animation-steps': greetingText.length + 2,
                        } as React.CSSProperties}
                    >
                        {greetingText} <span className="animate-wave">👋</span>
                    </h1>
                    
                    <p className="text-zinc-200 text-lg md:text-xl mb-4 [text-shadow:0_1px_5px_rgba(0,0,0,0.5)]">
                        {t(dynamicSubtitle)}
                    </p>
                    
                    <PersonalizedContent />
                </div>

                {/* Footer content */}
                <div className="absolute bottom-4 md:bottom-8 left-0 right-0 px-6">
                     <div className="max-w-4xl mx-auto">
                        <p className="text-zinc-200/90 text-base [text-shadow:0_2px_8px_rgba(0,0,0,0.6)]">
                            "{t(dynamicQuote)}"
                        </p>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;