import React from 'react';
import type { Badge } from '../constants/badges';

interface BadgeItemProps {
    badge: Badge;
    progress: number;
    unlocked: boolean;
}

const BadgeItem: React.FC<BadgeItemProps> = ({ badge, progress, unlocked }) => {
    const progressPercentage = badge.target > 0 ? (progress / badge.target) * 100 : 0;
    const { colorClass } = badge;
    const accentColor = colorClass.progress;

    return (
        <div className={`group relative p-6 rounded-[32px] transition-all duration-500 border ${
            unlocked 
            ? 'bg-white/5 border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-white/10 hover:border-white/20 hover:-translate-y-2' 
            : 'bg-black/20 border-white/5 opacity-50'
        }`}>
            {/* Background Glow for Unlocked */}
            {unlocked && (
                <div className={`absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-20 transition-opacity blur-2xl ${accentColor}`} />
            )}

            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Badge Icon */}
                <div className={`w-20 h-20 mb-6 flex items-center justify-center rounded-full transition-all duration-500 ${
                    unlocked 
                    ? `bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] scale-100 group-hover:scale-110` 
                    : 'bg-zinc-900 grayscale'
                }`}>
                    <span
                        className="text-4xl"
                        role="img"
                        aria-label={badge.name}
                    >
                        {badge.icon}
                    </span>
                </div>
                
                {/* Text Content */}
                <h4 className={`font-bold text-sm tracking-tight mb-2 ${unlocked ? 'text-white' : 'text-zinc-500'}`}>
                    {badge.name}
                </h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed h-8 line-clamp-2">
                    {badge.description}
                </p>

                {/* Progress Bar */}
                {!unlocked && (
                    <div className="w-full mt-6 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                            <span>Progress</span>
                            <span>{progress} / {badge.target}</span>
                        </div>
                        <div className="bg-zinc-900 rounded-full h-1 w-full overflow-hidden">
                            <div
                                className={`${accentColor} h-full rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                )}

                {unlocked && (
                    <div className="mt-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`}>
                            Unlocked
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BadgeItem;