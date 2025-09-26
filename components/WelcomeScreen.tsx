import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { User } from '@supabase/supabase-js';

const backgroundImages = [
    'https://framerusercontent.com/images/mSmNgk1C9cNIHhE0U3yBELUIFU8.jpg?scale-down-to=1024&width=1408&height=768',
    'https://framerusercontent.com/images/CPtl1afursmRT6kNb4AuFAtpNz4.jpg?scale-down-to=1024&width=1408&height=768',
    'https://framerusercontent.com/images/uuuwdccYPBow8BnYClXBf6slFuU.jpg?scale-down-to=1024&width=1408&height=768',
    'https://framerusercontent.com/images/HjAvwIQHDfICfBMUF6qrYQJ5yE.jpg?scale-down-to=1024&width=1408&height=768',
    'https://framerusercontent.com/images/fP5uYCbfSGxlTEWWqoJ4UcNko.jpg?scale-down-to=1024&width=1408&height=768',
    'https://framerusercontent.com/images/nnbbM9WXBIxAuwXDkLwJR65Jw.jpg?scale-down-to=1024&width=1408&height=768',
    'https://framerusercontent.com/images/6wdNhCQmoW3pUWhIeC3l6CyLVU.jpg?scale-down-to=1024&width=1408&height=768',
    'https://framerusercontent.com/images/VejIgUjCISqawg3B2tZ3Cn9LA7U.jpg?scale-down-to=1024&width=1408&height=768',
    'https://framerusercontent.com/images/hbSPXPtoeNiwslrKkKSR4tFxOo.jpg?scale-down-to=1024&width=1408&height=768'
];

interface WelcomeScreenProps {
    user: User | null;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ user }) => {
    const { t } = useLanguage();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        // Preload images
        backgroundImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });

        const intervalId = setInterval(() => {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % backgroundImages.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(intervalId);
    }, []);
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return t('greeting_morning');
        }
        if (hour >= 12 && hour < 18) {
            return t('greeting_afternoon');
        }
        return t('greeting_evening');
    };

    const username = user?.user_metadata?.username || 'User';

    return (
        <div className="relative flex flex-col items-center justify-center h-full text-center overflow-hidden">
            <div className="absolute inset-0 w-full h-full z-0">
                {backgroundImages.map((src, index) => (
                    <div
                        key={src}
                        className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                            index === currentImageIndex ? 'opacity-10' : 'opacity-0'
                        }`}
                        style={{ backgroundImage: `url(${src})` }}
                        aria-hidden="true"
                    />
                ))}
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="relative mb-6">
                    <img src="https://i.imgur.com/QAy8ULl.png" alt="Olympus Logo" className="h-16 w-auto block dark:hidden" />
                    <img src="https://i.imgur.com/0vBQm1M.png" alt="Olympus Logo" className="h-16 w-auto hidden dark:block" />
                    <div className="absolute inset-0 -z-10 bg-ocs-accent blur-2xl rounded-full"></div>
                </div>
                <p className="text-zinc-500 dark:text-ocs-text-muted text-lg mb-2">
                    {t('personalized_greeting', { greeting: getGreeting(), username })}
                </p>
                <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-12">
                    {t('how_can_i_help')}
                </h1>
                <p className="text-zinc-600 dark:text-zinc-500">{t('select_assistant_prompt')}</p>
            </div>
        </div>
    );
};

export default WelcomeScreen;