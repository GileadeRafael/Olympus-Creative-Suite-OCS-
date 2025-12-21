import React, { useState, useMemo } from 'react';
import { XIcon, SparklesIcon } from './icons/CoreIcons';
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
            return badges.filter(badge => badge.secret && userProgress[badge.id]?.unlocked);
        }
        return badges.filter(badge => !badge.secret && !badge.hidden && badge.level === activeTab);
    }, [badges, activeTab, userProgress]);


    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="w-full max-w-4xl bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col overflow-hidden animate-modal-enter"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-ocs-accent/20 rounded-2xl">
                            <SparklesIcon className="w-6 h-6 text-ocs-accent" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-white tracking-tight">
                                Achievement Badges
                            </h2>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Your Creative Journey</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-500 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Close modal"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>

                {/* Tabs */}
                <nav className="flex items-center gap-2 p-6 border-b border-white/5 bg-white/[0.02] overflow-x-auto no-scrollbar">
                    {visibleTabs.map(tab => {
                        const isSecretTab = tab === BadgeLevel.Secret;
                        const isActive = activeTab === tab;

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                                    isActive 
                                    ? (isSecretTab ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-ocs-accent text-white shadow-[0_0_20px_rgba(138,93,255,0.4)]')
                                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </nav>

                {/* Content */}
                <div className="flex-1 p-10 overflow-y-auto custom-scrollbar max-h-[60vh]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBadges.map(badge => (
                            <BadgeItem
                                key={badge.id}
                                badge={badge}
                                progress={userProgress[badge.id]?.current || 0}
                                unlocked={userProgress[badge.id]?.unlocked || false}
                            />
                        ))}
                    </div>
                    {filteredBadges.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-700 border border-white/5 mb-6">
                                <SparklesIcon className="w-10 h-10 opacity-20" />
                            </div>
                            <h3 className="text-white font-bold text-xl mb-2">No badges unlocked yet</h3>
                            <p className="text-zinc-500 text-sm max-w-xs">The secrets are waiting to be discovered. Start creating to reveal them.</p>
                        </div>
                    )}
                </div>
                
                {/* Footer Footer */}
                <footer className="px-10 py-6 border-t border-white/5 bg-white/5 flex justify-between items-center">
                     <div className="flex gap-2">
                        {visibleTabs.map(tab => (
                            <div key={tab} className={`w-1.5 h-1.5 rounded-full ${activeTab === tab ? 'bg-ocs-accent' : 'bg-zinc-800'}`} />
                        ))}
                     </div>
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Zion Peak Suite Pro v1.0</p>
                </footer>
            </div>
        </div>
    );
};

export default BadgesModal;