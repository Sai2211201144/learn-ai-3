

import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Course, Folder, View, Article } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';

import { 
    PlusIcon, 
    MagnifyingGlassIcon,
    BookOpenIcon,
    FolderPlusIcon,
    AcademicCapIcon,
    ClipboardDocumentCheckIcon,
    CommandLineIcon,
    SparklesIcon,
    RectangleGroupIcon,
    CloseIcon,
    PencilIcon,
    CalendarDaysIcon
} from '../common/Icons';
import ArticleCreatorPage from '../creator/ArticleCreatorPage';
import BulkArticleCreatorPage from '../creator/BulkArticleCreatorPage';
import FolderAccordion from '../dashboard/FolderAccordion';
import CreatePlanModal from './CreatePlanModal';
import WeeklyPlanner from './WeeklyPlanner';
import DailyGoalCard from './DailyGoalCard';

// --- Reusable Inline Components ---

const CreateDropdown: React.FC<{
    onClose: () => void;
    onStartCreatePlan: () => void;
    onStartCreateCourse: () => void;
    onShowFolderForm: () => void;
    onStartCreateArticle: () => void;
    onStartBulkCreate: () => void;
}> = ({ onClose, onStartCreatePlan, onStartCreateCourse, onShowFolderForm, onStartCreateArticle, onStartBulkCreate }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleAction = (action: () => void) => {
        action();
        onClose();
    };

    const menuItems = [
        { icon: <CalendarDaysIcon className="w-5 h-5"/>, label: "New Learning Plan", action: onStartCreatePlan },
        { icon: <BookOpenIcon className="w-5 h-5"/>, label: "New Single Path", action: onStartCreateCourse },
        { icon: <PencilIcon className="w-5 h-5"/>, label: "New Single Article", action: onStartCreateArticle },
        { icon: <RectangleGroupIcon className="w-5 h-5"/>, label: "New Bulk Articles", action: onStartBulkCreate },
        { icon: <FolderPlusIcon className="w-5 h-5"/>, label: "New Folder", action: onShowFolderForm },
    ];

    return (
        <div ref={dropdownRef} className="absolute top-full right-0 mt-2 w-64 bg-[var(--color-card)] rounded-lg shadow-2xl border border-[var(--color-border)] z-20 animate-fade-in-up-fast p-2">
            {menuItems.map(item => (
                <button key={item.label} onClick={() => handleAction(item.action)} className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]">
                    {item.icon}
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
    );
};

const CreatorModal: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; onClose: () => void; }> = ({ title, icon, children, onClose }) => (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" onClick={onClose}>
        <div className="bg-[var(--color-card)] rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4 border border-[var(--color-border)] animate-modal-content flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <header className="flex justify-between items-start mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    {icon}
                    <h2 className="text-2xl font-bold text-[var(--color-foreground)]">{title}</h2>
                </div>
                <button onClick={onClose} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"><CloseIcon className="w-6 h-6" /></button>
            </header>
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-4">
                {children}
            </div>
        </div>
    </div>
);


// --- Main Page Component ---
interface PlannerPageProps {
    onNavigate: (view: View) => void;
    onStartCreate: () => void;
}

type DisplayFolder = { id: string; name: string; courses: Course[]; articles: Article[] };

const PlannerPage: React.FC<PlannerPageProps> = ({ onNavigate, onStartCreate }) => {
    const { 
        courses, 
        folders, 
        articles,
        projects,
        localUser,
        handleCreateFolder
    } = useAppContext();
    
    const { 
        user: firebaseUser, 
        profile: userProfile,
        learningPlans,
        activePlan: firebaseActivePlan
    } = useFirebaseAuth();
    
    // Get user name from Firebase or local user
    const userName = firebaseUser ? 
        (userProfile?.full_name || firebaseUser.displayName || localUser?.name || 'Learner') : 
        (localUser?.name || 'Learner');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [showFolderForm, setShowFolderForm] = useState(false);
    const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [createModalContent, setCreateModalContent] = useState<'none' | 'single' | 'bulk'>('none');
    
    // Use Firebase activePlan if available, otherwise fall back to local
    const activePlan = useMemo(() => {
        if (firebaseUser && firebaseActivePlan) {
            return firebaseActivePlan;
        }
        return localUser.learningPlans?.find(plan => plan.status === 'active');
    }, [firebaseUser, firebaseActivePlan, localUser.learningPlans]);
    
    const filteredFolders = useMemo(() => {
        const courseMap = new Map(courses.map(c => [c.id, c]));
        const articleMap = new Map(articles.map(a => [a.id, a]));

        const itemsInFolders = { courses: new Set<string>(), articles: new Set<string>() };
        folders.forEach(folder => {
            folder.courses.forEach(c => c?.id && itemsInFolders.courses.add(c.id));
            folder.articles.forEach(a => a?.id && itemsInFolders.articles.add(a.id));
        });
        
        const searchLower = searchTerm.toLowerCase();
        
        const populatedFolders: DisplayFolder[] = folders
            .map(f => ({
                ...f,
                courses: f.courses.map(c => courseMap.get(c!.id)).filter((c): c is Course => !!c),
                articles: f.articles.map(a => articleMap.get(a!.id)).filter((a): a is Article => !!a),
            }))
            .filter(f => f.name.toLowerCase().includes(searchLower));

        const uncategorizedCourses = courses.filter(c => !itemsInFolders.courses.has(c.id) && c.title.toLowerCase().includes(searchLower));
        const uncategorizedArticles = articles.filter(a => !itemsInFolders.articles.has(a.id) && a.title.toLowerCase().includes(searchLower));

        const uncategorizedFolder: DisplayFolder = {
            id: 'uncategorized',
            name: 'Uncategorized',
            courses: uncategorizedCourses,
            articles: uncategorizedArticles,
        };

        return [...populatedFolders, uncategorizedFolder];
    }, [courses, articles, folders, searchTerm]);


    return (
        <div className="w-full max-w-screen-xl animate-fade-in mx-auto px-0 sm:px-6 lg:px-8">
            <header className="py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
                        Planner
                    </h1>
                    <p className="text-[var(--color-muted-foreground)] mt-1">Ready to dive back in and learn something new today, {userName}?</p>
                </div>
                <div className="relative">
                    <button 
                        onClick={() => setIsCreateMenuOpen(prev => !prev)}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg"
                    >
                        <PlusIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Create New</span>
                    </button>
                    {isCreateMenuOpen && (
                        <CreateDropdown 
                            onClose={() => setIsCreateMenuOpen(false)}
                            onStartCreatePlan={() => setIsPlanModalOpen(true)}
                            onStartCreateCourse={onStartCreate}
                            onShowFolderForm={() => setShowFolderForm(true)}
                            onStartCreateArticle={() => setCreateModalContent('single')}
                            onStartBulkCreate={() => setCreateModalContent('bulk')}
                        />
                    )}
                </div>
            </header>

            <div className="space-y-8 mb-8">
                 {activePlan && 'dailyTasks' in activePlan ? (
                    <>
                        <DailyGoalCard plan={activePlan as any} />
                        <WeeklyPlanner plan={activePlan as any} />
                    </>
                ) : activePlan ? (
                    <div className="text-center py-12 px-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl">
                        <CalendarDaysIcon className="w-12 h-12 text-[var(--color-muted-foreground)]/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-[var(--color-foreground)]">Firebase Plan Active</h3>
                        <p className="text-[var(--color-muted-foreground)] mt-2">
                            {(activePlan as any).title} is active. Use the Enhanced Planner for full functionality.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-20 px-6 bg-[var(--color-secondary)] border-2 border-dashed border-[var(--color-border)] rounded-xl">
                        <CalendarDaysIcon className="w-16 h-16 text-[var(--color-muted-foreground)]/30 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-[var(--color-foreground)]">Your Learning Plan will appear here</h3>
                        <p className="text-[var(--color-muted-foreground)] mt-2">
                            Create a new plan to get started on your next learning adventure.
                        </p>
                    </div>
                )}
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-4">My Content Library</h2>
                <div>
                    <div className="flex justify-end mb-4">
                        <div className="relative w-full sm:w-64">
                            <MagnifyingGlassIcon className="w-5 h-5 text-[var(--color-muted-foreground)] absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none"/>
                            <input 
                                type="text"
                                placeholder="Search content..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            />
                        </div>
                    </div>
                    {showFolderForm && (
                        <div className="my-4"><button onClick={() => handleCreateFolder('New Folder')}>Create Folder</button></div>
                    )}
                    <div className="space-y-4">
                        {filteredFolders.map(folder => (
                            <FolderAccordion key={folder.id} folder={folder} />
                        ))}
                    </div>
                </div>
            </div>

            <CreatePlanModal 
                isOpen={isPlanModalOpen}
                onClose={() => setIsPlanModalOpen(false)}
            />

            {createModalContent !== 'none' && (
                <CreatorModal
                    onClose={() => setCreateModalContent('none')}
                    title={createModalContent === 'single' ? "AI Article Creator" : "Bulk Article Creator"}
                    icon={createModalContent === 'single' ? <PencilIcon className="w-7 h-7 text-[var(--color-primary)]"/> : <RectangleGroupIcon className="w-7 h-7 text-[var(--color-primary)]"/>}
                >
                    {createModalContent === 'single' && <ArticleCreatorPage />}
                    {createModalContent === 'bulk' && <BulkArticleCreatorPage />}
                </CreatorModal>
            )}
        </div>
    );
};

export default PlannerPage;