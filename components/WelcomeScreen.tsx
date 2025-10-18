import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { User } from '@supabase/supabase-js';
import type { PersonalizedWelcomeData } from '../App';
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
    personalizedData: PersonalizedWelcomeData | null;
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
        if (!personalizedData) return null;

        const { type, assistant, timeAgo, badgeName } = personalizedData;
        let content;

        switch (type) {
            case 'last_chat':
                content = (
                    <>
                        {t('last_used_prompt_1')} <button onClick={() => onAssistantClick(assistant!)} className="font-bold text-white hover:underline">{assistant!.name}</button> {t('last_used_prompt_2')} {timeAgo}.
                    </>
                );
                break;
            case 'recent_badge':
                content = (
                    <>
                       {t('recent_badge_prompt_1')} <span className="font-bold text-white">"{badgeName}"</span>! {t('recent_badge_prompt_2')} ✨
                    </>
                );
                break;
            case 'suggestion':
                content = (
                    <>
                       {t('suggestion_prompt_1')} <button onClick={() => onAssistantClick(assistant!)} className="font-bold text-white hover:underline">{assistant!.name}</button> {t('suggestion_prompt_2')}
                    </>
                );
                break;
            default:
                return null;
        }

        return (
            <div className="mt-8 flex items-center justify-center space-x-3 text-sm bg-white/20 px-4 py-2.5 rounded-full border border-white/10 shadow-lg">
                <SparklesIcon className="w-5 h-5 text-ocs-accent flex-shrink-0" />
                <p className="text-white/90">{content}</p>
            </div>
        );
    };

    return (
        <div className="relative flex flex-col items-center justify-center h-full text-center overflow-hidden">
            {/* Animated background layer that will be blurred by the overlay */}
            <div className="absolute inset-0 w-full h-full animate-background-pan z-0"></div>
            
            {/* Glassmorphism overlay covering the whole screen */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4 bg-black/10 backdrop-blur-xl">
                <div className="max-w-4xl">
                    <h1
                        key={greetingKey}
                        className="text-4xl md:text-5xl font-bold text-white mb-4 w-max mx-auto animate-typing [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]"
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

                    {personalizedData && (
                        <>
                            <div className="my-8 h-px w-48 bg-white/20 mx-auto"></div>
                            <p className="text-white/80 text-base [text-shadow:0_1px_5px_rgba(0,0,0,0.5)]">
                                {t('select_assistant_prompt')}
                            </p>
                        </>
                    )}
                </div>

                {/* Footer content */}
                <div className="absolute bottom-8 left-0 right-0 px-4">
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