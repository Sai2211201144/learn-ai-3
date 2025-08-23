import React from 'react';
import { BookOpenIcon, CheckCircleIcon, WrenchScrewdriverIcon } from '../common/Icons';

interface StatsCardProps {
    topicsStarted: number;
    lessonsCompleted: number;
    projectsStarted: number;
}

const StatItem: React.FC<{ icon: React.ReactNode; value: number; label: string; colorClass: string }> = ({ icon, value, label, colorClass }) => (
    <div className="flex items-center gap-4">
        <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg bg-${colorClass}/10 text-${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-[var(--color-foreground)]">{value}</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">{label}</p>
        </div>
    </div>
);


const StatsCard: React.FC<StatsCardProps> = ({ topicsStarted, lessonsCompleted, projectsStarted }) => {
    return (
        <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] h-full">
            <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-4">My Stats</h3>
            <div className="space-y-4">
                <StatItem icon={<BookOpenIcon className="w-6 h-6"/>} value={topicsStarted} label="Topics Started" colorClass="[var(--color-primary)]"/>
                <StatItem icon={<CheckCircleIcon className="w-6 h-6"/>} value={lessonsCompleted} label="Lessons Completed" colorClass="green-500"/>
                <StatItem icon={<WrenchScrewdriverIcon className="w-6 h-6"/>} value={projectsStarted} label="Projects Started" colorClass="[var(--color-accent)]"/>
            </div>
        </div>
    );
};

export default StatsCard;