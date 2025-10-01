

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
    const ringColor = colorClass.progress.replace('bg-', 'ring-');

    return (
        <div className={`p-4 rounded-xl flex flex-col items-center text-center transition-all duration-300 ${
            unlocked 
            ? 'bg-gray-50 dark:bg-ocs-dark-input shadow-lg hover:shadow-xl hover:-translate-y-1 dark:shadow-black/20 border border-black/5 dark:border-white/5' 
            : 'bg-gray-100 dark:bg-ocs-dark-hover opacity-60'
        }`}>
            <div className={`relative w-20 h-20 mb-3 flex items-center justify-center rounded-full transition-all duration-300 ${
                unlocked ? `ring-2 ring-offset-4 ring-offset-gray-50 dark:ring-offset-ocs-dark-input ${ringColor} ${colorClass.bg}` : 'bg-gray-200 dark:bg-zinc-700'
            }`}>
                <span
                    className={`relative text-4xl transition-all duration-300 ${!unlocked ? 'grayscale' : ''}`}
                    role="img"
                    aria-label={badge.name}
                >
                    {badge.icon}
                </span>
            </div>
            
            <h4 className="font-bold text-gray-800 dark:text-white text-sm">{badge.name}</h4>
            <p className="text-xs text-gray-500 dark:text-ocs-text-muted mt-1 mb-3 h-8">
                {badge.description}
            </p>

            {!unlocked && (
                <div className="w-full">
                    <div className="bg-gray-200 dark:bg-zinc-700 rounded-full h-2 w-full overflow-hidden">
                        <div
                            className={`${colorClass.progress} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                        {progress} / {badge.target}
                    </p>
                </div>
            )}
        </div>
    );
};

export default BadgeItem;
