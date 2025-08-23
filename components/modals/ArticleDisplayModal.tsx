import React from 'react';
import { CloseIcon, LoadingSpinnerIcon, ArticleIcon } from '../common/Icons';
import MarkdownRenderer from '../common/MarkdownRenderer';

interface ArticleDisplayModalProps {
    isOpen: boolean;
    isLoading: boolean;
    title: string;
    article: string;
    error: string | null;
    onClose: () => void;
}

const ArticleDisplayModal: React.FC<ArticleDisplayModalProps> = ({ isOpen, isLoading, title, article, error, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-[var(--color-card)] rounded-xl shadow-2xl p-8 w-full max-w-4xl border border-[var(--color-border)] animate-modal-content flex flex-col h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                            <ArticleIcon className="w-7 h-7 text-blue-500" />
                            {isLoading ? "Generating Article..." : title || "AI-Generated Article"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-4 -mr-4 bg-gray-50/50 p-6 rounded-lg border">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <LoadingSpinnerIcon className="w-8 h-8 text-blue-500" />
                            <p className="mt-4 text-[var(--color-muted-foreground)]">The AI is researching and writing your article...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center text-red-500 p-8">
                            <p>{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && article && (
                        <div className="max-w-none text-slate-700 leading-relaxed">
                            <MarkdownRenderer content={article} />
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

export default ArticleDisplayModal;