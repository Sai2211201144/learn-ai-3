import React, { useMemo, useState, useRef, useEffect } from 'react';
import { DailyTask, Course } from '../../types';
import { useAppContext } from '../../context/AppContext';
import CircularProgressBar from '../common/CircularProgressBar';
import { CheckIcon, EllipsisVerticalIcon, ArrowLeftIcon, ArrowRightIcon, TrashIcon } from '../common/Icons';

interface PlannerTaskCardProps {
    planId: string;
    task: DailyTask;
    course: Course;
    currentDate: number;
}

const PlannerTaskCard: React.FC<PlannerTaskCardProps> = ({ planId, task, course, currentDate }) => {
    const { handleSelectCourse, handleRescheduleTask, handleDeleteTaskFromPlan } = useAppContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const { totalLessons, progressPercentage, isCompleted } = useMemo(() => {
        const total = course.topics.reduce((sum, t) => sum + t.subtopics.length, 0);
        const completed = course.progress.size;
        const percentage = total > 0 ? (completed / total) * 100 : 0;
        const allDone = total > 0 && completed === total;
        return { totalLessons: total, progressPercentage: percentage, isCompleted: allDone };
    }, [course.topics, course.progress]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMove = (direction: 'prev' | 'next') => {
        const oneDay = 24 * 60 * 60 * 1000;
        const newDate = direction === 'prev' ? currentDate - oneDay : currentDate + oneDay;
        handleRescheduleTask(planId, task.id, newDate);
        setIsMenuOpen(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to remove "${course.title}" from your plan?`)) {
            handleDeleteTaskFromPlan(planId, task.id);
        }
        setIsMenuOpen(false);
    };

    return (
        <div 
            className={`w-full text-left p-2.5 rounded-lg border-l-4 transition-all duration-200 group flex items-start gap-2 relative ${isCompleted ? 'bg-green-500/5 border-green-500/50 opacity-70 hover:opacity-100' : 'bg-[var(--color-card)] border-[var(--color-primary)] hover:bg-[var(--color-secondary-hover)]'}`}
        >
            <div className="flex-shrink-0 cursor-pointer" onClick={() => handleSelectCourse(course.id)}>
                <CircularProgressBar 
                    progress={progressPercentage}
                    size={36}
                    strokeWidth={4}
                >
                    {isCompleted ? (
                        <CheckIcon className="w-5 h-5 text-green-500" />
                    ) : (
                        <span className="text-[10px] font-bold text-[var(--color-muted-foreground)]">
                           {course.progress.size}/{totalLessons}
                        </span>
                    )}
                </CircularProgressBar>
            </div>
            <div className="flex-grow min-w-0 pt-1 cursor-pointer" onClick={() => handleSelectCourse(course.id)}>
                <p className={`font-semibold text-sm leading-tight ${isCompleted ? 'line-through text-[var(--color-muted-foreground)]' : 'text-[var(--color-foreground)]'}`}>
                    {course.title}
                </p>
            </div>
            <div className="relative flex-shrink-0">
                <button 
                    onClick={() => setIsMenuOpen(prev => !prev)} 
                    className="p-1 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 text-[var(--color-muted-foreground)] hover:bg-[var(--color-card)]"
                >
                    <EllipsisVerticalIcon className="w-4 h-4" />
                </button>
                {isMenuOpen && (
                    <div ref={menuRef} className="absolute top-full right-0 mt-1 w-48 bg-[var(--color-card)] rounded-lg shadow-2xl border border-[var(--color-border)] z-20 p-1.5 animate-fade-in-up-fast">
                        <button onClick={() => handleMove('prev')} className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]">
                            <ArrowLeftIcon className="w-4 h-4" /> Move a day back
                        </button>
                        <button onClick={() => handleMove('next')} className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]">
                            <ArrowRightIcon className="w-4 h-4" /> Move a day forward
                        </button>
                        <div className="my-1 border-t border-[var(--color-border)]"></div>
                        <button onClick={handleDelete} className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10">
                            <TrashIcon className="w-4 h-4" /> Delete Task
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlannerTaskCard;