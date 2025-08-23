
import React from 'react';
import { Course, View } from '../../types';
import ProgressBar from '../common/ProgressBar';
import { PlayIcon, BookOpenIcon } from '../common/Icons';

interface ContinueLearningCardProps {
    course: Course | null;
    onSelectCourse: (courseId: string) => void;
    hasCourses: boolean;
    onNavigate: (view: View) => void;
}

const ContinueLearningCard: React.FC<ContinueLearningCardProps> = ({ course, onSelectCourse, hasCourses, onNavigate }) => {
    if (!course) {
        return (
             <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-center text-center h-full">
                <div>
                    <h3 className="text-xl font-bold text-[var(--color-foreground)]">{hasCourses ? 'All topics completed!' : 'Welcome!'}</h3>
                    <p className="text-[var(--color-muted-foreground)] mt-1">{hasCourses ? 'Ready to learn something new?' : 'Create a new learning path to get started.'}</p>
                </div>
            </div>
        );
    }

    const totalLessons = course.topics.reduce((acc, topic) => acc + topic.subtopics.length, 0);
    const completedLessons = course.progress.size;
    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return (
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-full group animated-glow-border">
            <div>
                <p className="text-sm font-semibold text-[var(--color-primary)]">CONTINUE LEARNING</p>
                <h3 className="text-2xl font-bold text-[var(--color-foreground)] mt-1 truncate">{course.title}</h3>
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                         <span className="text-xs font-semibold text-[var(--color-muted-foreground)]">Progress</span>
                         <span className="text-xs font-bold text-[var(--color-foreground)]">{completedLessons} / {totalLessons}</span>
                    </div>
                    <ProgressBar progress={progressPercentage} />
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
                 <button 
                    onClick={() => onSelectCourse(course.id)}
                    className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                >
                    <PlayIcon className="w-5 h-5"/>
                    Continue
                </button>
            </div>
        </div>
    );
};

export default ContinueLearningCard;