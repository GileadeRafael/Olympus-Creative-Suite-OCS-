import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { User } from '@supabase/supabase-js';
import type { PersonalizedWelcomeItem } from '../App';
import type { Assistant } from '../types';
import { DiamondIcon, InformationCircleIcon, XIcon } from './icons/CoreIcons';
import Avatar from './Avatar';
import LanguageSelector from './LanguageSelector';

interface WelcomeScreenProps {
    user: User | null;
    personalizedData: PersonalizedWelcomeItem[] | null;
    onAssistantClick: (assistant: Assistant) => void;
    assistants: Assistant[];
    unlockedAssistants: Set<string>;
    onLogout: () => void;
    onOpenBadges: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
    user, 
    onAssistantClick, 
    assistants, 
    unlockedAssistants,
    onLogout,
    onOpenBadges
}) => {
    const { t } = useLanguage();
    const [greetingKey, setGreetingKey] = useState(0);
    const [activeInfoCard, setActiveInfoCard] = useState<string | null>(null);

    useEffect(() => {
        setGreetingKey(prev => prev + 1);
    }, [user]);
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return t('greeting_morning');
        if (hour >= 12 && hour < 18) return t('greeting_afternoon');
        return t('greeting_evening');
    };

    const username = user?.user_metadata?.username || 'User';
    const greetingText = t('personalized_greeting', { greeting: getGreeting(), username });

    // Filter out hidden assistants (like Zora JSON hidden variant) for the main card view
    const visibleAssistants = assistants.filter(a => !a.excludeFromSidebar);

    const handleInfoClick = (e: React.MouseEvent, assistantId: string) => {
        e.stopPropagation();
        setActiveInfoCard(assistantId);
    };

    const handleCloseInfo = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveInfoCard(null);
    };

    return (
        <div 
            className="relative min-h-screen w-full flex flex-col overflow-x-hidden font-sans text-white selection:bg-lime-500/30"
            style={{
                backgroundImage: "url('https://i.imgur.com/jgJOxlU.jpeg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* --- Header (Navigation & Settings) --- */}
            <div className="relative z-20 w-full p-6 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center">
                    <img src="https://i.imgur.com/7P8v6DA.png" alt="Zion Peak Logo" className="h-10 w-auto" />
                </div>

                {/* Right Controls */}
                <div className="flex items-center space-x-4">
                    <LanguageSelector activeChatId={null} />
                    {user && <Avatar user={user} onOpenBadges={onOpenBadges} onLogout={onLogout} />}
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pb-10">
                
                {/* Greeting */}
                <div className="text-center mb-10 sm:mb-16 mt-4 sm:mt-0">
                    <h1
                        key={greetingKey}
                        className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight [text-shadow:0_4px_20px_rgba(0,0,0,0.5)] animate-fade-in-out"
                        style={{ animation: 'simpleFadeIn 1s ease-out forwards' }}
                    >
                        {greetingText}
                    </h1>
                </div>

                {/* Assistant Cards Grid - Mobile Optimized to Grid to prevent cutoff */}
                <div className="w-full max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 justify-center">
                        {visibleAssistants.map((assistant) => {
                            const isLocked = !unlockedAssistants.has(assistant.id);
                            const isInfoMode = activeInfoCard === assistant.id;

                            return (
                                <div
                                    key={assistant.id}
                                    onClick={() => !isInfoMode && onAssistantClick(assistant)}
                                    className={`
                                        group relative w-full aspect-[3/4] sm:aspect-[3/4] md:h-64
                                        flex flex-col items-center justify-center
                                        bg-white/5 backdrop-blur-md rounded-3xl border border-white/10
                                        ${!isInfoMode ? 'hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-2 cursor-pointer' : 'cursor-default'}
                                        transition-all duration-300 ease-out
                                        overflow-hidden
                                    `}
                                >
                                    {/* Info Button */}
                                    <button
                                        onClick={(e) => isInfoMode ? handleCloseInfo(e) : handleInfoClick(e, assistant.id)}
                                        className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-colors border border-white/10"
                                        aria-label="Toggle assistant info"
                                    >
                                        {isInfoMode ? <XIcon className="w-4 h-4" /> : <InformationCircleIcon className="w-4 h-4" />}
                                    </button>

                                    {/* Locked Badge */}
                                    {isLocked && !isInfoMode && (
                                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-black/60 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-white/10 text-white">
                                            <DiamondIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </div>
                                    )}

                                    {/* Normal Content */}
                                    <div className={`flex flex-col items-center justify-center w-full h-full p-4 transition-all duration-300 ${isInfoMode ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
                                        {/* Icon Container */}
                                        <div className={`
                                            w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full p-1 mb-4 sm:mb-6
                                            border-2 ${isLocked ? 'border-zinc-600 grayscale opacity-60' : `${assistant.ringColor} border-opacity-70`}
                                            transition-all duration-300 group-hover:scale-110
                                        `}>
                                            <img 
                                                src={assistant.iconUrl} 
                                                alt={assistant.name} 
                                                className={`w-full h-full object-cover rounded-full ${isLocked ? 'grayscale' : ''}`} 
                                            />
                                        </div>

                                        {/* Name */}
                                        <h3 className={`text-base sm:text-lg font-bold tracking-wide text-center ${isLocked ? 'text-zinc-500' : 'text-white'}`}>
                                            {assistant.name}
                                        </h3>
                                    </div>

                                    {/* Info Overlay Content */}
                                    <div className={`absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ${isInfoMode ? 'opacity-100 translate-y-0 z-20' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                                        <h4 className="text-white font-bold mb-2 text-lg">{assistant.name}</h4>
                                        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed overflow-y-auto custom-scrollbar max-h-[70%]">
                                            {t(assistant.descriptionKey)}
                                        </p>
                                    </div>
                                    
                                    {/* Subtle Glow on Hover (Only in normal mode) */}
                                    {!isInfoMode && (
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <div className="h-6"></div> {/* Bottom spacer */}
        </div>
    );
};

export default WelcomeScreen;