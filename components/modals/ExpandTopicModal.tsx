



import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CloseIcon, DocumentMagnifyingGlassIcon, LoadingSpinnerIcon } from '../common/Icons';
import { Course, Subtopic, Topic } from '../../types';

const ExpandTopicModal: React.FC = () => {
    const { expandTopicModalState, closeExpandTopicModal, handleExpandTopicInModule } = useAppContext();
    const [prompt, setPrompt] = useState('');
    const [selectedSubtopicId, setSelectedSubtopicId] = useState<string | null>(null);

    const { course, isLoading, error } = expandTopicModalState;

    useEffect(() => {
        if (expandTopicModalState.isOpen) {
            setPrompt('');
            setSelectedSubtopicId(null);
        }
    }, [expandTopicModalState.isOpen]);
    
    useEffect(() => {
        // Pre-select the first subtopic of the first topic if none is selected
        if (course && !selectedSubtopicId) {
            setSelectedSubtopicId(course.topics[0]?.subtopics[0]?.id || null);
        }
    }, [course, selectedSubtopicId]);


    if (!expandTopicModalState.isOpen || !course) return null;

    const allSubtopics: { topic: Topic, subtopic: Subtopic }[] = course.topics.flatMap(topic => 
        topic.subtopics.map(subtopic => ({ topic, subtopic }))
    );

    const handleGenerate = () => {
        if (!prompt.trim() || !selectedSubtopicId) return;
        const selection = allSubtopics.find(item => item.subtopic.id === selectedSubtopicId);
        if (selection) {
            handleExpandTopicInModule(course, selection.topic, selection.subtopic, prompt);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" 
            onClick={isLoading ? undefined : closeExpandTopicModal}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-[var(--color-card)] rounded-xl shadow-2xl p-8 w-full max-w-2xl border border-[var(--color-border)] animate-modal-content"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                            <DocumentMagnifyingGlassIcon className="w-7 h-7 text-green-500" />
                            Deepen a Topic
                        </h2>
                        <p className="text-[var(--color-muted-foreground)] mt-1">Select a subtopic and tell the AI how to expand it.</p>
                    </div>
                    {!isLoading && (
                        <button onClick={closeExpandTopicModal} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-48">
                        <LoadingSpinnerIcon className="w-10 h-10 text-green-500" />
                        <p className="mt-4 text-[var(--color-foreground)] font-semibold">The AI is creating new lessons...</p>
                        <p className="mt-1 text-[var(--color-muted-foreground)]">This may take a moment.</p>
                    </div>
                ) : (
                    <>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="subtopic-select" className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Subtopic to expand</label>
                                <select 
                                    id="subtopic-select"
                                    value={selectedSubtopicId || ''}
                                    onChange={(e) => setSelectedSubtopicId(e.target.value)}
                                    className="w-full p-2 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    {course.topics.map(topic => (
                                        <optgroup label={topic.title} key={topic.title}>
                                            {topic.subtopics.map(subtopic => (
                                                <option key={subtopic.id} value={subtopic.id}>{subtopic.title}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="expand-prompt" className="block text-sm font-medium text-[var(--color-foreground)] mb-1">How should we expand it?</label>
                                <textarea
                                    id="expand-prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., 'Add lessons about practical applications in finance' or 'Go deeper into the underlying mathematics.'"
                                    className="w-full h-24 p-3 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-green-500"
                                    rows={3}
                                />
                            </div>
                            {error && <p className="text-center text-red-500">{error}</p>}
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button onClick={closeExpandTopicModal} className="px-5 py-2 bg-[var(--color-secondary-hover)] text-[var(--color-foreground)] font-bold rounded-lg hover:bg-[var(--color-border)] border border-[var(--color-border)]">
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || !selectedSubtopicId}
                                className="px-5 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:bg-gray-400 shadow-lg hover:shadow-green-500/30"
                            >
                                Add New Lessons
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ExpandTopicModal;