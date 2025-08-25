import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import { useAppContext } from '../../context/AppContext';
import CreatePlanModal from './CreatePlanModal';
import CreateCourseModal from '../modals/CreateCourseModal';
import ArticleCreatorPage from '../creator/ArticleCreatorPage';
import BulkArticleCreatorPage from '../creator/BulkArticleCreatorPage';
import { 
    CalendarDaysIcon, 
    PlusIcon,
    CheckCircleIcon,
    PlayIcon,
    ClockIcon,
    ChevronDownIcon,
    PencilIcon,
    BookOpenIcon,
    RectangleGroupIcon,
    FolderPlusIcon,
    MagnifyingGlassIcon,
    CloseIcon
} from '../common/Icons';
import ProgressBar from '../common/ProgressBar';
import FolderAccordion from '../dashboard/FolderAccordion';
import { Course, Article, KnowledgeLevel, LearningGoal, LearningStyle, CourseSource } from '../../types';

// Create Dropdown Component
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
        { icon: <BookOpenIcon className="w-5 h-5"/>, label: "New Single Course", action: onStartCreateCourse },
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

// Creator Modal Component
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

const EnhancedPlannerPage: React.FC = () => {
    const { 
        user: firebaseUser, 
        profile: userProfile, 
        learningPlans, 
        activePlan,
        setActivePlan,
        learningGoals,
        createUserLearningGoal,
        updateUserLearningGoal
    } = useFirebaseAuth();
    
    const { 
        courses, 
        articles,
        folders,
        handleSelectCourse,
        handleCreateFolder
    } = useAppContext();
    
    // Get user name from Firebase
    const userName = firebaseUser ? 
        (userProfile?.full_name || firebaseUser.displayName || 'Learner') : 
        'Learner';
    
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isPlanSelectorOpen, setIsPlanSelectorOpen] = useState(false);
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
    const [createModalContent, setCreateModalContent] = useState<'none' | 'single' | 'bulk' | 'course'>('none');
    const [showFolderForm, setShowFolderForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [courseCreationError, setCourseCreationError] = useState<string | null>(null);
    
    // Calculate today's goals
    const todaysGoals = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return learningGoals.filter(goal => 
            goal.goal_type === 'daily' && 
            goal.target_date === today &&
            !goal.is_completed
        );
    }, [learningGoals]);
    
    const completedTodaysGoals = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return learningGoals.filter(goal => 
            goal.goal_type === 'daily' && 
            goal.target_date === today &&
            goal.is_completed
        );
    }, [learningGoals]);
    
    const handleCreateDailyGoal = async () => {
        if (!newGoalTitle.trim()) return;
        
        try {
            const today = new Date().toISOString().split('T')[0];
            await createUserLearningGoal(
                newGoalTitle, 
                'Daily learning goal', 
                today, 
                'daily'
            );
            setNewGoalTitle('');
            setShowGoalForm(false);
        } catch (error) {
            console.error('Failed to create goal:', error);
        }
    };
    
    const handleToggleGoal = async (goalId: string, isCompleted: boolean) => {
        try {
            await updateUserLearningGoal(goalId, {
                is_completed: !isCompleted,
                completed_at: !isCompleted ? new Date().toISOString() : null
            });
        } catch (error) {
            console.error('Failed to update goal:', error);
        }
    };

    const handleCreateCourse = async (
        topic: string, 
        level: KnowledgeLevel, 
        folderId: string | null, 
        goal: LearningGoal, 
        style: LearningStyle,
        source: CourseSource | undefined,
        specificTech: string,
        includeTheory: boolean
    ) => {
        try {
            setCourseCreationError(null);
            // This will be handled by the CreateCourseModal component
            // The modal will close and the course will be created
            setCreateModalContent('none');
        } catch (error) {
            console.error('Failed to create course:', error);
            setCourseCreationError('Failed to create course. Please try again.');
        }
    };
    
    // Calculate filtered folders with populated content
    const filteredFolders = useMemo(() => {
        const courseMap = new Map(courses.map(c => [c.id, c]));
        const articleMap = new Map(articles.map(a => [a.id, a]));
        
        const searchLower = searchTerm.toLowerCase();
        
        const populatedFolders = folders
            .map(f => ({
                id: f.id,
                name: f.name,
                courses: f.courses.map(c => courseMap.get(typeof c === 'string' ? c : c.id)).filter((c): c is Course => !!c),
                articles: f.articles.map(a => articleMap.get(typeof a === 'string' ? a : a.id)).filter((a): a is Article => !!a),
            }))
            .filter(f => f.name.toLowerCase().includes(searchLower));
            
        return populatedFolders;
    }, [courses, articles, folders, searchTerm]);
    
    // Show authentication prompt if not logged in
    if (!firebaseUser) {
        return (
            <div className="w-full max-w-screen-xl animate-fade-in mx-auto px-0 sm:px-6 lg:px-8">
                <div className="text-center py-20 px-6">
                    <CalendarDaysIcon className="w-16 h-16 text-[var(--color-muted-foreground)]/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[var(--color-foreground)]">Sign in to access your learning planner</h3>
                    <p className="text-[var(--color-muted-foreground)] mt-2">
                        Create personalized learning plans, set daily goals, and track your progress.
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-screen-xl animate-fade-in mx-auto px-0 sm:px-6 lg:px-8">
            <header className="py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
                        Learning Planner
                    </h1>
                    <p className="text-[var(--color-muted-foreground)] mt-1">
                        Ready to dive back in and learn something new today, {userName}?
                    </p>
                </div>
                <div className="flex gap-3">
                    {learningPlans.length > 0 && (
                        <div className="relative">
                            <button 
                                onClick={() => setIsPlanSelectorOpen(prev => !prev)}
                                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-secondary-hover)] transition-all"
                            >
                                <CalendarDaysIcon className="w-5 h-5"/>
                                <span className="hidden sm:inline">
                                    {activePlan ? activePlan.title : 'Select Plan'}
                                </span>
                                <ChevronDownIcon className="w-4 h-4"/>
                            </button>
                            {isPlanSelectorOpen && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-[var(--color-card)] rounded-lg shadow-2xl border border-[var(--color-border)] z-20 p-2">
                                    {learningPlans.map(plan => (
                                        <button
                                            key={plan.id}
                                            onClick={() => {
                                                setActivePlan(plan.id);
                                                setIsPlanSelectorOpen(false);
                                            }}
                                            className={`w-full text-left p-3 rounded-md hover:bg-[var(--color-secondary)] ${
                                                activePlan?.id === plan.id ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]' : ''
                                            }`}
                                        >
                                            <div className="font-semibold text-[var(--color-foreground)]">{plan.title}</div>
                                            <div className="text-sm text-[var(--color-muted-foreground)]">
                                                {plan.duration} days • {plan.status}
                                            </div>
                                        </button>
                                    ))}
                                    <hr className="my-2 border-[var(--color-border)]" />
                                    <button
                                        onClick={() => {
                                            setActivePlan(null);
                                            setIsPlanSelectorOpen(false);
                                        }}
                                        className="w-full text-left p-3 rounded-md hover:bg-[var(--color-secondary)] text-[var(--color-muted-foreground)]"
                                    >
                                        No active plan
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
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
                                onStartCreateCourse={() => setIsCourseModalOpen(true)}
                                onShowFolderForm={() => setShowFolderForm(true)}
                                onStartCreateArticle={() => setCreateModalContent('single')}
                                onStartBulkCreate={() => setCreateModalContent('bulk')}
                            />
                        )}
                    </div>
                </div>
            </header>

            {/* Daily Goals Section */}
            <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[var(--color-foreground)]">Today's Goals</h2>
                    <button
                        onClick={() => setShowGoalForm(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                    >
                        <PlusIcon className="w-4 h-4"/>
                        Add Goal
                    </button>
                </div>
                
                {showGoalForm && (
                    <div className="mb-4 p-4 bg-[var(--color-secondary)] rounded-lg">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newGoalTitle}
                                onChange={(e) => setNewGoalTitle(e.target.value)}
                                placeholder="What do you want to learn today?"
                                className="flex-1 px-3 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateDailyGoal()}
                            />
                            <button
                                onClick={handleCreateDailyGoal}
                                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:opacity-90"
                            >
                                Add
                            </button>
                            <button
                                onClick={() => {
                                    setShowGoalForm(false);
                                    setNewGoalTitle('');
                                }}
                                className="px-4 py-2 bg-[var(--color-muted)] text-[var(--color-foreground)] rounded-md hover:opacity-90"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="space-y-3">
                    {todaysGoals.map(goal => (
                        <div key={goal.id} className="flex items-center gap-3 p-3 bg-[var(--color-secondary)] rounded-lg">
                            <button
                                onClick={() => handleToggleGoal(goal.id, goal.is_completed)}
                                className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center hover:bg-[var(--color-primary)]/10"
                            >
                                {goal.is_completed && <CheckCircleIcon className="w-4 h-4 text-[var(--color-primary)]" />}
                            </button>
                            <span className={`flex-1 ${goal.is_completed ? 'line-through text-[var(--color-muted-foreground)]' : 'text-[var(--color-foreground)]'}`}>
                                {goal.title}
                            </span>
                        </div>
                    ))}
                    
                    {completedTodaysGoals.map(goal => (
                        <div key={goal.id} className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                            <CheckCircleIcon className="w-6 h-6 text-green-500" />
                            <span className="flex-1 line-through text-[var(--color-muted-foreground)]">
                                {goal.title}
                            </span>
                        </div>
                    ))}
                    
                    {todaysGoals.length === 0 && completedTodaysGoals.length === 0 && (
                        <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                            No goals set for today. Click "Add Goal" to get started!
                        </div>
                    )}
                </div>
            </div>

            {/* Learning Plan Section */}
            {activePlan ? (
                <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--color-foreground)]">{activePlan.title}</h2>
                            <div className="flex items-center gap-4 mt-2 text-sm text-[var(--color-muted-foreground)]">
                                <div className="flex items-center gap-1">
                                    <CalendarDaysIcon className="w-4 h-4"/>
                                    {activePlan.duration} days
                                </div>
                                <div className="flex items-center gap-1">
                                    <ClockIcon className="w-4 h-4"/>
                                    Started {new Date(activePlan.start_date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-[var(--color-secondary)] rounded-lg hover:bg-[var(--color-secondary-hover)]">
                                <PencilIcon className="w-4 h-4 text-[var(--color-muted-foreground)]"/>
                            </button>
                        </div>
                    </div>
                    
                    <div className="text-center py-12 text-[var(--color-muted-foreground)]">
                        <CalendarDaysIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        Plan details and progress tracking coming soon!
                        <br />
                        <span className="text-sm">Integration with course generation in progress.</span>
                    </div>
                </div>
            ) : learningPlans.length > 0 ? (
                <div className="text-center py-20 px-6 bg-[var(--color-secondary)] border-2 border-dashed border-[var(--color-border)] rounded-xl">
                    <CalendarDaysIcon className="w-16 h-16 text-[var(--color-muted-foreground)]/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[var(--color-foreground)]">Select a Learning Plan</h3>
                    <p className="text-[var(--color-muted-foreground)] mt-2">
                        Choose one of your existing plans to see your progress and daily tasks.
                    </p>
                </div>
            ) : (
                <div className="text-center py-20 px-6 bg-[var(--color-secondary)] border-2 border-dashed border-[var(--color-border)] rounded-xl">
                    <CalendarDaysIcon className="w-16 h-16 text-[var(--color-muted-foreground)]/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[var(--color-foreground)]">Create Your First Learning Plan</h3>
                    <p className="text-[var(--color-muted-foreground)] mt-2 mb-6">
                        Get started by creating a personalized learning plan tailored to your goals.
                    </p>
                    <button 
                        onClick={() => setIsPlanModalOpen(true)}
                        className="px-6 py-3 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 shadow-lg"
                    >
                        Create Your First Plan
                    </button>
                </div>
            )}

            {/* Content Library Section */}
            <div className="mt-8 mb-8">
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
                        <div className="mb-4 p-4 bg-[var(--color-secondary)] rounded-lg">
                            <input
                                type="text"
                                placeholder="Enter folder name..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                        handleCreateFolder(e.currentTarget.value.trim());
                                        setShowFolderForm(false);
                                    }
                                }}
                                className="w-full px-3 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
                                autoFocus
                            />
                        </div>
                    )}
                    <div className="space-y-4">
                        {filteredFolders.map(folder => (
                            <FolderAccordion key={folder.id} folder={folder} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreatePlanModal 
                isOpen={isPlanModalOpen}
                onClose={() => setIsPlanModalOpen(false)}
            />

            <CreateCourseModal
                isOpen={isCourseModalOpen}
                onClose={() => setIsCourseModalOpen(false)}
                onGenerate={handleCreateCourse}
                error={courseCreationError}
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

export default EnhancedPlannerPage;
