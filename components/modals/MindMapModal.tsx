import React from 'react';
import { CloseIcon, DiagramIcon } from '../common/Icons';
import MindMap from '../course/MindMap';
import { Course, MindMapNode, Topic, Subtopic } from '../../types';

interface MindMapModalProps {
    isOpen: boolean;
    course: Course | null;
    onClose: () => void;
}

// Helper function to transform course data into a mind map structure
const transformCourseToMindMap = (course: Course): MindMapNode => {
    return {
        title: course.title,
        children: course.topics.map((topic: Topic) => ({
            title: topic.title,
            children: topic.subtopics.map((subtopic: Subtopic) => ({
                title: subtopic.title,
                children: []
            }))
        }))
    };
};

const MindMapModal: React.FC<MindMapModalProps> = ({ isOpen, course, onClose }) => {
    if (!isOpen || !course) {
        return null;
    }

    const mindMapData = transformCourseToMindMap(course);

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-[var(--color-card)] rounded-xl shadow-2xl p-8 w-full max-w-2xl mx-4 border border-[var(--color-border)] animate-modal-content"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                            <DiagramIcon className="w-7 h-7 text-green-500" />
                            Course Mind Map
                        </h2>
                        <p className="text-[var(--color-muted-foreground)] mt-1">A visual overview of: <span className="font-semibold text-[var(--color-foreground)]">"{course.title}"</span></p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="mt-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-4 -mr-4">
                    <MindMap data={mindMapData} />
                </div>
                
                <div className="mt-8 flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 bg-[var(--color-secondary-hover)] text-[var(--color-foreground)] font-bold rounded-lg hover:bg-[var(--color-border)] border border-[var(--color-border)]">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MindMapModal;
