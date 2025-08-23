import React, { useState } from 'react';
import { SocraticModalState, QuizData } from '../../types';
import { CloseIcon, LoadingSpinnerIcon, QuizIcon, LightBulbIcon } from '../common/Icons';

interface SocraticModalProps extends SocraticModalState {
    onClose: () => void;
}

const SocraticQuizBlock: React.FC<{ quizData: QuizData }> = ({ quizData }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState<boolean>(false);

    const handleSelectOption = (index: number) => {
        if (!isAnswered) {
            setSelectedOption(index);
        }
    };

    const handleSubmit = () => {
        if (selectedOption !== null) {
            setIsAnswered(true);
        }
    };
    
    const getOptionClass = (index: number) => {
        if (!isAnswered) {
            return `cursor-pointer ${selectedOption === index ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300 hover:border-blue-400'}`;
        }
        
        if (index === quizData.answer) return 'bg-green-100 border-green-500 pointer-events-none';
        if (index === selectedOption) return 'bg-red-100 border-red-500 pointer-events-none';
        return 'bg-gray-100 border-gray-300 opacity-60 pointer-events-none';
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="font-semibold text-slate-700 mb-4">{quizData.q}</p>
            <div className="space-y-2">
                {quizData.options.map((option, index) => (
                    <div
                        key={index}
                        onClick={() => handleSelectOption(index)}
                        className={`p-3 rounded-md border-2 transition-all duration-200 ${getOptionClass(index)}`}
                    >
                        <p className="text-slate-700">{option}</p>
                    </div>
                ))}
            </div>
            {!isAnswered ? (
                 <button
                    onClick={handleSubmit}
                    disabled={selectedOption === null}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 disabled:bg-gray-300"
                >
                    Check Answer
                </button>
            ) : (
                <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <h5 className="font-bold text-yellow-800 flex items-center gap-2 mb-2"><LightBulbIcon className="w-5 h-5"/> Explanation</h5>
                    <p className="text-sm text-yellow-900 leading-relaxed">{quizData.explanation}</p>
                </div>
            )}
        </div>
    );
};


const SocraticModal: React.FC<SocraticModalProps> = ({ isOpen, isLoading, subtopic, quiz, error, onClose }) => {
    if (!isOpen) return null;

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
                            <QuizIcon className="w-7 h-7 text-blue-500" />
                            Socratic Quiz: {subtopic?.title}
                        </h2>
                        <p className="text-[var(--color-muted-foreground)] mt-1">Test your understanding with guiding questions.</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-4 -mr-4 bg-gray-50/50 p-6 rounded-lg border">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <LoadingSpinnerIcon className="w-8 h-8 text-blue-500" />
                            <p className="mt-4 text-[var(--color-muted-foreground)]">The AI is preparing your questions...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center text-red-500 p-8">
                            <p className="font-semibold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && quiz.length > 0 && (
                        <div className="space-y-4">
                            {quiz.map((q, index) => (
                                <SocraticQuizBlock key={index} quizData={q} />
                            ))}
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

export default SocraticModal;
