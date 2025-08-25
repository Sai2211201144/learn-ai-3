import React, { useState } from 'react';
import { Course, Subtopic, Topic, ContentBlock } from '../../types';
import { useAppContext } from '../../context/AppContext';
import CodeBlock from './CodeBlock';
import DiagramBlock from './DiagramBlock';
import InteractiveModelBlock from './InteractiveModelBlock';
import HyperparameterSimulatorBlock from './HyperparameterSimulatorBlock';
import TriageChallengeBlock from './TriageChallengeBlock';
import QuizBlock from './QuizBlock';
import TextContentBlock from './TextContentBlock';
import { 
    FlashcardsIcon, 
    ChatBubbleOvalLeftEllipsisIcon, 
    LightBulbIcon,
    BeakerIcon, 
    WrenchScrewdriverIcon,
    QuizIcon,
    SparklesIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '../common/Icons';

interface SubtopicContentProps {
    course: Course;
    topic: Topic;
    subtopic: Subtopic;
    isComplete: boolean;
}

const ActionButton: React.FC<{ 
    onClick: () => void; 
    icon: React.ReactNode; 
    title: string; 
    description: string;
    variant?: 'default' | 'primary';
}> = ({ onClick, icon, title, description, variant = 'default' }) => (
    <button
        onClick={onClick}
        className={`group p-4 rounded-xl border transition-all duration-200 text-left hover:shadow-lg hover:-translate-y-1 ${
            variant === 'primary'
                ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white border-transparent'
                : 'bg-[var(--color-card)] border-[var(--color-border)] hover:border-[var(--color-primary)]'
        }`}
    >
        <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                variant === 'primary' 
                    ? 'bg-white/20' 
                    : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
            }`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm mb-1 ${
                    variant === 'primary' ? 'text-white' : 'text-[var(--color-foreground)]'
                }`}>
                    {title}
                </h3>
                <p className={`text-xs ${
                    variant === 'primary' ? 'text-white/80' : 'text-[var(--color-muted-foreground)]'
                }`}>
                    {description}
                </p>
            </div>
        </div>
    </button>
);

const SubtopicContentRedesigned: React.FC<SubtopicContentProps> = ({ course, topic, subtopic, isComplete }) => {
    const { 
        handleShowTopicStory,
        handleShowTopicAnalogy,
        handleShowTopicFlashcards,
        handleStartTopicPractice,
        handleGenerateProject,
        handleUpdateContentBlock,
        handleShowSocraticQuiz,
        handleCheckUnderstanding,
    } = useAppContext();

    const [toolkitExpanded, setToolkitExpanded] = useState(false);

    const renderContentBlock = (block: ContentBlock, index: number) => {
        const blockWrapperClass = "mb-6 last:mb-0";

        switch (block.type) {
            case 'text':
                return block.text ? (
                    <div key={block.id} className={blockWrapperClass}>
                        <TextContentBlock text={block.text} />
                    </div>
                ) : null;
            case 'code':
                return block.code ? (
                    <div key={block.id} className={blockWrapperClass}>
                        <CodeBlock code={block.code} />
                    </div>
                ) : null;
            case 'quiz':
                return block.quiz ? (
                    <div key={block.id} className={`${blockWrapperClass} p-6 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)]`}>
                        <QuizBlock quizData={block.quiz} />
                    </div>
                ) : null;
            case 'diagram':
                return block.diagram ? (
                    <div key={block.id} className={`${blockWrapperClass} p-6 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)]`}>
                        <DiagramBlock 
                            mermaidString={block.diagram} 
                            blockId={block.id} 
                            onUpdateDiagram={(newSyntax) => handleUpdateContentBlock(course.id, subtopic.id, block.id, newSyntax)} 
                        />
                    </div>
                ) : null;
            case 'interactiveModel':
                return block.interactiveModel ? (
                    <div key={block.id} className={`${blockWrapperClass} p-6 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)]`}>
                        <InteractiveModelBlock modelData={block.interactiveModel} />
                    </div>
                ) : null;
            case 'hyperparameterSimulator':
                return block.hyperparameterSimulator ? (
                    <div key={block.id} className={`${blockWrapperClass} p-6 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)]`}>
                        <HyperparameterSimulatorBlock modelData={block.hyperparameterSimulator} />
                    </div>
                ) : null;
            case 'triageChallenge':
                return block.triageChallenge ? (
                    <div key={block.id} className={`${blockWrapperClass} p-6 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)]`}>
                        <TriageChallengeBlock challengeData={block.triageChallenge} />
                    </div>
                ) : null;
            default:
                return null;
        }
    };

    if (subtopic.type !== 'article') {
        return (
            <div className="p-6">
                <p className="text-[var(--color-muted-foreground)]">Content type not supported in redesigned view.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Learning Objective */}
            {subtopic.data.objective && (
                <div className="mb-8 p-6 bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 rounded-xl border border-[var(--color-primary)]/20">
                    <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">What you'll learn</h2>
                    <p className="text-[var(--color-muted-foreground)]">{subtopic.data.objective}</p>
                </div>
            )}

            {/* Main Content */}
            <div className="prose prose-lg max-w-none mb-8">
                {subtopic.data.contentBlocks.map((block, index) => renderContentBlock(block, index))}
            </div>

            {/* Learning Toolkit */}
            <div className="mb-8">
                <button
                    onClick={() => setToolkitExpanded(!toolkitExpanded)}
                    className="w-full flex items-center justify-between p-4 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                            <SparklesIcon className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[var(--color-foreground)] text-left">Learning Toolkit</h3>
                            <p className="text-sm text-[var(--color-muted-foreground)] text-left">
                                Interactive tools to deepen your understanding
                            </p>
                        </div>
                    </div>
                    {toolkitExpanded ? 
                        <ChevronUpIcon className="w-5 h-5 text-[var(--color-muted-foreground)]" /> : 
                        <ChevronDownIcon className="w-5 h-5 text-[var(--color-muted-foreground)]" />
                    }
                </button>

                {toolkitExpanded && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
                        <ActionButton 
                            onClick={() => handleShowTopicStory(subtopic)} 
                            icon={<ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5"/>} 
                            title="Story Mode"
                            description="Learn through an engaging AI-generated story"
                        />
                        <ActionButton 
                            onClick={() => handleShowTopicFlashcards(subtopic)} 
                            icon={<FlashcardsIcon className="w-5 h-5"/>} 
                            title="Flashcards"
                            description="Review key concepts with smart flashcards"
                        />
                        <ActionButton 
                            onClick={() => handleShowTopicAnalogy(subtopic)} 
                            icon={<LightBulbIcon className="w-5 h-5"/>} 
                            title="Analogy"
                            description="Understand through simple real-world comparisons"
                        />
                        <ActionButton 
                            onClick={() => handleShowSocraticQuiz(subtopic)} 
                            icon={<QuizIcon className="w-5 h-5" />} 
                            title="Quick Quiz"
                            description="Test your knowledge with adaptive questions"
                        />
                        <ActionButton 
                            onClick={() => handleStartTopicPractice(course, topic, subtopic, () => {})} 
                            icon={<BeakerIcon className="w-5 h-5"/>} 
                            title="Practice Lab"
                            description="Hands-on practice with concepts and exercises"
                        />
                        <ActionButton 
                            onClick={() => handleGenerateProject(course, subtopic)} 
                            icon={<WrenchScrewdriverIcon className="w-5 h-5"/>} 
                            title="Build Project"
                            description="Apply your knowledge with a guided project"
                        />
                    </div>
                )}
            </div>

            {/* Understanding Check - Always Visible */}
            <div className="sticky bottom-6">
                <ActionButton 
                    onClick={() => handleCheckUnderstanding(subtopic)}
                    icon={<SparklesIcon className="w-5 h-5" />}
                    title="Check Understanding & Continue"
                    description="Validate your learning with AI assessment"
                    variant="primary"
                />
            </div>
        </div>
    );
};

export default SubtopicContentRedesigned;
