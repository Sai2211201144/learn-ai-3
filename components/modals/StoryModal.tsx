import React from 'react';
import { CloseIcon, LoadingSpinnerIcon, ChatBubbleOvalLeftEllipsisIcon } from '../common/Icons';

interface StoryModalProps {
    isOpen: boolean;
    isLoading: boolean;
    title: string;
    story: string;
    error: string | null;
    onClose: () => void;
}

const StoryModal: React.FC<StoryModalProps> = ({ isOpen, isLoading, title, story, error, onClose }) => {
    if (!isOpen) return null;

    const renderStory = (text: string) => {
        if (!text) return null;

        return text.split('\n').map((line, index) => {
            if (line.trim() === '') return <br key={index} />;
    
            // Regex to capture **Character:** (Mannerism) Dialogue
            const match = line.match(/\*\*(.*?):\*\* \((.*?)\) (.*)/);
            if (match) {
                const [, character, mannerism, dialogue] = match;
                return (
                    <p key={index} className="story-dialogue-line">
                        <span className="story-character">{character}:</span>
                        <em className="story-mannerism">({mannerism})</em>
                        <span className="story-dialogue"> {dialogue}</span>
                    </p>
                );
            }
    
            // Regex for simple **Character:** Dialogue
            const simpleMatch = line.match(/\*\*(.*?):\*\* (.*)/);
            if (simpleMatch) {
                const [, character, dialogue] = simpleMatch;
                return (
                    <p key={index} className="story-dialogue-line">
                        <span className="story-character">{character}:</span>
                        <span className="story-dialogue"> {dialogue}</span>
                    </p>
                );
            }
            
            // Non-dialogue lines (e.g., scene descriptions)
            return <p key={index} className="story-description">{line}</p>;
        });
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-[var(--color-card)] rounded-xl shadow-2xl p-8 w-full max-w-3xl border border-[var(--color-border)] animate-modal-content flex flex-col h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                            <ChatBubbleOvalLeftEllipsisIcon className="w-7 h-7 text-blue-500" />
                            Story Mode: {title}
                        </h2>
                        <p className="text-[var(--color-muted-foreground)] mt-1">An AI-generated story to introduce the topic.</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-4 -mr-4 bg-[var(--color-secondary)]/50 p-6 rounded-lg border border-[var(--color-border)]">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <LoadingSpinnerIcon className="w-8 h-8 text-blue-500" />
                            <p className="mt-4 text-[var(--color-muted-foreground)]">The AI is writing your story...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center text-[var(--color-destructive)] p-8">
                            <p>{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && story && (
                        <div className="text-[var(--color-foreground)] leading-relaxed font-serif">
                            {renderStory(story)}
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end flex-shrink-0">
                    <button onClick={onClose} className="px-5 py-2 bg-[var(--color-secondary-hover)] text-[var(--color-foreground)] font-bold rounded-lg hover:bg-[var(--color-border)] border border-[var(--color-border)]">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoryModal;