import React, { useState, useEffect, useMemo } from 'react';
import type { Course, Subtopic, Topic } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { 
    ArrowUturnLeftIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon,
    CheckIcon,
    BookOpenIcon,
    PlayIcon,
    PauseIcon,
    ClockIcon,
    TargetIcon
} from '../common/Icons';
import SubtopicContentRedesigned from './SubtopicContentRedesigned';
import ProgressBar from '../common/ProgressBar';

interface CourseViewProps {
    onBack: () => void;
}

const CourseViewRedesigned: React.FC<CourseViewProps> = ({ onBack }) => {
    const { activeCourse, handleToggleItemComplete } = useAppContext();
    const [activeSubtopic, setActiveSubtopic] = useState<Subtopic | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Find current lesson progress and navigation
    const courseData = useMemo(() => {
        if (!activeCourse) return null;

        const allSubtopics = activeCourse.topics.flatMap(topic => 
            topic.subtopics.map(subtopic => ({ ...subtopic, topicTitle: topic.title }))
        );
        
        const currentIndex = activeSubtopic ? 
            allSubtopics.findIndex(s => s.id === activeSubtopic.id) : 0;
        
        const completedCount = activeCourse.progress.size;
        const totalCount = allSubtopics.length;
        const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        return {
            allSubtopics,
            currentIndex,
            completedCount,
            totalCount,
            progressPercentage,
            canGoPrev: currentIndex > 0,
            canGoNext: currentIndex < allSubtopics.length - 1,
            isCurrentComplete: activeSubtopic ? activeCourse.progress.has(activeSubtopic.id) : false
        };
    }, [activeCourse, activeSubtopic]);

    // Auto-select first uncompleted lesson
    useEffect(() => {
        if (activeCourse && courseData) {
            if (!activeSubtopic) {
                // Find first uncompleted lesson or first lesson
                const firstUncompleted = courseData.allSubtopics.find(s => 
                    !activeCourse.progress.has(s.id)
                );
                setActiveSubtopic(firstUncompleted || courseData.allSubtopics[0]);
            }
        }
    }, [activeCourse, courseData, activeSubtopic]);

    const navigateToSubtopic = (direction: 'prev' | 'next') => {
        if (!courseData) return;
        
        const newIndex = direction === 'prev' 
            ? courseData.currentIndex - 1 
            : courseData.currentIndex + 1;
        
        if (newIndex >= 0 && newIndex < courseData.allSubtopics.length) {
            setActiveSubtopic(courseData.allSubtopics[newIndex]);
        }
    };

    const toggleCompletion = () => {
        if (activeSubtopic && activeCourse) {
            handleToggleItemComplete(activeCourse.id, activeSubtopic.id);
        }
    };

    if (!activeCourse || !courseData) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-[var(--color-muted-foreground)]">No course selected.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-[var(--color-background)]">
            {/* Top Navigation Bar */}
            <header className="flex-shrink-0 bg-[var(--color-card)] border-b border-[var(--color-border)] px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onBack} 
                            className="flex items-center gap-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                        >
                            <ArrowUturnLeftIcon className="w-4 h-4"/>
                            <span className="text-sm font-medium">Back</span>
                        </button>
                        
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full"></div>
                            <h1 className="text-lg font-bold text-[var(--color-foreground)] truncate max-w-[300px]">
                                {activeCourse.title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Progress Stats */}
                        <div className="hidden md:flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
                                <TargetIcon className="w-4 h-4" />
                                <span>{courseData.completedCount}/{courseData.totalCount}</span>
                            </div>
                            <div className="w-24">
                                <ProgressBar progress={courseData.progressPercentage} />
                            </div>
                        </div>

                        {/* Sidebar Toggle */}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-2 rounded-lg bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] transition-colors"
                        >
                            <BookOpenIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Collapsible Sidebar */}
                {!sidebarCollapsed && (
                    <aside className="w-80 flex-shrink-0 bg-[var(--color-card)] border-r border-[var(--color-border)] flex flex-col">
                        {/* Course Overview */}
                        <div className="p-4 border-b border-[var(--color-border)]">
                            <h2 className="font-bold text-[var(--color-foreground)] mb-2">{activeCourse.title}</h2>
                            <p className="text-sm text-[var(--color-muted-foreground)] mb-3">{activeCourse.description}</p>
                            
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-[var(--color-muted-foreground)]">Progress</span>
                                <span className="font-semibold text-[var(--color-foreground)]">
                                    {Math.round(courseData.progressPercentage)}%
                                </span>
                            </div>
                            <ProgressBar progress={courseData.progressPercentage} className="mt-1" />
                        </div>

                        {/* Lessons List */}
                        <div className="flex-1 overflow-y-auto">
                            {activeCourse.topics.map((topic, topicIndex) => (
                                <div key={topicIndex} className="border-b border-[var(--color-border)] last:border-b-0">
                                    <div className="p-3 bg-[var(--color-secondary)]">
                                        <h3 className="font-semibold text-sm text-[var(--color-foreground)]">{topic.title}</h3>
                                    </div>
                                    <div className="space-y-1 p-2">
                                        {topic.subtopics.map((subtopic) => {
                                            const isActive = activeSubtopic?.id === subtopic.id;
                                            const isComplete = activeCourse.progress.has(subtopic.id);
                                            
                                            return (
                                                <button
                                                    key={subtopic.id}
                                                    onClick={() => setActiveSubtopic(subtopic)}
                                                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all group ${
                                                        isActive 
                                                            ? 'bg-[var(--color-primary)]/10 border-l-4 border-[var(--color-primary)]' 
                                                            : 'hover:bg-[var(--color-secondary-hover)]'
                                                    }`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                                                        isComplete 
                                                            ? 'bg-green-500 border-green-500 text-white' 
                                                            : 'border-[var(--color-border)]'
                                                    }`}>
                                                        {isComplete ? (
                                                            <CheckIcon className="w-3 h-3" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-[var(--color-muted-foreground)]">
                                                                {courseData.allSubtopics.findIndex(s => s.id === subtopic.id) + 1}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className={`text-sm font-medium flex-1 ${
                                                        isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-foreground)]'
                                                    } ${isComplete ? 'line-through opacity-75' : ''}`}>
                                                        {subtopic.title}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>
                )}

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {activeSubtopic ? (
                        <>
                            {/* Lesson Header */}
                            <div className="flex-shrink-0 bg-[var(--color-card)] border-b border-[var(--color-border)] px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] mb-1">
                                            <span>Lesson {courseData.currentIndex + 1} of {courseData.totalCount}</span>
                                            <span>•</span>
                                            <span>{activeSubtopic.topicTitle}</span>
                                        </div>
                                        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
                                            {activeSubtopic.title}
                                        </h1>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Mark Complete Button */}
                                        <button
                                            onClick={toggleCompletion}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                                courseData.isCurrentComplete
                                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                                    : 'bg-[var(--color-primary)] text-white hover:opacity-90'
                                            }`}
                                        >
                                            <CheckIcon className="w-4 h-4" />
                                            {courseData.isCurrentComplete ? 'Completed' : 'Mark Complete'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Lesson Content */}
                            <div className="flex-1 overflow-y-auto">
                                <SubtopicContentRedesigned 
                                    course={activeCourse}
                                    topic={activeCourse.topics.find(t => t.subtopics.some(s => s.id === activeSubtopic.id))!}
                                    subtopic={activeSubtopic}
                                    isComplete={courseData.isCurrentComplete}
                                />
                            </div>

                            {/* Bottom Navigation */}
                            <div className="flex-shrink-0 bg-[var(--color-card)] border-t border-[var(--color-border)] px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => navigateToSubtopic('prev')}
                                        disabled={!courseData.canGoPrev}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                            courseData.canGoPrev
                                                ? 'bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-[var(--color-foreground)]'
                                                : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] cursor-not-allowed'
                                        }`}
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>5-10 min read</span>
                                    </div>

                                    <button
                                        onClick={() => navigateToSubtopic('next')}
                                        disabled={!courseData.canGoNext}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                            courseData.canGoNext
                                                ? 'bg-[var(--color-primary)] hover:opacity-90 text-white'
                                                : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] cursor-not-allowed'
                                        }`}
                                    >
                                        Next
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-[var(--color-muted-foreground)]">Select a lesson to begin.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CourseViewRedesigned;
