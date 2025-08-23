import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CommandLineIcon, LinkIcon, DocumentTextIcon, PhotoIcon, LoadingSpinnerIcon, ArrowUpOnSquareIcon } from '../common/Icons';
import ExplanationDisplay from './ExplanationDisplay';

const CodeExplainerPage: React.FC = () => {
    const { codeExplanation, handleGenerateCodeExplanation } = useAppContext();
    const { isLoading, content, error } = codeExplanation;
    const [activeTab, setActiveTab] = useState<'link' | 'text' | 'image'>('text');
    const [textInput, setTextInput] = useState('');
    const [linkInput, setLinkInput] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        switch (activeTab) {
            case 'link':
                if (linkInput.trim()) handleGenerateCodeExplanation({ type: 'link', content: linkInput });
                break;
            case 'text':
                if (textInput.trim()) handleGenerateCodeExplanation({ type: 'text', content: textInput });
                break;
            case 'image':
                if (imageFile) handleGenerateCodeExplanation({ type: 'image', content: imageFile });
                break;
        }
    };

    const isSubmitDisabled = 
        isLoading ||
        (activeTab === 'link' && !linkInput.trim()) ||
        (activeTab === 'text' && !textInput.trim()) ||
        (activeTab === 'image' && !imageFile);

    return (
        <div className="w-full max-w-4xl animate-fade-in-up">
            <header className="pb-6 border-b border-[var(--color-border)] mb-8 text-center">
                <CommandLineIcon className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-2" />
                <h1 className="text-4xl font-bold text-[var(--color-foreground)]">AI Code Explainer</h1>
                <p className="text-base text-[var(--color-muted-foreground)] mt-2">Get a detailed, structured explanation for any coding problem.</p>
            </header>

            <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-lg">
                <div className="flex border-b border-[var(--color-border)] mb-4">
                    <TabButton icon={<DocumentTextIcon className="w-5 h-5"/>} label="Text" isActive={activeTab === 'text'} onClick={() => setActiveTab('text')} />
                    <TabButton icon={<LinkIcon className="w-5 h-5"/>} label="Link" isActive={activeTab === 'link'} onClick={() => setActiveTab('link')} />
                    <TabButton icon={<PhotoIcon className="w-5 h-5"/>} label="Image" isActive={activeTab === 'image'} onClick={() => setActiveTab('image')} />
                </div>
                
                <div className="min-h-[150px]">
                    {activeTab === 'text' && (
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Paste your problem description here..."
                            className="w-full h-36 p-3 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                    )}
                    {activeTab === 'link' && (
                         <input
                            type="url"
                            value={linkInput}
                            onChange={(e) => setLinkInput(e.target.value)}
                            placeholder="https://leetcode.com/problems/two-sum/"
                            className="w-full p-3 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                    )}
                    {activeTab === 'image' && (
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-36 border-2 border-dashed border-[var(--color-border)] rounded-lg flex flex-col items-center justify-center text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Problem preview" className="max-h-full max-w-full object-contain rounded-md" />
                                ) : (
                                    <>
                                        <PhotoIcon className="w-10 h-10 mb-2"/>
                                        <span>Click to upload an image</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
                    >
                        {isLoading ? <LoadingSpinnerIcon className="w-5 h-5"/> : <ArrowUpOnSquareIcon className="w-5 h-5"/>}
                        {isLoading ? 'Generating...' : 'Generate Explanation'}
                    </button>
                </div>
            </div>
            
            <div className="mt-8">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center text-center p-8">
                        <LoadingSpinnerIcon className="h-10 w-10 text-[var(--color-primary)]" />
                        <h2 className="text-xl font-bold mt-6 text-[var(--color-foreground)]">AI is analyzing the problem...</h2>
                        <p className="text-base text-[var(--color-muted-foreground)] mt-2">This may take a moment.</p>
                    </div>
                )}
                {error && (
                     <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/20 text-center">
                        <p className="font-bold">An Error Occurred</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {content && !isLoading && (
                    <ExplanationDisplay markdownContent={content} />
                )}
            </div>
        </div>
    );
};

const TabButton: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors ${isActive ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'}`}
    >
        {icon} {label}
    </button>
);

export default CodeExplainerPage;
