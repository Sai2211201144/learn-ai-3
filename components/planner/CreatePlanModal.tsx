import React, { useState } from 'react';
import { CloseIcon, CalendarDaysIcon, LoadingSpinnerIcon } from '../common/Icons';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';

interface CreatePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ isOpen, onClose }) => {
    const { createUserLearningPlan } = useFirebaseAuth();
    const [topic, setTopic] = useState('');
    const [duration, setDuration] = useState<string>('ai');
    const [customDuration, setCustomDuration] = useState<number>(7);
    const [localError, setLocalError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleGenerateClick = async () => {
        if (!topic.trim()) {
            setLocalError("Please enter a topic to create a plan for.");
            return;
        }
        
        setIsGenerating(true);
        setLocalError(null);
        
        try {
            const finalDuration = duration === 'custom' ? customDuration : 7;
            await createUserLearningPlan(`Learn ${topic}`, finalDuration);
            
            // Reset form
            setTopic('');
            setDuration('ai');
            setCustomDuration(7);
            onClose();
        } catch (error) {
            console.error('Failed to create learning plan:', error);
            setLocalError('Failed to create learning plan. Please try again.');
        } finally {
            setIsGenerating(false);
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
                className="bg-[var(--color-card)] rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 border border-[var(--color-border)] animate-modal-content flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-start mb-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <CalendarDaysIcon className="w-7 h-7 text-[var(--color-primary)]" />
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Create New Learning Plan</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="plan-topic-input" className="text-lg font-semibold text-[var(--color-foreground)] mb-2 block">What's your learning goal?</label>
                        <input
                            id="plan-topic-input"
                            type="text"
                            value={topic}
                            onChange={(e) => { setTopic(e.target.value); setLocalError(null); }}
                            placeholder="e.g., 'Master Advanced SQL'"
                            className="w-full px-4 py-3 bg-[var(--color-secondary)] border-2 border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-lg"
                        />
                    </div>
                    
                    <div className="p-4 bg-[var(--color-secondary)]/50 rounded-lg space-y-4">
                        <h4 className="font-semibold text-sm text-[var(--color-muted-foreground)] mb-2">Plan Duration</h4>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={() => setDuration('ai')} className={`flex-1 text-center py-2 rounded-md text-sm font-semibold border ${duration === 'ai' ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-secondary-hover)] border-[var(--color-border)]'}`}>
                                ✨ AI Optimal
                            </button>
                            <button onClick={() => setDuration('custom')} className={`flex-1 text-center py-2 rounded-md text-sm font-semibold border ${duration === 'custom' ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-secondary-hover)] border-[var(--color-border)]'}`}>
                                Custom
                            </button>
                        </div>
                        {duration === 'custom' && (
                             <div className="flex items-center gap-2 animate-fade-in-up-fast">
                                <input
                                    type="number"
                                    value={customDuration}
                                    onChange={(e) => setCustomDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-24 px-3 py-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md"
                                    min="1"
                                />
                                <span className="text-sm font-medium text-[var(--color-muted-foreground)]">days</span>
                             </div>
                        )}
                    </div>
                </div>

                {localError && <p className="mt-4 text-center text-red-500 animate-shake text-sm">{localError}</p>}
                
                <footer className="mt-6 pt-4 border-t border-[var(--color-border)] flex justify-end items-center flex-shrink-0">
                     <button 
                        onClick={handleGenerateClick} 
                        disabled={!topic.trim() || isGenerating}
                        className="px-6 py-3 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 shadow-lg disabled:opacity-50 flex items-center gap-2"
                     >
                        {isGenerating && <LoadingSpinnerIcon className="w-5 h-5" />}
                        {isGenerating ? 'Creating Plan...' : 'Create Plan'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CreatePlanModal;
