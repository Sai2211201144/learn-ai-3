import React, { useState } from 'react';
import { KnowledgeLevel } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { CloseIcon, BeakerIcon } from '../common/Icons';

interface QuickPracticeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: () => void;
}

const QuickPracticeModal: React.FC<QuickPracticeModalProps> = ({ isOpen, onClose, onStart }) => {
    const { handleStartPracticeQuiz } = useAppContext();
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState<KnowledgeLevel>('beginner');
    const [error, setError] = useState<string | null>(null);

    const levels: { level: KnowledgeLevel; label: string; description: string }[] = [
        { level: 'beginner', label: 'Beginner', description: 'Just the basics.' },
        { level: 'intermediate', label: 'Intermediate', description: 'Core concepts.' },
        { level: 'advanced', label: 'Advanced', description: 'Complex topics.' },
    ];

    if (!isOpen) return null;
    
    const handleStartClick = () => {
        if (!topic.trim()) {
            setError("Please enter a topic.");
            return;
        }
        handleStartPracticeQuiz(topic, level, onStart);
        onClose(); // Close the modal after starting
    };

    const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTopic(e.target.value);
        if (error) {
            setError(null);
        }
    };
    
    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-[var(--color-card)] rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 border border-[var(--color-border)] animate-modal-content"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                            <BeakerIcon className="w-7 h-7 text-green-500" />
                            Quick Practice Session
                        </h2>
                        <p className="text-[var(--color-muted-foreground)] mt-1">Start a fast-paced quiz on any topic.</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="topic-input" className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Topic</label>
                        <input
                            id="topic-input"
                            type="text"
                            value={topic}
                            onChange={handleTopicChange}
                            onKeyDown={(e) => e.key === 'Enter' && handleStartClick()}
                            placeholder="e.g., 'JavaScript Promises'"
                            className="w-full px-4 py-2 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <h3 className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Difficulty</h3>
                        <div className="grid sm:grid-cols-3 gap-3">
                            {levels.map((l) => (
                                <button
                                    key={l.level}
                                    onClick={() => setLevel(l.level)}
                                    className={`text-left p-3 rounded-lg border-2 transition-all duration-200 ${level === l.level ? 'bg-green-500/10 border-green-500' : 'bg-[var(--color-secondary)] border-[var(--color-border)] hover:border-green-400'}`}
                                >
                                    <p className="font-bold text-green-500 capitalize">{l.label}</p>
                                    <p className="text-xs text-[var(--color-muted-foreground)]">{l.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {error && <p className="mt-4 text-center text-red-500 animate-shake">{error}</p>}
                
                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 bg-[var(--color-secondary-hover)] text-[var(--color-foreground)] font-bold rounded-lg hover:bg-[var(--color-border)] border border-[var(--color-border)]">
                        Cancel
                    </button>
                    <button
                        onClick={handleStartClick}
                        disabled={!topic.trim()}
                        className="px-5 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:bg-gray-400"
                    >
                        Start Quiz
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickPracticeModal;