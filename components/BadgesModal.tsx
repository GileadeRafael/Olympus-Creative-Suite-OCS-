

import React, { useState, useMemo } from 'react';
import { XIcon } from './icons/CoreIcons';
import { useGamification } from '../contexts/GamificationContext';
import { BadgeLevel } from '../constants/badges';
import BadgeItem from './BadgeItem';

interface BadgesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LEVEL_TABS = [BadgeLevel.Beginner, BadgeLevel.Intermediate, BadgeLevel.Advanced, BadgeLevel.Master];

const BadgesModal: React.FC<BadgesModalProps> = ({ isOpen, onClose }) => {
    const { badges, userProgress } = useGamification();
    const [activeTab, setActiveTab] = useState<BadgeLevel>(BadgeLevel.Beginner);

    const hasUnlockedSecrets = useMemo(() => {
        return badges.some(badge => badge.secret && userProgress[badge.id]?.unlocked);
    }, [badges, userProgress]);

    const visibleTabs = hasUnlockedSecrets ? [...LEVEL_TABS, BadgeLevel.Secret] : LEVEL_TABS;

    const filteredBadges = useMemo(() => {
        if (activeTab === BadgeLevel.Secret) {
            // A aba Secreto só mostra os que já foram desbloqueados.
            return badges.filter(badge => badge.secret && userProgress[badge.id]?.unlocked);
        }
        return badges.filter(badge => !badge.secret && !badge.hidden && badge.level === activeTab);
    }, [badges, activeTab, userProgress]);


    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="w-full max-w-2xl h-[80vh] bg-white dark:bg-ocs-dark-sidebar rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700/80 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10">
                    <h2 className="font-bold text-xl text-gray-800 dark:text-white">
                        Badges
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-500/10 dark:hover:bg-white/10"
                        aria-label="Close modal"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </header>

                <nav className="flex-shrink-0 flex border-b border-black/10 dark:border-white/10 px-2">
                    {visibleTabs.map(tab => {
                        const isSecretTab = tab === BadgeLevel.Secret;
                        const isActive = activeTab === tab;

                        let tabClasses = '';
                        if (isSecretTab) {
                            tabClasses = isActive 
                                ? 'text-amber-400 border-b-2 border-amber-400' 
                                : 'text-amber-500 hover:text-amber-400';
                        } else {
                            tabClasses = isActive 
                                ? 'text-ocs-accent border-b-2 border-ocs-accent' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white';
                        }

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-3 text-sm font-semibold transition-colors ${tabClasses}`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </nav>

                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredBadges.map(badge => (
                            <BadgeItem
                                key={badge.id}
                                badge={badge}
                                progress={userProgress[badge.id]?.current || 0}
                                unlocked={userProgress[badge.id]?.unlocked || false}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BadgesModal;
