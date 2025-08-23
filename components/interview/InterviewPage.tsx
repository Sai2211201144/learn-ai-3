
import React, { useState } from 'react';
import { Course } from '../../types';
import { useAppContext } from '../../context/AppContext';
import ProjectStyleCourseCard from '../dashboard/ProjectStyleCourseCard';
import { AcademicCapIcon } from '../common/Icons';

interface InterviewPageProps {
  onStartInterviewPrep: (course: Course) => void;
  onStartLiveInterview: (topic: string) => void;
}

const InterviewPage: React.FC<InterviewPageProps> = ({ onStartInterviewPrep, onStartLiveInterview }) => {
    const { courses, folders, handleDeleteCourse, handleMoveCourseToFolder } = useAppContext();
    const [liveTopic, setLiveTopic] = useState('');

    const handleStartSession = () => {
        if (liveTopic.trim()) {
            onStartLiveInterview(liveTopic.trim());
        }
    };

    return (
        <div className="w-full max-w-screen-xl animate-fade-in mx-auto px-0 sm:px-6 lg:px-8">
            <header className="pb-6 border-b border-[var(--color-border)] mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                    <AcademicCapIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--color-primary)]" />
                    Interview Preparation
                </h1>
                <p className="text-base text-[var(--color-muted-foreground)] mt-2">Practice with Q&A sets from your topics or start a live, collaborative mock interview with an AI.</p>
            </header>

            <div className="p-6 sm:p-8 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 rounded-2xl mb-10">
                <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Live Mock Interview</h2>
                <p className="text-[var(--color-muted-foreground)] mt-1 mb-4">Engage in a collaborative, Google-style problem-solving session with an AI interviewer.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={liveTopic}
                        onChange={(e) => setLiveTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStartSession()}
                        placeholder="Enter any topic (e.g., 'React Hooks')"
                        className="w-full flex-grow px-4 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                    <button 
                        onClick={handleStartSession}
                        disabled={!liveTopic.trim()}
                        className="px-6 py-2 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Start Session
                    </button>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-4">Practice Q&A From Your Topics</h2>
                {courses.length === 0 ? (
                    <div className="text-center py-16 px-6 border-2 border-dashed border-[var(--color-border)] rounded-xl">
                        <AcademicCapIcon className="w-16 h-16 text-[var(--color-muted-foreground)]/30 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-[var(--color-foreground)]">No Topics Found</h3>
                        <p className="text-[var(--color-muted-foreground)] mt-2">Create a topic from the dashboard to generate Q&A sets.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course, index) => (
                            <div key={course.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms`}}>
                                <ProjectStyleCourseCard 
                                    course={course} 
                                    folders={folders}
                                    onSelectCourse={() => onStartInterviewPrep(course)} // Clicking card opens prep modal
                                    onMoveCourse={handleMoveCourseToFolder}
                                    onDeleteCourse={handleDeleteCourse}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewPage;
