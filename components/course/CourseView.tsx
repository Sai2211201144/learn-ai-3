

import React, { useState, useEffect } from 'react';
import type { Course, Subtopic } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { ArrowUturnLeftIcon } from '../common/Icons';
import TopicAccordion from './LessonAccordion';
import SubtopicContent from './CourseSidebar';

interface CourseViewProps {
    onBack: () => void;
}

const CourseView: React.FC<CourseViewProps> = ({ onBack }) => {
    const { activeCourse } = useAppContext();
    const [activeSubtopic, setActiveSubtopic] = useState<Subtopic | null>(null);

    useEffect(() => {
        if (activeCourse && activeCourse.topics.length > 0 && activeCourse.topics[0].subtopics.length > 0) {
            // Find the first uncompleted subtopic, or default to the first one
            let firstSubtopic = activeCourse.topics[0].subtopics[0];
            for (const topic of activeCourse.topics) {
                const uncompleted = topic.subtopics.find(s => !activeCourse.progress.has(s.id));
                if (uncompleted) {
                    firstSubtopic = uncompleted;
                    break;
                }
            }
            setActiveSubtopic(firstSubtopic);
        } else {
            setActiveSubtopic(null);
        }
    }, [activeCourse]);

    if (!activeCourse) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p>No course selected.</p>
            </div>
        );
    }
    
    const totalSubtopics = activeCourse.topics.reduce((acc, topic) => acc + topic.subtopics.length, 0);
    const completedSubtopics = activeCourse.progress.size;

    return (
        <div className="w-full h-full flex flex-col sm:flex-row gap-0 sm:gap-8">
            {/* Left Column: Course Index */}
            <aside className="w-full sm:w-1/3 md:w-2/5 flex-shrink-0 h-full flex flex-col">
                <div className="flex-shrink-0 mb-4">
                    <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] text-sm font-semibold">
                        <ArrowUturnLeftIcon className="w-4 h-4"/>
                        Back to Today
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto custom-scrollbar-thin pr-4 -mr-4">
                    <div className="p-4 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-sm">
                         <h1 className="text-2xl font-extrabold text-[var(--color-foreground)] leading-tight">
                            {activeCourse.title}
                        </h1>
                        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                            {activeCourse.description}
                        </p>
                        <p className="mt-4 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">{completedSubtopics} / {totalSubtopics} Steps Completed</p>
                    </div>
                    
                    <div className="mt-4 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-sm">
                        {activeCourse.topics.map((topic, index) => (
                            <TopicAccordion 
                                key={index} 
                                topic={topic} 
                                progress={activeCourse.progress}
                                activeSubtopicId={activeSubtopic?.id || null}
                                onSelectSubtopic={setActiveSubtopic}
                            />
                        ))}
                    </div>
                </div>
            </aside>
            {/* Right Column: Content */}
            <main className="flex-grow h-full overflow-y-auto custom-scrollbar">
                {activeSubtopic && activeCourse ? (
                    <SubtopicContent 
                        course={activeCourse}
                        topic={activeCourse.topics.find(t => t.subtopics.some(s => s.id === activeSubtopic.id))!}
                        subtopic={activeSubtopic}
                        isComplete={activeCourse.progress.has(activeSubtopic.id)}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-[var(--color-muted-foreground)]">Select a lesson to begin.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CourseView;