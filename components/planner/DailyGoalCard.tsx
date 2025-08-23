
import React, { useMemo } from 'react';
import { LearningPlan, Course } from '../../types';
import { useAppContext } from '../../context/AppContext';
import ProgressBar from '../common/ProgressBar';
import { PlayIcon, CheckCircleIcon } from '../common/Icons';

interface DailyGoalCardProps {
    plan: LearningPlan;
}

const DailyGoalCard: React.FC<DailyGoalCardProps> = ({ plan }) => {
    const { courses, handleSelectCourse } = useAppContext();
    const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c])), [courses]);

    const dailyGoal = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTime = today.getTime();
        
        const tasksForToday = plan.dailyTasks.filter(task => {
            const taskDate = new Date(task.date);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === todayTime;
        });

        for (const task of tasksForToday) {
            const course = courseMap.get(task.courseId);
            if (course) {
                const totalLessons = course.topics.reduce((sum, t) => sum + t.subtopics.length, 0);
                const isCompleted = totalLessons > 0 && course.progress.size === totalLessons;
                if (!isCompleted) {
                    return { task, course, totalLessons };
                }
            }
        }
        return null;
    }, [plan, courseMap]);

    if (!dailyGoal) {
        return (
            <div className="bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 p-6 rounded-2xl border border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-center text-center h-full">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mb-4 sm:mb-0 sm:mr-6" />
                <div>
                    <h3 className="text-xl font-bold text-[var(--color-foreground)]">All Goals for Today Complete!</h3>
                    <p className="text-[var(--color-muted-foreground)] mt-1">Great job! Feel free to work ahead or explore your content library.</p>
                </div>
            </div>
        );
    }
    
    const { course, totalLessons } = dailyGoal;
    const completedLessons = course.progress.size;
    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;


    return (
        <div className="bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 p-6 rounded-2xl border-2 border-[var(--color-primary)]/50 flex flex-col justify-between h-full group animate-pulse-glow">
            <div>
                <p className="text-sm font-semibold text-[var(--color-primary)]">YOUR DAILY GOAL</p>
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
                    onClick={() => handleSelectCourse(course.id)}
                    className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                >
                    <PlayIcon className="w-5 h-5"/>
                    Continue Learning
                </button>
            </div>
        </div>
    );
};

export default DailyGoalCard;
