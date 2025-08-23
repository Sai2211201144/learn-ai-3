import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CloseIcon, FolderPlusIcon, LoadingSpinnerIcon } from '../common/Icons';

const CreateTopicsForFolderModal: React.FC = () => {
    const { createTopicsModalState, closeCreateTopicsModal, handleBulkGenerateCourses } = useAppContext();
    const [topics, setTopics] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!createTopicsModalState.isOpen) return null;

    const topicList = topics.split('\n').filter(t => t.trim() !== '');

    const handleGenerate = async () => {
        if (!topicList.length || !createTopicsModalState.folderId) return;
        setIsLoading(true);
        await handleBulkGenerateCourses(topicList, createTopicsModalState.folderId);
        setIsLoading(false);
        setTopics('');
        closeCreateTopicsModal();
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" 
            onClick={isLoading ? undefined : closeCreateTopicsModal}
        >
            <div
                className="bg-[var(--color-card)] rounded-xl shadow-2xl p-8 w-full max-w-2xl border border-[var(--color-border)] animate-modal-content flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                            <FolderPlusIcon className="w-7 h-7 text-[var(--color-primary)]" />
                            Add Topics to Folder
                        </h2>
                        <p className="text-[var(--color-muted-foreground)] mt-1">Enter topic names (one per line) to generate courses and add them to this folder.</p>
                    </div>
                     {!isLoading && (
                        <button onClick={closeCreateTopicsModal} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
                
                <textarea
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    placeholder="e.g.,&#10;React Hooks&#10;Advanced TypeScript&#10;State Management with Redux"
                    className="w-full h-48 p-3 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                    disabled={isLoading}
                />

                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                        {topicList.length > 0 ? `${topicList.length} topic(s) will be generated.` : 'No topics entered.'}
                    </p>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || topicList.length === 0}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
                    >
                        {isLoading ? <LoadingSpinnerIcon className="w-5 h-5"/> : '✨'}
                        {isLoading ? 'Generating...' : `Generate Courses`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTopicsForFolderModal;