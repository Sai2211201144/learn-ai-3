import React from 'react';

interface ProgressBarProps {
    progress: number; // value from 0 to 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));

    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
                className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${clampedProgress}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;