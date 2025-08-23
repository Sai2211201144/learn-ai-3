

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { RectangleGroupIcon, LoadingSpinnerIcon, SparklesIcon, BookOpenIcon, CheckCircleIcon } from '../common/Icons';

const BulkArticleCreatorPage: React.FC = () => {
    const { 
        bulkArticleGenerationState, 
        handleGenerateBulkArticlesForPage, 
        resetBulkArticleGeneration,
        folders,
        handleSelectArticle
    } = useAppContext();
    const { isLoading, error, progressMessage, generatedArticles } = bulkArticleGenerationState;
    
    const [syllabus, setSyllabus] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    useEffect(() => {
        // Reset state when the component is unmounted
        return () => {
            resetBulkArticleGeneration();
        };
    }, [resetBulkArticleGeneration]);

    const handleGenerateClick = () => {
        if (syllabus.trim()) {
            handleGenerateBulkArticlesForPage(syllabus, selectedFolderId);
        }
    };

    return (
        <>
            <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="syllabus-input" className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Topic / Syllabus</label>
                        <textarea
                            id="syllabus-input"
                            value={syllabus}
                            onChange={(e) => setSyllabus(e.target.value)}
                            placeholder="e.g., A complete guide to Python for beginners, covering variables, data types, loops, functions, and object-oriented programming."
                            className="w-full h-36 p-3 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            disabled={isLoading}
                        />
                    </div>
                     <div>
                        <label htmlFor="folder-select" className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Save to Folder (Optional)</label>
                        <select
                            id="folder-select"
                            value={selectedFolderId || ''}
                            onChange={(e) => setSelectedFolderId(e.target.value || null)}
                            className="w-full px-4 py-2 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            disabled={isLoading}
                        >
                            <option value="">Uncategorized</option>
                            {folders.map(folder => (
                                <option key={folder.id} value={folder.id}>{folder.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleGenerateClick}
                        disabled={isLoading || !syllabus.trim()}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
                    >
                        {isLoading ? <LoadingSpinnerIcon className="w-5 h-5"/> : <SparklesIcon className="w-5 h-5"/>}
                        {isLoading ? 'Generating...' : 'Generate Articles'}
                    </button>
                </div>
                {error && <p className="text-center text-red-500 mt-4">{error}</p>}
            </div>

            {(isLoading || generatedArticles.length > 0) && (
                 <div className="mt-8">
                    <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-lg animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-4">Generation Progress</h2>
                        {progressMessage && (
                            <div className="flex items-center gap-3 p-4 bg-[var(--color-secondary)] rounded-lg mb-4">
                                {isLoading ? <LoadingSpinnerIcon className="w-5 h-5 text-[var(--color-primary)]"/> : <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                                <p className="text-sm font-medium text-[var(--color-muted-foreground)]">{progressMessage}</p>
                            </div>
                        )}
                        {generatedArticles.length > 0 && (
                             <div className="space-y-3">
                                {generatedArticles.map(article => (
                                    <div key={article.id} className="bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg p-3 flex justify-between items-center">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-[var(--color-foreground)] truncate">{article.title}</p>
                                            <p className="text-xs text-[var(--color-muted-foreground)] truncate">{article.subtitle}</p>
                                        </div>
                                         <button 
                                            onClick={() => handleSelectArticle(article.id)}
                                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 bg-[var(--color-secondary-hover)] text-[var(--color-foreground)] font-semibold rounded-md hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] border border-[var(--color-border)] text-sm"
                                        >
                                            <BookOpenIcon className="w-4 h-4"/>
                                            View
                                        </button>
                                    </div>
                                ))}
                             </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default BulkArticleCreatorPage;