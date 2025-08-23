import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ChevronLeftIcon, LoadingSpinnerIcon, BeakerIcon } from '../common/Icons';
import PracticeConceptAccordion from './PracticeConceptAccordion';
import QuizBlock from '../course/QuizBlock'; // Reusing for single question display

interface PracticePageProps {
    onBack: () => void;
}

const PracticePage: React.FC<PracticePageProps> = ({ onBack }) => {
    const { practiceSession, isPracticeLoading, practiceError } = useAppContext();
    const [activeTab, setActiveTab] = useState<'concepts' | 'quiz'>('concepts');

    // Quiz-specific state
    const [userAnswers, setUserAnswers] = useState<Map<number, number>>(new Map());
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        // Reset state when a new practice session is loaded
        if (practiceSession) {
            setUserAnswers(new Map());
            setShowResults(false);
            setActiveTab('concepts');
        }
    }, [practiceSession]);

    const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
        if (showResults) return;
        setUserAnswers(prev => new Map(prev).set(questionIndex, answerIndex));
    };

    const calculateScore = () => {
        if (!practiceSession?.quiz) return 0;
        let correctCount = 0;
        for (const [qIndex, userAnswer] of userAnswers.entries()) {
            if (practiceSession.quiz[qIndex].answer === userAnswer) {
                correctCount++;
            }
        }
        return (correctCount / practiceSession.quiz.length) * 100;
    };

    const score = showResults ? calculateScore() : 0;
    const scoreColor = score >= 70 ? 'text-green-500' : score >= 40 ? 'text-yellow-500' : 'text-red-500';

    const renderLoading = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <LoadingSpinnerIcon className="h-12 w-12 text-[var(--color-primary)]" />
            <h2 className="text-2xl font-bold mt-6 text-slate-700">Building Your Practice Session...</h2>
            <p className="text-lg text-gray-600 mt-2">The AI is preparing in-depth concepts and a quiz for you.</p>
        </div>
    );

    const renderError = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-red-50 rounded-lg">
            <h2 className="text-2xl font-bold mt-6 text-red-700">An Error Occurred</h2>
            <p className="text-lg text-red-600 mt-2">{practiceError}</p>
            <button onClick={onBack} className="mt-6 px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500">
                Go Back
            </button>
        </div>
    );

    const renderContent = () => {
        if (!practiceSession) return null;

        return (
            <>
                <header className="mb-6 flex-shrink-0">
                    <button onClick={onBack} className="flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4" title="Back to Course">
                        <ChevronLeftIcon className="h-4 w-4 mr-1" />
                        Back to Course
                    </button>
                    <div className="flex items-center gap-3">
                        <BeakerIcon className="w-8 h-8 text-[var(--color-primary)]" />
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900">Practice: {practiceSession.topic}</h1>
                            <p className="text-gray-500">Dive deeper into the concepts and test your knowledge.</p>
                        </div>
                    </div>
                </header>

                <div className="flex-grow flex flex-col min-h-0">
                    <div className="flex-shrink-0 border-b border-gray-200">
                        <nav className="flex space-x-4">
                            <button
                                onClick={() => setActiveTab('concepts')}
                                className={`px-3 py-2 font-semibold text-sm rounded-t-lg transition-colors ${activeTab === 'concepts' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                In-Depth Concepts
                            </button>
                             <button
                                onClick={() => setActiveTab('quiz')}
                                className={`px-3 py-2 font-semibold text-sm rounded-t-lg transition-colors ${activeTab === 'quiz' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Test Your Knowledge
                            </button>
                        </nav>
                    </div>

                    <div className="flex-grow bg-gray-50/70 p-6 rounded-b-lg overflow-y-auto custom-scrollbar">
                        {activeTab === 'concepts' && (
                            <div className="space-y-4">
                                {practiceSession.concepts.map((concept, index) => (
                                    <PracticeConceptAccordion key={index} concept={concept} />
                                ))}
                            </div>
                        )}
                        {activeTab === 'quiz' && (
                           <div>
                                {showResults && (
                                    <div className="text-center bg-white p-6 rounded-lg border-2 mb-6 animate-fade-in" style={{ borderColor: `var(--color-${scoreColor.match(/-(.*)-/)?.[1]})` }}>
                                        <h3 className="text-xl font-bold text-gray-800">Quiz Complete!</h3>
                                        <p className={`text-5xl font-bold my-2 ${scoreColor}`}>{score.toFixed(0)}%</p>
                                        <p className="text-gray-600">You got {Math.round(score/100 * practiceSession.quiz.length)} out of {practiceSession.quiz.length} correct.</p>
                                    </div>
                                )}
                                <div className="space-y-6">
                                    {practiceSession.quiz.map((q, index) => (
                                        <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                            {/* We can't reuse QuizBlock directly if we want to manage state here */}
                                            <p className="font-semibold text-slate-700 mb-3">{index+1}. {q.q}</p>
                                            <div className="space-y-2">
                                                {q.options.map((option, oIndex) => {
                                                     const isSelected = userAnswers.get(index) === oIndex;
                                                     let optionClass = 'cursor-pointer bg-gray-100 hover:bg-gray-200';
                                                     if (showResults) {
                                                         if (oIndex === q.answer) optionClass = 'bg-green-100 text-green-800 ring-2 ring-green-500 pointer-events-none';
                                                         else if (isSelected) optionClass = 'bg-red-100 text-red-800 ring-2 ring-red-500 pointer-events-none';
                                                         else optionClass = 'bg-gray-100 opacity-60 pointer-events-none';
                                                     } else if (isSelected) {
                                                         optionClass = 'bg-green-600 text-white ring-2 ring-green-500';
                                                     }
                                                     return (
                                                        <div key={oIndex} onClick={() => handleAnswerSelect(index, oIndex)} className={`flex items-center p-3 rounded-md transition-all duration-200 text-slate-700 ${optionClass}`}>
                                                            <span className="flex-grow">{option}</span>
                                                        </div>
                                                     )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {!showResults && (
                                    <button
                                        onClick={() => setShowResults(true)}
                                        disabled={userAnswers.size !== practiceSession.quiz.length}
                                        className="mt-6 w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:bg-gray-300"
                                    >
                                        Submit & See Results
                                    </button>
                                )}
                           </div>
                        )}
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="w-full max-w-screen-lg mx-auto animate-fade-in flex-grow h-full flex flex-col p-6 bg-white rounded-2xl shadow-lg">
            {isPracticeLoading && renderLoading()}
            {!isPracticeLoading && practiceError && renderError()}
            {!isPracticeLoading && !practiceError && practiceSession && renderContent()}
        </div>
    );
};

export default PracticePage;
