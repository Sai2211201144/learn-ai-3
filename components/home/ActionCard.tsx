
import React from 'react';

interface ActionCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="w-full h-full text-left glass-card p-6 rounded-2xl transition-all duration-300 group animated-glow-border"
        >
            <div className="w-12 h-12 flex items-center justify-center rounded-lg mb-4 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 text-[var(--color-primary)] transition-transform duration-300 group-hover:scale-110">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-[var(--color-foreground)]">{title}</h3>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{description}</p>
        </button>
    );
};

export default ActionCard;