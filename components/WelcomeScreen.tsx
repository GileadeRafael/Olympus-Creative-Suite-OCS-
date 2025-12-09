
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { User } from '@supabase/supabase-js';
import type { PersonalizedWelcomeItem } from '../App';
import type { Assistant } from '../types';
import { DiamondIcon } from './icons/CoreIcons';
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
    const backgroundRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setGreetingKey(prev => prev + 1);
    }, [user]);

    // Mouse Interaction Effect for Quantum Background
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!backgroundRef.current) return;

            const x = e.clientX;
            const y = e.clientY;
            const width = window.innerWidth;

            const ratio = x / width;
            const startColor = { r: 138, g: 93, b: 255 }; // Purple
            const endColor = { r: 204, g: 255, b: 0 };    // Lime

            const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
            const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
            const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);

            backgroundRef.current.style.background = `radial-gradient(
                800px circle at ${x}px ${y}px, 
                rgba(${r}, ${g}, ${b}, 0.15), 
                transparent 60%
            )`;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);
    
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

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#030303] overflow-x-hidden font-sans text-white selection:bg-lime-500/30">
            
            {/* --- Background Effects (Copied from AuthPage) --- */}
            <div className="absolute inset-0 z-0 bg-quantum-grid bg-quantum-plus pointer-events-none opacity-50"></div>
            <div 
                ref={backgroundRef}
                className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
                style={{
                    background: 'radial-gradient(800px circle at 50% 50%, rgba(138, 93, 255, 0.15), transparent 60%)'
                }}
            />

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
                    {/* Changed from flex overflow to grid for better mobile visibility */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 justify-center">
                        {visibleAssistants.map((assistant) => {
                            const isLocked = !unlockedAssistants.has(assistant.id);
                            return (
                                <button
                                    key={assistant.id}
                                    onClick={() => onAssistantClick(assistant)}
                                    className={`
                                        group relative w-full aspect-[3/4] sm:aspect-[3/4] md:h-64
                                        flex flex-col items-center justify-center
                                        bg-white/5 backdrop-blur-md rounded-3xl border border-white/10
                                        hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-2
                                        transition-all duration-300 ease-out
                                        overflow-visible
                                    `}
                                >
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
                                    <h3 className={`text-base sm:text-lg font-bold tracking-wide ${isLocked ? 'text-zinc-500' : 'text-white'}`}>
                                        {assistant.name}
                                    </h3>

                                    {/* Locked Badge */}
                                    {isLocked && (
                                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/60 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-white/10 text-white">
                                            <DiamondIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </div>
                                    )}
                                    
                                    {/* Subtle Glow on Hover - masked by parent bg but effectively highlights */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"></div>
                                </button>
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
