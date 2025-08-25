import React from 'react';
import { Course } from '../../types';
import { CheckIcon, BookOpenIcon, TargetIcon } from '../common/Icons';
import ProgressBar from '../common/ProgressBar';

interface EnhancedProgressTrackerProps {
    course: Course;
    currentSubtopicId?: string;
    className?: string;
}

const EnhancedProgressTracker: React.FC<EnhancedProgressTrackerProps> = ({ 
    course, 
    currentSubtopicId, 
    className = '' 
}) => {
    const allSubtopics = course.topics.flatMap(topic => topic.subtopics);
    const completedCount = course.progress.size;
    const totalCount = allSubtopics.length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    const currentIndex = currentSubtopicId ? 
        allSubtopics.findIndex(s => s.id === currentSubtopicId) : -1;

    const getTopicProgress = (topicIndex: number) => {
        const topic = course.topics[topicIndex];
        const topicCompleted = topic.subtopics.filter(s => course.progress.has(s.id)).length;
        const topicTotal = topic.subtopics.length;
        return { completed: topicCompleted, total: topicTotal };
    };

    return (
        <div className={`bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 ${className}`}>
            {/* Overall Progress */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[var(--color-foreground)] flex items-center gap-2">
                        <TargetIcon className="w-4 h-4 text-[var(--color-primary)]" />
                        Course Progress
                    </h3>
                    <span className="text-sm font-bold text-[var(--color-foreground)]">
                        {Math.round(progressPercentage)}%
                    </span>
                </div>
                <ProgressBar progress={progressPercentage} className="mb-2" />
                <div className="flex justify-between text-xs text-[var(--color-muted-foreground)]">
                    <span>{completedCount} completed</span>
                    <span>{totalCount - completedCount} remaining</span>
                </div>
            </div>

            {/* Topic Progress */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">
                    Topics
                </h4>
                {course.topics.map((topic, topicIndex) => {
                    const topicProgress = getTopicProgress(topicIndex);
                    const topicPercentage = topicProgress.total > 0 ? 
                        (topicProgress.completed / topicProgress.total) * 100 : 0;
                    const isTopicComplete = topicProgress.completed === topicProgress.total;
                    const hasCurrentSubtopic = topic.subtopics.some(s => s.id === currentSubtopicId);

                    return (
                        <div 
                            key={topicIndex} 
                            className={`p-3 rounded-lg border transition-all ${
                                hasCurrentSubtopic 
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' 
                                    : 'border-[var(--color-border)] bg-[var(--color-secondary)]'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    isTopicComplete 
                                        ? 'bg-green-500 text-white' 
                                        : hasCurrentSubtopic
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'bg-[var(--color-border)] text-[var(--color-muted-foreground)]'
                                }`}>
                                    {isTopicComplete ? (
                                        <CheckIcon className="w-3 h-3" />
                                    ) : (
                                        <BookOpenIcon className="w-3 h-3" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className={`font-medium text-sm truncate ${
                                        hasCurrentSubtopic ? 'text-[var(--color-primary)]' : 'text-[var(--color-foreground)]'
                                    }`}>
                                        {topic.title}
                                    </h5>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex-1 mr-2">
                                            <ProgressBar 
                                                progress={topicPercentage} 
                                                className="h-1"
                                            />
                                        </div>
                                        <span className="text-xs text-[var(--color-muted-foreground)]">
                                            {topicProgress.completed}/{topicProgress.total}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Subtopic Indicators */}
                            <div className="flex flex-wrap gap-1 ml-9">
                                {topic.subtopics.map((subtopic, subtopicIndex) => {
                                    const isCompleted = course.progress.has(subtopic.id);
                                    const isCurrent = subtopic.id === currentSubtopicId;

                                    return (
                                        <div
                                            key={subtopic.id}
                                            className={`w-2 h-2 rounded-full transition-all ${
                                                isCompleted 
                                                    ? 'bg-green-500' 
                                                    : isCurrent
                                                        ? 'bg-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30'
                                                        : 'bg-[var(--color-border)]'
                                            }`}
                                            title={subtopic.title}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Achievement Milestone */}
            {progressPercentage >= 25 && progressPercentage < 100 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 rounded-lg border border-[var(--color-primary)]/20">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                            <TargetIcon className="w-3 h-3 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[var(--color-foreground)]">
                                {progressPercentage >= 75 ? 'Almost there!' : 
                                 progressPercentage >= 50 ? 'Halfway done!' : 
                                 'Great start!'}
                            </p>
                            <p className="text-xs text-[var(--color-muted-foreground)]">
                                Keep going, you're doing great!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Completion Celebration */}
            {progressPercentage === 100 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckIcon className="w-3 h-3 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-green-600">
                                Course Complete! 🎉
                            </p>
                            <p className="text-xs text-green-500">
                                Excellent work completing this course!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedProgressTracker;
