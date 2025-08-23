
import React, { useMemo } from 'react';
import { Course, Folder } from '../../types';
import { AcademicCapIcon, BookOpenIcon, BrainCircuitIcon, CodeIcon } from '../common/Icons';
import CourseCardMenu from './CourseCardMenu';
import ProgressBar from '../common/ProgressBar';

interface ProjectStyleCourseCardProps {
  course: Course;
  folders: Folder[];
  onSelectCourse: (courseId: string) => void;
  onMoveCourse: (courseId: string, folderId: string | null) => void;
  onDeleteCourse: (courseId: string) => void;
}

const getCategoryStyle = (category: string) => {
    switch (category.toLowerCase()) {
        case 'ai/ml':
        case 'data science':
            return {
                icon: <BrainCircuitIcon className="w-6 h-6"/>,
                color: 'var(--color-info)'
            };
        case 'web app':
        case 'web development':
             return {
                icon: <CodeIcon className="w-6 h-6"/>,
                color: 'var(--color-primary)'
            };
        default:
            return {
                icon: <BookOpenIcon className="w-6 h-6"/>,
                color: 'var(--color-accent)'
            };
    }
}

const ProjectStyleCourseCard: React.FC<ProjectStyleCourseCardProps> = ({ 
    course, 
    folders,
    onSelectCourse, 
    onMoveCourse,
    onDeleteCourse
}) => {
    
    const { icon, color } = getCategoryStyle(course.category);

    const { totalLessons, progressPercentage } = useMemo(() => {
        const total = course.topics.reduce((acc, topic) => acc + topic.subtopics.length, 0);
        const percentage = total > 0 ? (course.progress.size / total) * 100 : 0;
        return { totalLessons: total, progressPercentage: percentage };
    }, [course.topics, course.progress]);
    
    return (
        <div className="project-card h-full group">
            <div className="project-card-glow"></div>
            
            <div className="absolute top-4 right-4 z-10">
                <CourseCardMenu 
                    course={course}
                    folders={folders}
                    onMoveCourse={onMoveCourse}
                    onDeleteCourse={onDeleteCourse}
                />
            </div>

            <div className="cursor-pointer flex flex-col flex-grow" onClick={() => onSelectCourse(course.id)}>
                <div className="corner-icon" style={{ '--corner-icon-bg': color, '--corner-icon-fg': '#ffffff' } as React.CSSProperties}>
                    {icon}
                </div>

                <div className="card-content flex-grow">
                    <div className="category-tag">{course.category || 'General'}</div>
                    <h3 className="title line-clamp-2">{course.title}</h3>
                    <p className="description line-clamp-3">{course.description}</p>
                </div>
                
                <div className="tech-stack mt-4">
                    <h4 className="heading">Technologies:</h4>
                    <p className="tags">
                        {course.technologies.join(', ')}
                    </p>
                </div>
            </div>

            <footer className="card-footer">
                <div className="w-1/2">
                    <div className="flex justify-between items-center mb-1">
                         <span className="text-xs font-semibold text-[var(--color-muted-foreground)]">Progress</span>
                         <span className="text-xs font-bold text-[var(--color-foreground)]">{course.progress.size} / {totalLessons}</span>
                    </div>
                    <ProgressBar progress={progressPercentage} />
                </div>
                <div className="action-buttons">
                    <button
                        onClick={() => onSelectCourse(course.id)}
                        className="btn btn-primary"
                    >
                        {course.progress.size > 0 ? 'Continue' : 'Start Path'}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ProjectStyleCourseCard;