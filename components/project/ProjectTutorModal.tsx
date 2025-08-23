
import React from 'react';
import { ProjectTutorState } from '../../types';
import { CloseIcon, LoadingSpinnerIcon, SparklesIcon } from '../common/Icons';
import MarkdownRenderer from '../common/MarkdownRenderer';

interface ProjectTutorModalProps extends ProjectTutorState {
    onClose: () => void;
}

const ProjectTutorModal: React.FC<ProjectTutorModalProps> = ({ isOpen, isLoading, projectStep, feedback, error, onClose }) => {
    if (!isOpen) return null;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <LoadingSpinnerIcon className="w-8 h-8 text-indigo-500" />
                    <p className="mt-4 text-[var(--color-muted-foreground)]">Your AI Pair Programmer is reviewing your code...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center text-red-500 p-8">
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                </div>
            );
        }

        if (feedback) {
            return (
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <MarkdownRenderer content={feedback} />
                </div>
            )
        }

        return null;
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-[var(--color-card)] rounded-xl shadow-2xl p-8 w-full max-w-2xl border border-[var(--color-border)] animate-modal-content flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                            <SparklesIcon className="w-7 h-7 text-indigo-500" />
                            AI Pair Programmer Feedback
                        </h2>
                        <p className="text-[var(--color-muted-foreground)] mt-1">For step: "{projectStep?.title}"</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-4 -mr-4 min-h-[200px]">
                    {renderContent()}
                </div>

                <div className="mt-8 flex justify-end flex-shrink-0">
                    <button onClick={onClose} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500">
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectTutorModal;
