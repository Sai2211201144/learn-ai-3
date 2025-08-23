
import React, { useState } from 'react';
import { UnderstandingCheckState, QuizData } from '../../types';
import { CloseIcon, LoadingSpinnerIcon, LightBulbIcon, CheckIcon } from '../common/Icons';

interface UnderstandingCheckModalProps extends UnderstandingCheckState {
    onClose: () => void;
    onSubmit: (answers: Map<number, number>) => void;
}

const UnderstandingCheckModal: React.FC<UnderstandingCheckModalProps> = ({ isOpen, isLoading, subtopic, quiz, error, onClose, onSubmit }) => {
    const [answers, setAnswers] = useState<Map<number, number>>(new Map());

    if (!isOpen) return null;

    const handleSelectOption = (qIndex: number, oIndex: number) => {
        setAnswers(prev => new Map(prev).set(qIndex, oIndex));
    };

    const handleSubmit = () => {
        if (answers.size === quiz.length) {
            onSubmit(answers);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <LoadingSpinnerIcon className="w-8 h-8 text-blue-500" />
                    <p className="mt-4 text-[var(--color-muted-foreground)]">The AI is preparing your questions...</p>
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
        
        if (quiz.length > 0) {
            return (
                <div className="space-y-4">
                    {quiz.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <p className="font-semibold text-slate-700 mb-4">{qIndex + 1}. {q.q}</p>
                            <div className="space-y-2">
                                {q.options.map((option, oIndex) => {
                                    const isSelected = answers.get(qIndex) === oIndex;
                                    return (
                                        <div
                                            key={oIndex}
                                            onClick={() => handleSelectOption(qIndex, oIndex)}
                                            className={`p-3 rounded-md border-2 transition-all duration-200 cursor-pointer ${isSelected ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300 hover:border-blue-400'}`}
                                        >
                                            <p className="text-slate-700">{option}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return <p>No quiz available.</p>
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-[var(--color-card)] rounded-xl shadow-2xl p-8 w-full max-w-2xl border border-[var(--color-border)] animate-modal-content flex flex-col h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                            <LightBulbIcon className="w-7 h-7 text-blue-500" />
                            Check Your Understanding
                        </h2>
                        <p className="text-[var(--color-muted-foreground)] mt-1">A quick check on: "{subtopic?.title}"</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-4 -mr-4 bg-gray-50/50 p-6 rounded-lg border">
                    {renderContent()}
                </div>

                <div className="mt-8 flex justify-end flex-shrink-0">
                     <button
                        onClick={handleSubmit}
                        disabled={isLoading || answers.size !== quiz.length}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 disabled:bg-gray-400"
                    >
                        <CheckIcon className="w-5 h-5" />
                        Submit Answers
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnderstandingCheckModal;
