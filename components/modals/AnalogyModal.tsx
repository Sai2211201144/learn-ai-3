import React from 'react';
import { CloseIcon, LoadingSpinnerIcon, LightBulbIcon } from '../common/Icons';

interface AnalogyModalProps {
    isOpen: boolean;
    isLoading: boolean;
    title: string;
    analogy: string;
    error: string | null;
    onClose: () => void;
}

const AnalogyModal: React.FC<AnalogyModalProps> = ({ isOpen, isLoading, title, analogy, error, onClose }) => {
    if (!isOpen) return null;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <LoadingSpinnerIcon className="w-8 h-8 text-yellow-500" />
                    <p className="mt-4 text-[var(--color-muted-foreground)]">Crafting an analogy...</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="text-center text-[var(--color-destructive)] p-8">
                    <p>{error}</p>
                </div>
            );
        }
        return (
            <div className="text-[var(--color-foreground)] leading-relaxed font-serif text-lg text-center">
                <p>"{analogy}"</p>
            </div>
        );
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-[var(--color-card)] rounded-xl shadow-2xl p-8 w-full max-w-lg border border-[var(--color-border)] animate-modal-content flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                            <LightBulbIcon className="w-7 h-7 text-yellow-500" />
                            Analogy for: {title}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow flex items-center justify-center my-8 bg-[var(--color-secondary)]/50 p-6 rounded-lg border border-[var(--color-border)] min-h-[150px]">
                    {renderContent()}
                </div>

                <div className="mt-4 flex justify-end flex-shrink-0">
                    <button onClick={onClose} className="px-5 py-2 bg-[var(--color-secondary-hover)] text-[var(--color-foreground)] font-bold rounded-lg hover:bg-[var(--color-border)] border border-[var(--color-border)]">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalogyModal;