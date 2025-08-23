


import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PencilIcon, LoadingSpinnerIcon, SparklesIcon, LightBulbIcon } from '../common/Icons';
import MarkdownRenderer from '../common/MarkdownRenderer';

const ArticleCreatorPage: React.FC = () => {
    const { articleCreatorState, handleGenerateBlogPost, folders } = useAppContext();
    const { isLoading, error, title, subtitle, blogPost, ideas } = articleCreatorState;
    const [topic, setTopic] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    const handleGenerateClick = () => {
        if (topic.trim()) {
            handleGenerateBlogPost(topic, selectedFolderId);
        }
    };

    const handleIdeaClick = (idea: string) => {
        setTopic(idea);
        handleGenerateBlogPost(idea, selectedFolderId);
    };

    return (
        <>
            <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-lg">
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateClick()}
                        placeholder="Enter your article topic..."
                        className="w-full flex-grow px-4 py-3 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                    <button
                        onClick={handleGenerateClick}
                        disabled={isLoading || !topic.trim()}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
                    >
                        {isLoading ? <LoadingSpinnerIcon className="w-5 h-5"/> : <SparklesIcon className="w-5 h-5"/>}
                        {isLoading ? 'Generating...' : 'Generate Article'}
                    </button>
                </div>
                 <div className="mt-4">
                    <label htmlFor="folder-select" className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-1">Save to Folder (Optional)</label>
                    <select
                        id="folder-select"
                        value={selectedFolderId || ''}
                        onChange={(e) => setSelectedFolderId(e.target.value || null)}
                        className="w-full px-4 py-2 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                        <option value="">Uncategorized</option>
                        {folders.map(folder => (
                            <option key={folder.id} value={folder.id}>{folder.name}</option>
                        ))}
                    </select>
                </div>
                {error && <p className="text-center text-red-500 mt-4">{error}</p>}
            </div>

            <div className="mt-8">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center text-center p-8">
                        <LoadingSpinnerIcon className="h-10 w-10 text-[var(--color-primary)]" />
                        <h2 className="text-xl font-bold mt-6 text-[var(--color-foreground)]">AI is writing your article...</h2>
                        <p className="text-base text-[var(--color-muted-foreground)] mt-2">This may take a few moments.</p>
                    </div>
                )}
                {blogPost && !isLoading && (
                    <article className="bg-[var(--color-card)] p-6 sm:p-8 md:p-12 rounded-2xl border border-[var(--color-border)] shadow-lg animate-fade-in-up">
                        <header className="text-center mb-10 border-b border-dashed border-[var(--color-border)] pb-8">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--color-foreground)] leading-tight">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="mt-4 text-lg sm:text-xl text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
                                    {subtitle}
                                </p>
                            )}
                        </header>
                        
                        <div className="max-w-3xl mx-auto">
                            <MarkdownRenderer content={blogPost} />
                        </div>
                        
                        {ideas.length > 0 && (
                            <footer className="mt-12 pt-8 border-t border-dashed border-[var(--color-border)]">
                                <h3 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-3 mb-4">
                                    <LightBulbIcon className="w-7 h-7 text-yellow-400" />
                                    Next Article Ideas
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {ideas.map((idea, index) => (
                                        <button 
                                            key={index}
                                            onClick={() => handleIdeaClick(idea)}
                                            className="px-4 py-2 bg-[var(--color-secondary)] text-[var(--color-primary)] font-semibold rounded-full border border-[var(--color-border)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)] transition-all"
                                        >
                                            {idea}
                                        </button>
                                    ))}
                                </div>
                            </footer>
                        )}
                    </article>
                )}
            </div>
        </>
    );
};

export default ArticleCreatorPage;