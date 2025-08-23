
import React from 'react';
import { Achievement } from '../../types';
import { LockClosedIcon } from '../common/Icons';

interface AchievementCardProps {
    achievement: Achievement;
    isUnlocked: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, isUnlocked }) => {
    const { icon: Icon, title, description } = achievement;

    return (
        <div className={`p-6 rounded-2xl border transition-all duration-300 flex items-center gap-5 group relative overflow-hidden ${isUnlocked ? 'bg-[var(--color-card)] border-[var(--color-border)]' : 'bg-[var(--color-secondary)] border-[var(--color-border)]/50'}`}>
            {isUnlocked && (
                <>
                    <div className="absolute inset-0 animated-glow-border rounded-2xl"></div>
                    <div className="absolute inset-0 shimmer-effect"></div>
                </>
            )}
            <div 
                className={`w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300 shadow-inner z-10 ${isUnlocked ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' : 'bg-[var(--color-background)] text-[var(--color-muted-foreground)]'}`}
            >
                {isUnlocked ? <Icon className="w-8 h-8" /> : <LockClosedIcon className="w-8 h-8" />}
            </div>
            <div className="flex-grow z-10">
                <h3 className={`font-bold text-lg ${isUnlocked ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted-foreground)]'}`}>
                    {title}
                </h3>
                <p className={`text-sm mt-1 ${isUnlocked ? 'text-[var(--color-muted-foreground)]' : 'text-gray-600'}`}>
                    {description}
                </p>
            </div>
        </div>
    );
};

export default AchievementCard;