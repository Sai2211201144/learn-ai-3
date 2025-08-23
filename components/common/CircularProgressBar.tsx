
import React from 'react';

interface CircularProgressBarProps {
    progress: number; // 0 to 100
    size: number;
    strokeWidth: number;
    children?: React.ReactNode;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({ progress, size, strokeWidth, children }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle
                    className="text-[var(--color-border)]"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className="text-[var(--color-primary)]"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    );
};

export default CircularProgressBar;
