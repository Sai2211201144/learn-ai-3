import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Course, Folder, Progress, KnowledgeLevel, ChatMessage, Subtopic, Topic, InterviewQuestionSet, PracticeSession, BackgroundTask, Project, LiveInterviewState, User, LearningGoal, LearningStyle, CreateTopicsModalState, Achievement, AchievementId, CourseSource, Article, ArticleCreatorState, QuizData, StoryModalState, AnalogyModalState, FlashcardModalState, ExpandTopicModalState, InterviewQuestion, InterviewPrepState, LearningItem, Module, ContentBlock, ArticleData, ExploreModalState, MindMapModalState, ArticleIdeasModalState, CreateArticlesModalState, ArticleTutorModalState, BulkArticleGenerationState, SocraticModalState, DailyQuest, DefinitionState, UnderstandingCheckState, ProjectStep, ProjectTutorState, UpNextItem, LearningPlan, DailyTask, Habit } from '../types';
import * as storageService from '../services/storageService';
import * as geminiService from '../services/geminiService';
import { achievementsMap } from '../services/achievements';

const XP_PER_LESSON = 100;
const calculateRequiredXp = (level: number) => level * 500;

const GUEST_USER_DEFAULT: User = {
    id: 'guest',
    email: '',
    name: 'Guest',
    xp: 0,
    level: 1,
    achievements: [],
    articles: [],
    folders: [],
    learningPlans: [],
    habits: []
};

interface AppContextType {
    // Data
    courses: Course[];
    folders: Folder[];
    projects: Project[];
    articles: Article[];
    localUser: User;
    activeCourse: Course | null;
    activeProject: Project | null;
    activeArticle: Article | null;
    activePlan: LearningPlan | null;
    topic: string; // for loading screen
    error: string | null;
    
    // Actions
    handleGenerateCourse: (topic: string, level: KnowledgeLevel, folderId: string | null, goal: LearningGoal, style: LearningStyle, source: CourseSource | undefined, specificTech: string, includeTheory: boolean) => void;
    handleSelectCourse: (courseId: string | null) => void;
    handleSelectArticle: (articleId: string | null) => void;
    handleDeleteCourse: (courseId: string) => void;
    handleToggleItemComplete: (courseId: string, subtopicId: string) => void;
    handleCreateFolder: (name: string) => void;
    handleDeleteFolder: (folderId: string) => void;
    handleUpdateFolderName: (folderId: string, newName: string) => void;
    handleMoveCourseToFolder: (courseId: string, targetFolderId: string | null) => void;
    handleSaveItemNote: (courseId: string, subtopicId: string, note: string) => void;
    handleDeleteArticle: (articleId: string) => void;
    handleMoveArticleToFolder: (articleId: string, folderId: string | null) => void;
    
    lastActiveCourseId: string | null;
    
    // Chat
    isChatOpen: boolean;
    chatHistory: ChatMessage[];
    isChatLoading: boolean;
    toggleChat: () => void;
    sendChatMessage: (message: string) => void;
    
    // Background Tasks
    activeTask: BackgroundTask | null;
    backgroundTasks: BackgroundTask[];
    cancelTask: (taskId: string) => void;
    minimizeTask: (taskId: string) => void;
    clearBackgroundTask: (taskId: string) => void;
    handleBackgroundTaskClick: (taskId: string) => void;

    // Projects
    handleSelectProject: (projectId: string | null) => void;
    handleDeleteProject: (projectId: string) => void;
    handleToggleProjectStepComplete: (projectId: string, stepId: string) => void;
    handleGenerateProject: (course: Course, subtopic: Subtopic | LearningItem) => void;


    // Live Interview
    liveInterviewState: LiveInterviewState | null;
    handleStartLiveInterview: (topic: string) => void;
    handleSendLiveInterviewMessage: (message: string) => void;
    handleEndLiveInterview: () => void;

    // Quick Practice
    practiceQuizSession: { topic: string; difficulty: KnowledgeLevel; questions: QuizData[] } | null;
    isPracticeQuizLoading: boolean;
    handleStartPracticeQuiz: (topic: string, difficulty: KnowledgeLevel, navigate: () => void) => void;

    // Topic Practice
    practiceSession: PracticeSession | null;
    isPracticeLoading: boolean;
    practiceError: string | null;
    handleStartTopicPractice: (course: Course, topic: Topic | Module, subtopic: Subtopic | LearningItem, navigate: () => void) => void;


    // Code Explainer
    codeExplanation: { isLoading: boolean; content: string | null; error: string | null; };
    handleGenerateCodeExplanation: (input: { type: 'link' | 'text' | 'image'; content: string | File; }) => void;
    
    // New Folder Flow
    createTopicsModalState: CreateTopicsModalState;
    openCreateTopicsModal: (folderId: string) => void;
    closeCreateTopicsModal: () => void;
    handleBulkGenerateCourses: (topics: string[], folderId: string) => Promise<void>;
    createArticlesModalState: CreateArticlesModalState;
    openCreateArticlesModal: (folderId: string) => void;
    closeCreateArticlesModal: () => void;
    handleBulkGenerateArticles: (syllabus: string, folderId: string) => Promise<void>;
    handleCreateLearningPlan: (topic: string, duration?: number) => void;
    handleSelectPlan: (planId: string | null) => void;
    handleDeletePlan: (planId: string) => void;
    handleRescheduleTask: (planId: string, taskId: string, newDate: number) => void;
    handleDeleteTaskFromPlan: (planId: string, taskId: string) => void;
    handleToggleTaskComplete: (planId: string, taskId: string) => void;

    // Gamification & Interactivity
    unlockAchievement: (id: AchievementId) => void;
    unlockedAchievementNotification: Achievement | null;
    clearUnlockedAchievementNotification: () => void;
    dailyQuest: DailyQuest | null;
    handleDefineTerm: (term: string, position: { top: number; left: number, right?: number }, targetWidth: number) => void;
    definitionState: DefinitionState | null;
    isDefinitionLoading: boolean;
    closeDefinition: () => void;

    // Article Creator
    articleCreatorState: ArticleCreatorState;
    handleGenerateBlogPost: (topic: string, folderId?: string | null) => void;

    // Bulk Article Creator
    bulkArticleGenerationState: BulkArticleGenerationState;
    handleGenerateBulkArticlesForPage: (syllabus: string, folderId: string | null) => Promise<void>;
    resetBulkArticleGeneration: () => void;
    
    // Article Ideas
    articleIdeasModalState: ArticleIdeasModalState;
    handleShowArticleIdeasModal: (course: Course) => void;
    closeArticleIdeasModal: () => void;
    handleGenerateArticle: (topic: string, courseId: string) => void;

    // Modals
    storyModalState: StoryModalState;
    handleShowTopicStory: (subtopic: Subtopic | LearningItem) => void;
    closeStoryModal: () => void;
    analogyModalState: AnalogyModalState;
    handleShowTopicAnalogy: (subtopic: Subtopic | LearningItem) => void;
    closeAnalogyModal: () => void;
    flashcardModalState: FlashcardModalState;
    handleShowTopicFlashcards: (subtopic: Subtopic | LearningItem) => void;
    closeFlashcardModal: () => void;
    expandTopicModalState: ExpandTopicModalState;
    closeExpandTopicModal: () => void;
    handleExpandTopicInModule: (course: Course, topic: Topic, subtopic: Subtopic, prompt: string) => void;
    handleShowExpandTopicModal: (course: Course) => void;
    exploreModalState: ExploreModalState;
    handleShowExploreModal: (course: Course) => void;
    closeExploreModal: () => void;
    mindMapModalState: MindMapModalState;
    handleShowMindMapModal: (course: Course) => void;
    closeMindMapModal: () => void;
    socraticModalState: SocraticModalState;
    handleShowSocraticQuiz: (subtopic: Subtopic | LearningItem) => void;
    closeSocraticModal: () => void;
    
    // Interview Prep
    interviewPrepState: InterviewPrepState;
    handleStartInterviewPrep: (course: Course) => void;
    handleGenerateInterviewQuestions: (courseId: string, difficulty: KnowledgeLevel, count: number) => void;
    handleElaborateAnswer: (courseId: string, setId: string, qIndex: number, question: string, answer: string) => void;
    resetInterviewPrep: () => void;
    closeInterviewPrepModal: () => void;
    preloadedTest: { topic: string, difficulty: KnowledgeLevel, questions: QuizData[] } | null;
    clearPreloadedTest: () => void;

    // Course Content
    handleUpdateContentBlock: (courseId: string, itemId: string, blockId: string, newSyntax: string) => void;

    // Article Tutor
    articleTutorModalState: ArticleTutorModalState;
    handleOpenArticleTutor: (article: Article) => void;
    closeArticleTutor: () => void;
    sendArticleTutorMessage: (message: string) => void;

    // LearnAI 2.0 Features
    upNextItem: UpNextItem | null;
    understandingCheckState: UnderstandingCheckState;
    handleCheckUnderstanding: (subtopic: Subtopic | LearningItem) => void;
    closeUnderstandingCheckModal: () => void;
    handleUnderstandingCheckSubmit: (answers: Map<number, number>) => void;
    projectTutorState: ProjectTutorState;
    closeProjectTutorModal: () => void;
    handleGetProjectFeedback: (step: ProjectStep, userCode: string) => void;


    
    // Habits
    handleAddHabit: (title: string) => void;
    handleToggleHabitCompletion: (habitId: string, date: string) => void;
    handleDeleteHabit: (habitId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    
    const [guestUser, setGuestUser] = useState<User>(() => storageService.getGuestUserProfile() || GUEST_USER_DEFAULT);
    const localUser = guestUser;
    
    useEffect(() => { storageService.saveGuestUserProfile(guestUser); }, [guestUser]);
    
    // --- DATA SYNC & PERSISTENCE ---

    const loadGuestData = useCallback(() => {
        const localCourses = storageService.getCourses();
        const localFoldersData = storageService.getFolders();
        const localProjects = storageService.getProjects();
        const localArticles = storageService.getArticles();
        const localGuestProfile = storageService.getGuestUserProfile() || GUEST_USER_DEFAULT;

        setCourses(localCourses);
        setProjects(localProjects);
        setArticles(localArticles);
        setGuestUser(localGuestProfile);

        const courseMap = new Map(localCourses.map(c => [c.id, c]));
        const articleMap = new Map(localArticles.map(a => [a.id, a]));
        const populatedFolders = localFoldersData.map(folder => ({
            ...folder,
            courses: folder.courses.map(c => c ? courseMap.get(c.id) : null).filter((c): c is Course => !!c),
            articles: folder.articles.map(a => a ? articleMap.get(a.id) : null).filter((a): a is Article => !!a),
        }));
        setFolders(populatedFolders);
    }, []);
    
    useEffect(() => {
        loadGuestData();
    }, [loadGuestData]);

    useEffect(() => {
        storageService.saveCourses(courses);
        storageService.saveFolders(folders);
        storageService.saveProjects(projects);
        storageService.saveArticles(articles);
    }, [courses, folders, projects, articles]);
    
    // === SESSION STATE ===
    const [error, setError] = useState<string | null>(null);
    const [activeCourse, setActiveCourse] = useState<Course | null>(null);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [activeArticle, setActiveArticle] = useState<Article | null>(null);
    const [activePlan, setActivePlan] = useState<LearningPlan | null>(null);
    const [topic, setTopic] = useState<string>('');
    const [lastActiveCourseId, setLastActiveCourseId] = useState<string|null>(() => localStorage.getItem('learnai-last-active-course'));
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => storageService.getChatHistory());
    const [liveInterviewState, setLiveInterviewState] = useState<LiveInterviewState | null>(null);
    const [practiceQuizSession, setPracticeQuizSession] = useState<{ topic: string; difficulty: KnowledgeLevel; questions: QuizData[] } | null>(null);
    const [isPracticeQuizLoading, setIsPracticeQuizLoading] = useState(false);
    const [codeExplanation, setCodeExplanation] = useState<{ isLoading: boolean; content: string | null; error: string | null; }>({ isLoading: false, content: null, error: null });
    const [createTopicsModalState, setCreateTopicsModalState] = useState<CreateTopicsModalState>({isOpen: false, folderId: null});
    const [createArticlesModalState, setCreateArticlesModalState] = useState<CreateArticlesModalState>({isOpen: false, folderId: null});
    const [unlockedAchievementNotification, setUnlockedAchievementNotification] = useState<Achievement | null>(null);
    const [activeTask, setActiveTask] = useState<BackgroundTask | null>(null);
    const [backgroundTasks, setBackgroundTasks] = useState<BackgroundTask[]>([]);
    const [articleCreatorState, setArticleCreatorState] = useState<ArticleCreatorState>({ isLoading: false, error: null, title: null, subtitle: null, blogPost: null, ideas: [] });
    const [bulkArticleGenerationState, setBulkArticleGenerationState] = useState<BulkArticleGenerationState>({ isLoading: false, progressMessage: null, generatedArticles: [], error: null });
    
    // --- GAMIFICATION & INTERACTIVITY STATE ---
    const [dailyQuest, setDailyQuest] = useState<DailyQuest | null>(null);
    const [definitionState, setDefinitionState] = useState<DefinitionState | null>(null);
    const [isDefinitionLoading, setIsDefinitionLoading] = useState(false);
    const [upNextItem, setUpNextItem] = useState<UpNextItem | null>(null);
    const [understandingCheckState, setUnderstandingCheckState] = useState<UnderstandingCheckState>({ isOpen: false, isLoading: false, subtopic: null, quiz: [], error: null });
    const [projectTutorState, setProjectTutorState] = useState<ProjectTutorState>({ isOpen: false, isLoading: false, projectStep: null, userCode: null, feedback: null, error: null });


    // --- MODAL STATES ---
    const [storyModalState, setStoryModalState] = useState<StoryModalState>({ isOpen: false, isLoading: false, title: '', story: '', error: null });
    const [analogyModalState, setAnalogyModalState] = useState<AnalogyModalState>({ isOpen: false, isLoading: false, title: '', analogy: '', error: null });
    const [flashcardModalState, setFlashcardModalState] = useState<FlashcardModalState>({ isOpen: false, isLoading: false, title: '', flashcards: [], error: null });
    const [socraticModalState, setSocraticModalState] = useState<SocraticModalState>({ isOpen: false, isLoading: false, subtopic: null, quiz: [], error: null });
    const [expandTopicModalState, setExpandTopicModalState] = useState<ExpandTopicModalState>({ isOpen: false, isLoading: false, course: null, topic: null, subtopic: null, error: null });
    const [exploreModalState, setExploreModalState] = useState<ExploreModalState>({ isOpen: false, isLoading: false, course: null, relatedTopics: [] });
    const [mindMapModalState, setMindMapModalState] = useState<MindMapModalState>({ isOpen: false, course: null });
    const [articleIdeasModalState, setArticleIdeasModalState] = useState<ArticleIdeasModalState>({ isOpen: false, isLoading: false, course: null, ideas: [], error: null });
    const [interviewPrepState, setInterviewPrepState] = useState<InterviewPrepState>({ isOpen: false, course: null, questionSets: [], isGenerating: false, elaboratingIndex: null, error: null });
    const [preloadedTest, setPreloadedTest] = useState<{ topic: string, difficulty: KnowledgeLevel, questions: QuizData[] } | null>(null);
    const [articleTutorModalState, setArticleTutorModalState] = useState<ArticleTutorModalState>({ isOpen: false, isLoading: false, article: null, chatHistory: [] });
    
    // Practice Session State
    const [practiceSession, setPracticeSession] = useState<PracticeSession | null>(null);
    const [isPracticeLoading, setIsPracticeLoading] = useState(false);
    const [practiceError, setPracticeError] = useState<string | null>(null);

    // Fetch daily quest on load
    useEffect(() => {
        const today = new Date().toDateString();
        const lastQuestDate = localStorage.getItem('learnai-quest-date');

        const fetchQuest = async () => {
            if (today !== lastQuestDate) {
                try {
                    const questData = await geminiService.generateDailyQuest();
                    const newQuest = { ...questData, completed: false };
                    setDailyQuest(newQuest);
                    localStorage.setItem('learnai-quest', JSON.stringify(newQuest));
                    localStorage.setItem('learnai-quest-date', today);
                } catch (e) {
                    console.error("Failed to fetch daily quest", e);
                }
            } else {
                const savedQuest = localStorage.getItem('learnai-quest');
                if (savedQuest) {
                    setDailyQuest(JSON.parse(savedQuest));
                } else {
                    // refetch if it's missing for some reason
                    localStorage.removeItem('learnai-quest-date');
                    fetchQuest();
                }
            }
        };
        fetchQuest();
    }, []);

    // Generate "Up Next" item locally to avoid API rate limits
    useEffect(() => {
        const lastActiveCourse = courses.find(c => c.id === lastActiveCourseId);

        // 1. Suggest continuing the last active course if it's not complete
        if (lastActiveCourse) {
            const totalLessons = lastActiveCourse.topics.reduce((sum, t) => sum + t.subtopics.length, 0);
            const isComplete = totalLessons > 0 && lastActiveCourse.progress.size === totalLessons;
            if (!isComplete) {
                setUpNextItem({
                    type: 'continue_course',
                    title: 'Pick Up Where You Left Off',
                    description: `You're making great progress in "${lastActiveCourse.title}".`,
                    cta: 'Continue Learning',
                    courseId: lastActiveCourse.id,
                });
                return;
            }
        }

        // 2. Suggest starting a new, un-started course
        const firstUnstartedCourse = courses.find(c => c.progress.size === 0);
        if (firstUnstartedCourse) {
             setUpNextItem({
                type: 'start_course',
                title: 'Start a New Adventure',
                description: `Dive into "${firstUnstartedCourse.title}" and expand your skills.`,
                cta: 'Start Topic',
                courseId: firstUnstartedCourse.id,
            });
            return;
        }

        // 3. Fallback to skill assessment
        setUpNextItem({
            type: 'skill_assessment',
            title: 'Discover Your Strengths',
            description: 'Take a quick skill assessment to find out what you should learn next.',
            cta: 'Take Assessment',
        });
    }, [courses, lastActiveCourseId]);


    const clearPreloadedTest = useCallback(() => setPreloadedTest(null), []);

    const closeStoryModal = useCallback(() => setStoryModalState(prev => ({ ...prev, isOpen: false })), []);
    const closeAnalogyModal = useCallback(() => setAnalogyModalState(prev => ({ ...prev, isOpen: false })), []);
    const closeFlashcardModal = useCallback(() => setFlashcardModalState(prev => ({ ...prev, isOpen: false })), []);
    const closeSocraticModal = useCallback(() => setSocraticModalState(prev => ({ ...prev, isOpen: false })), []);
    const closeExpandTopicModal = useCallback(() => setExpandTopicModalState(prev => ({ ...prev, isOpen: false })), []);
    const closeExploreModal = useCallback(() => setExploreModalState(prev => ({ ...prev, isOpen: false })), []);
    const closeMindMapModal = useCallback(() => setMindMapModalState(prev => ({ ...prev, isOpen: false })), []);
    
    useEffect(() => { storageService.saveChatHistory(chatHistory); }, [chatHistory]);

    // --- ACTIONS ---
    const clearUnlockedAchievementNotification = useCallback(() => setUnlockedAchievementNotification(null), []);

    const unlockAchievement = useCallback((id: AchievementId) => {
        setGuestUser(prev => {
            if (prev.achievements.includes(id)) return prev;
            const newAchievements = [...prev.achievements, id];
            const achievement = achievementsMap.get(id);
            if (achievement) { setUnlockedAchievementNotification(achievement); }
            return { ...prev, achievements: newAchievements };
        });
    }, []);

    const openCreateTopicsModal = useCallback((folderId: string) => setCreateTopicsModalState({ isOpen: true, folderId }), []);
    const closeCreateTopicsModal = useCallback(() => setCreateTopicsModalState({ isOpen: false, folderId: null }), []);

    const openCreateArticlesModal = useCallback((folderId: string) => setCreateArticlesModalState({ isOpen: true, folderId }), []);
    const closeCreateArticlesModal = useCallback(() => setCreateArticlesModalState({ isOpen: false, folderId: null }), []);

    const handleGenerateCourse = useCallback(async (topic: string, level: KnowledgeLevel, folderId: string | null, goal: LearningGoal, style: LearningStyle, source: CourseSource | undefined, specificTech: string, includeTheory: boolean) => {
        const taskId = `task-course-${Date.now()}`;
        setError(null);
        setActiveTask({ id: taskId, type: 'course_generation', topic, status: 'generating', message: 'Generating Learning Path...' });
        
        try {
            const generatedCourseData = await geminiService.generateCourse(topic, level, goal, style, source, specificTech, includeTheory);
            const newCourse: Course = { ...generatedCourseData, id: `course_local_${Date.now()}`, progress: new Map(), knowledgeLevel: level };
            
            setCourses(prev => [...prev, newCourse]);
            if (folderId) {
                setFolders(prev => prev.map(f => f.id === folderId ? { ...f, courses: [...f.courses, newCourse] } : f));
            }

            unlockAchievement('curiousMind');
            if (courses.length + 1 >= 5) unlockAchievement('topicExplorer');
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'done', message: 'Success!', courseId: newCourse.id } : prev);

        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'Failed to generate course.';
            setError(errorMessage);
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'error', message: errorMessage } : prev);
        }
    }, [courses.length, unlockAchievement]);

    const handleSelectCourse = useCallback((courseId: string | null) => {
        if (!courseId) {
            setActiveCourse(null);
            return;
        }
        const course = courses.find(c => c.id === courseId);
        setActiveCourse(course || null);
        if (course) {
            localStorage.setItem('learnai-last-active-course', courseId);
            setLastActiveCourseId(courseId);
            setActiveArticle(null);
            setActiveProject(null);
        }
    }, [courses]);
    
    const handleSelectArticle = useCallback((articleId: string | null) => {
        if (!articleId) {
            setActiveArticle(null);
            return;
        }
        const article = articles.find(a => a.id === articleId);
        setActiveArticle(article || null);
        if (article) {
            setActiveCourse(null);
            setActiveProject(null);
        }
    }, [articles]);

    const handleDeleteCourse = useCallback((courseId: string) => {
        if (window.confirm("Are you sure you want to delete this topic?")) {
            setCourses(prev => prev.filter(c => c.id !== courseId));
            setFolders(prev => prev.map(folder => ({
                ...folder,
                courses: folder.courses.filter(c => c.id !== courseId)
            })));
        }
    }, []);

    const handleToggleItemComplete = useCallback((courseId: string, subtopicId: string) => {
        setCourses(prevCourses =>
            prevCourses.map(course => {
                if (course.id === courseId) {
                    const newProgress = new Map(course.progress);
                    if (newProgress.has(subtopicId)) {
                        newProgress.delete(subtopicId);
                    } else {
                        newProgress.set(subtopicId, Date.now());
                        setGuestUser(prevUser => {
                            let newXp = prevUser.xp + XP_PER_LESSON;
                            let newLevel = prevUser.level;
                            let requiredXp = calculateRequiredXp(newLevel);
                            while (newXp >= requiredXp) {
                                newXp -= requiredXp;
                                newLevel++;
                                requiredXp = calculateRequiredXp(newLevel);
                            }
                            return { ...prevUser, xp: newXp, level: newLevel };
                        });
                        unlockAchievement('firstSteps');
                    }
                    return { ...course, progress: newProgress };
                }
                return course;
            })
        );
    }, [unlockAchievement]);
    
    const handleCreateFolder = useCallback((name: string) => {
        const newFolder: Folder = { id: `folder_${Date.now()}`, name, courses: [], articles: [] };
        setFolders(prev => [...prev, newFolder]);
    }, []);
    
    const handleDeleteFolder = useCallback((folderId: string) => {
        if (window.confirm("Are you sure you want to delete this folder? Items inside will become uncategorized.")) {
            setFolders(prev => prev.filter(f => f.id !== folderId));
        }
    }, []);

    const handleUpdateFolderName = useCallback((folderId: string, newName: string) => {
        setFolders(prev => prev.map(f => (f.id === folderId ? { ...f, name: newName } : f)));
    }, []);

    const handleMoveCourseToFolder = useCallback((courseId: string, targetFolderId: string | null) => {
        const courseToMove = courses.find(c => c.id === courseId);
        if (!courseToMove) return;

        setFolders(prevFolders => {
            const foldersWithoutCourse = prevFolders.map(f => ({
                ...f,
                courses: f.courses.filter(c => c.id !== courseId),
            }));

            if (!targetFolderId) {
                return foldersWithoutCourse;
            }

            return foldersWithoutCourse.map(f => {
                if (f.id === targetFolderId) {
                    return { ...f, courses: [...f.courses, courseToMove] };
                }
                return f;
            });
        });
    }, [courses]);
    
    const handleSaveItemNote = useCallback((courseId: string, subtopicId: string, note: string) => {
        setCourses(prev => prev.map(c => {
            if (c.id === courseId) {
                const newTopics = c.topics.map(t => ({
                    ...t,
                    subtopics: t.subtopics.map(s => s.id === subtopicId ? { ...s, notes: note } : s)
                }));
                return { ...c, topics: newTopics };
            }
            return c;
        }));
    }, []);

    const handleDeleteArticle = useCallback((articleId: string) => {
        if (window.confirm("Are you sure you want to delete this article?")) {
            setArticles(prev => prev.filter(a => a.id !== articleId));
            setFolders(prev => prev.map(folder => ({
                ...folder,
                articles: folder.articles.filter(a => a.id !== articleId)
            })));
        }
    }, []);
    
    const handleMoveArticleToFolder = useCallback((articleId: string, folderId: string | null) => {
        const articleToMove = articles.find(a => a.id === articleId);
        if (!articleToMove) return;

        setFolders(prevFolders => {
            const foldersWithoutArticle = prevFolders.map(f => ({
                ...f,
                articles: f.articles.filter(a => a.id !== articleId),
            }));

            if (!folderId) {
                return foldersWithoutArticle;
            }

            return foldersWithoutArticle.map(f => {
                if (f.id === folderId) {
                    return { ...f, articles: [...f.articles, articleToMove] };
                }
                return f;
            });
        });
    }, [articles]);

    const toggleChat = useCallback(() => setIsChatOpen(prev => !prev), []);

    const sendChatMessage = useCallback(async (message: string) => {
        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }];
        setChatHistory(newHistory);
        setIsChatLoading(true);
        try {
            const response = await geminiService.generateChatResponse(newHistory);
            setChatHistory(prev => [...prev, { role: 'model', content: response }]);
        } catch (e) {
            setChatHistory(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error." }]);
        } finally {
            setIsChatLoading(false);
        }
    }, [chatHistory]);

    const cancelTask = useCallback((taskId: string) => {
        setActiveTask(null);
        setBackgroundTasks(prev => prev.filter(t => t.id !== taskId));
    }, []);
    
    const minimizeTask = useCallback((taskId: string) => {
        if (activeTask) {
            setBackgroundTasks(prev => [...prev, activeTask]);
            setActiveTask(null);
        }
    }, [activeTask]);

    const clearBackgroundTask = useCallback((taskId: string) => {
        setBackgroundTasks(prev => prev.filter(t => t.id !== taskId));
    }, []);

    const handleBackgroundTaskClick = useCallback((taskId: string) => {
        const task = backgroundTasks.find(t => t.id === taskId);
        if (task) {
            setActiveTask(task);
            setBackgroundTasks(prev => prev.filter(t => t.id !== taskId));
        }
    }, [backgroundTasks]);

    const handleSelectProject = useCallback((projectId: string | null) => {
        if (!projectId) {
            setActiveProject(null);
            return;
        }
        const project = projects.find(p => p.id === projectId);
        setActiveProject(project || null);
        if (project) {
            setActiveCourse(null);
            setActiveArticle(null);
        }
    }, [projects]);

    const handleDeleteProject = useCallback((projectId: string) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            setProjects(prev => prev.filter(p => p.id !== projectId));
        }
    }, []);

    const handleToggleProjectStepComplete = useCallback((projectId: string, stepId: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                const newProgress = new Map(p.progress);
                if (newProgress.has(stepId)) {
                    newProgress.delete(stepId);
                } else {
                    newProgress.set(stepId, Date.now());
                }
                return { ...p, progress: newProgress };
            }
            return p;
        }));
    }, []);

    const handleGenerateProject = useCallback(async (course: Course, subtopic: Subtopic | LearningItem) => {
        const taskId = `task-project-${Date.now()}`;
        setActiveTask({ id: taskId, type: 'project_generation', topic: subtopic.title, status: 'generating', message: 'Generating Project...' });
        try {
            const objective = subtopic.type === 'article' ? subtopic.data.objective : 'Build a practical application.';
            const projectData = await geminiService.generateProject(course.title, subtopic.title, objective || '');
            const newProject: Project = {
                ...projectData,
                id: `project_${Date.now()}`,
                course: { id: course.id, title: course.title },
                progress: new Map()
            };
            setProjects(prev => [...prev, newProject]);
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'done', message: 'Success!', projectId: newProject.id } : prev);
            unlockAchievement('projectStarter');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to generate project.';
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'error', message: errorMessage } : prev);
        }
    }, [unlockAchievement]);

    const handleStartLiveInterview = useCallback(async (topic: string) => {
        setLiveInterviewState({ topic, transcript: [], isLoading: true, error: null });
        try {
            const response = await geminiService.startLiveInterview(topic);
            setLiveInterviewState(prev => prev ? { ...prev, transcript: [{ role: 'model', content: response }], isLoading: false } : null);
        } catch (e) {
            setLiveInterviewState(prev => prev ? { ...prev, isLoading: false, error: "Failed to start interview." } : null);
        }
    }, []);

    const handleSendLiveInterviewMessage = useCallback(async (message: string) => {
        if (!liveInterviewState) return;
        const newTranscript: ChatMessage[] = [...liveInterviewState.transcript, { role: 'user', content: message }];
        setLiveInterviewState({ ...liveInterviewState, transcript: newTranscript, isLoading: true });
        try {
            const response = await geminiService.generateLiveInterviewResponse(liveInterviewState.topic, newTranscript);
            setLiveInterviewState(prev => prev ? { ...prev, transcript: [...newTranscript, { role: 'model', content: response }], isLoading: false } : null);
        } catch (e) {
            setLiveInterviewState(prev => prev ? { ...prev, isLoading: false, error: "Failed to get response." } : null);
        }
    }, [liveInterviewState]);

    const handleEndLiveInterview = useCallback(() => setLiveInterviewState(null), []);

    const handleStartPracticeQuiz = useCallback(async (topic: string, difficulty: KnowledgeLevel, navigate: () => void) => {
        setIsPracticeQuizLoading(true);
        try {
            const questions = await geminiService.generateQuickPracticeQuiz(topic, difficulty, 5);
            setPracticeQuizSession({ topic, difficulty, questions });
            navigate();
        } catch (e) {
            console.error(e);
        } finally {
            setIsPracticeQuizLoading(false);
        }
    }, []);

    const handleStartTopicPractice = useCallback(async (course: Course, topic: Topic | Module, subtopic: Subtopic | LearningItem, navigate: () => void) => {
        setIsPracticeLoading(true);
        setPracticeError(null);
        try {
            const sessionData = await geminiService.generatePracticeSession(subtopic.title);
            setPracticeSession(sessionData);
            navigate();
        } catch (e) {
            setPracticeError(e instanceof Error ? e.message : "Failed to generate practice session.");
        } finally {
            setIsPracticeLoading(false);
        }
    }, []);

    const handleGenerateCodeExplanation = useCallback(async (input: { type: 'link' | 'text' | 'image'; content: string | File; }) => {
        setCodeExplanation({ isLoading: true, content: null, error: null });
        try {
            let contentForApi: string | { data: string; mimeType: string; };
            if (input.type === 'image' && input.content instanceof File) {
                const reader = new FileReader();
                const base64String = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(input.content as File);
                });
                contentForApi = { data: base64String, mimeType: (input.content as File).type };
            } else {
                contentForApi = input.content as string;
            }
            const explanation = await geminiService.generateCodeExplanation({ ...input, content: contentForApi });
            setCodeExplanation({ isLoading: false, content: explanation, error: null });
        } catch (e) {
            setCodeExplanation({ isLoading: false, content: null, error: e instanceof Error ? e.message : 'Failed to get explanation.' });
        }
    }, []);

    const handleBulkGenerateCourses = useCallback(async (topics: string[], folderId: string) => {
        for (const topic of topics) {
            await handleGenerateCourse(topic, 'beginner', folderId, 'theory', 'balanced', undefined, '', false);
        }
    }, [handleGenerateCourse]);

    const handleBulkGenerateArticles = useCallback(async (syllabus: string, folderId: string) => {
        setBulkArticleGenerationState({ isLoading: true, progressMessage: "Generating article ideas...", generatedArticles: [], error: null });
        try {
            const topics = await geminiService.generateArticleTopicsFromSyllabus(syllabus);
            for (let i = 0; i < topics.length; i++) {
                setBulkArticleGenerationState(prev => ({ ...prev, progressMessage: `Generating article ${i + 1}/${topics.length}: "${topics[i]}"` }));
                const articleData = await geminiService.generateBlogPostAndIdeas(topics[i]);
                const newArticle: Article = {
                    ...articleData,
                    id: `article_${Date.now()}_${i}`
                };
                setArticles(prev => [...prev, newArticle]);
                setFolders(prev => prev.map(f => f.id === folderId ? { ...f, articles: [...f.articles, newArticle] } : f));
                setBulkArticleGenerationState(prev => ({...prev, generatedArticles: [...prev.generatedArticles, newArticle]}));
            }
            setBulkArticleGenerationState(prev => ({ ...prev, isLoading: false, progressMessage: "All articles generated successfully!" }));
        } catch (e) {
            setBulkArticleGenerationState(prev => ({ ...prev, isLoading: false, error: e instanceof Error ? e.message : 'An error occurred' }));
        }
    }, []);

    const handleCreateLearningPlan = useCallback(async (topic: string, duration?: number) => {
        const taskId = `task-plan-${Date.now()}`;
        setActiveTask({ id: taskId, type: 'plan_generation', topic, status: 'generating', message: 'Generating Learning Plan...' });
        try {
            const planData = await geminiService.generateLearningPlan(topic, duration);
            
            // Create the learning plan with generated courses
            const planId = `plan-${Date.now()}`;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDate = today.getTime();
            
            const newPlan: LearningPlan = {
                id: planId,
                title: planData.title || `Learn ${topic}`,
                startDate,
                duration: planData.duration || duration || 7,
                dailyTasks: [],
                status: 'active',
                folderId: '' // Will be set to a default folder
            };

            // Generate courses and tasks for each day
            const generatedCourses: Course[] = [];
            const dailyTasks: DailyTask[] = [];

            for (let day = 0; day < newPlan.duration; day++) {
                const dayTopic = planData.dailyTopics?.[day] || `${topic} - Day ${day + 1}`;
                const courseId = `course-${planId}-day-${day + 1}`;
                
                // Generate course for this day
                const course: Course = {
                    id: courseId,
                    title: dayTopic,
                    description: `Day ${day + 1} of your ${topic} learning journey`,
                    category: 'Learning Plan',
                    technologies: [],
                    topics: [], // Will be populated by course generation
                    knowledgeLevel: 'beginner',
                    progress: new Set(),
                    about: '',
                    overview: { totalTopics: 0, totalSubtopics: 0, keyFeatures: [] },
                    learningOutcomes: [],
                    skills: [],
                    learningPlanId: planId,
                    dayInPlan: day + 1
                };

                generatedCourses.push(course);

                // Create daily task
                const taskDate = new Date(startDate + day * 24 * 60 * 60 * 1000);
                const dailyTask: DailyTask = {
                    id: `task-${courseId}`,
                    day: day + 1,
                    date: taskDate.getTime(),
                    courseId,
                    isCompleted: false
                };

                dailyTasks.push(dailyTask);
            }

            newPlan.dailyTasks = dailyTasks;

            // Update state
            setCourses(prev => [...prev, ...generatedCourses]);
            setGuestUser(prev => ({
                ...prev,
                learningPlans: [...prev.learningPlans, newPlan]
            }));

            // Set as active plan
            setActivePlan(newPlan);
            
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'done', message: 'Learning plan created successfully!' } : prev);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to generate plan.';
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'error', message: errorMessage } : prev);
        }
    }, []);

    const handleSelectPlan = useCallback((planId: string | null) => {
        if (!planId) {
            setActivePlan(null);
            return;
        }
        const plan = localUser.learningPlans.find(p => p.id === planId);
        setActivePlan(plan || null);
    }, [localUser.learningPlans]);

    const handleDeletePlan = useCallback((planId: string) => {
        // Remove associated courses
        setCourses(prev => prev.filter(course => course.learningPlanId !== planId));
        
        // Remove from user's plans
        setGuestUser(prev => ({
            ...prev,
            learningPlans: prev.learningPlans.filter(plan => plan.id !== planId)
        }));

        // Clear active plan if it was deleted
        if (activePlan?.id === planId) {
            setActivePlan(null);
        }
    }, [activePlan]);

    const handleRescheduleTask = useCallback((planId: string, taskId: string, newDate: number) => {
        setGuestUser(prev => ({
            ...prev,
            learningPlans: prev.learningPlans.map(plan => 
                plan.id === planId 
                    ? {
                        ...plan,
                        dailyTasks: plan.dailyTasks.map(task =>
                            task.id === taskId ? { ...task, date: newDate } : task
                        )
                    }
                    : plan
            )
        }));

        // Update active plan if it's the current one
        if (activePlan?.id === planId) {
            setActivePlan(prev => prev ? {
                ...prev,
                dailyTasks: prev.dailyTasks.map(task =>
                    task.id === taskId ? { ...task, date: newDate } : task
                )
            } : null);
        }
    }, [activePlan]);

    const handleDeleteTaskFromPlan = useCallback((planId: string, taskId: string) => {
        setGuestUser(prev => ({
            ...prev,
            learningPlans: prev.learningPlans.map(plan => 
                plan.id === planId 
                    ? {
                        ...plan,
                        dailyTasks: plan.dailyTasks.filter(task => task.id !== taskId)
                    }
                    : plan
            )
        }));

        // Update active plan if it's the current one
        if (activePlan?.id === planId) {
            setActivePlan(prev => prev ? {
                ...prev,
                dailyTasks: prev.dailyTasks.filter(task => task.id !== taskId)
            } : null);
        }

        // Remove associated course
        const task = localUser.learningPlans.find(p => p.id === planId)?.dailyTasks.find(t => t.id === taskId);
        if (task) {
            setCourses(prev => prev.filter(course => course.id !== task.courseId));
        }
    }, [activePlan, localUser.learningPlans]);

    const handleToggleTaskComplete = useCallback((planId: string, taskId: string) => {
        setGuestUser(prev => ({
            ...prev,
            learningPlans: prev.learningPlans.map(plan => 
                plan.id === planId 
                    ? {
                        ...plan,
                        dailyTasks: plan.dailyTasks.map(task =>
                            task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
                        )
                    }
                    : plan
            )
        }));

        // Update active plan if it's the current one
        if (activePlan?.id === planId) {
            setActivePlan(prev => prev ? {
                ...prev,
                dailyTasks: prev.dailyTasks.map(task =>
                    task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
                )
            } : null);
        }
    }, [activePlan]);

    const handleDefineTerm = useCallback(async (term: string, position: { top: number; left: number, right?: number }, targetWidth: number) => {
        setDefinitionState({ term, definition: '', position, targetWidth });
        setIsDefinitionLoading(true);
        try {
            const definition = await geminiService.defineTerm(term);
            setDefinitionState({ term, definition, position, targetWidth });
        } catch (e) {
            setDefinitionState({ term, definition: "Could not fetch definition.", position, targetWidth });
        } finally {
            setIsDefinitionLoading(false);
        }
    }, []);

    const closeDefinition = useCallback(() => setDefinitionState(null), []);

    const handleGenerateBlogPost = useCallback(async (topic: string, folderId?: string | null) => {
        setArticleCreatorState({ isLoading: true, error: null, title: null, subtitle: null, blogPost: null, ideas: [] });
        try {
            const data = await geminiService.generateBlogPostAndIdeas(topic);
            const newArticle: Article = {
                id: `article_${Date.now()}`,
                title: data.title,
                subtitle: data.subtitle,
                blogPost: data.blogPost
            };
            setArticles(prev => [...prev, newArticle]);
            if (folderId) {
                setFolders(prev => prev.map(f => f.id === folderId ? { ...f, articles: [...f.articles, newArticle] } : f));
            }
            setArticleCreatorState({ ...data, isLoading: false, error: null });
        } catch (e) {
            setArticleCreatorState({ isLoading: false, error: e instanceof Error ? e.message : 'Failed to generate post.', title: null, subtitle: null, blogPost: null, ideas: [] });
        }
    }, []);

    const resetBulkArticleGeneration = useCallback(() => {
        setBulkArticleGenerationState({ isLoading: false, progressMessage: null, generatedArticles: [], error: null });
    }, []);

    const handleGenerateBulkArticlesForPage = useCallback(async (syllabus: string, folderId: string | null) => {
        setBulkArticleGenerationState({ isLoading: true, progressMessage: "Generating article ideas...", generatedArticles: [], error: null });
        try {
            const topics = await geminiService.generateArticleTopicsFromSyllabus(syllabus);
            for (let i = 0; i < topics.length; i++) {
                setBulkArticleGenerationState(prev => ({ ...prev, progressMessage: `Generating article ${i + 1}/${topics.length}: "${topics[i]}"` }));
                const articleData = await geminiService.generateBlogPostAndIdeas(topics[i]);
                const newArticle: Article = {
                    ...articleData,
                    id: `article_${Date.now()}_${i}`
                };
                setArticles(prev => [...prev, newArticle]);
                setFolders(prev => prev.map(f => f.id === folderId ? { ...f, articles: [...f.articles, newArticle] } : f));
                setBulkArticleGenerationState(prev => ({...prev, generatedArticles: [...prev.generatedArticles, newArticle]}));
            }
            setBulkArticleGenerationState(prev => ({ ...prev, isLoading: false, progressMessage: "All articles generated successfully!" }));
        } catch (e) {
            setBulkArticleGenerationState(prev => ({ ...prev, isLoading: false, error: e instanceof Error ? e.message : 'An error occurred' }));
        }
    }, []);

    const handleShowArticleIdeasModal = useCallback(async (course: Course) => {
        setArticleIdeasModalState({ isOpen: true, isLoading: true, course, ideas: [] });
        try {
            const ideas = await geminiService.generateArticleIdeas(course.title);
            setArticleIdeasModalState({ isOpen: true, isLoading: false, course, ideas });
        } catch (e) {
            setArticleIdeasModalState({ isOpen: true, isLoading: false, course, ideas: [], error: "Failed to generate ideas." });
        }
    }, []);

    const closeArticleIdeasModal = useCallback(() => setArticleIdeasModalState({ isOpen: false, isLoading: false, course: null, ideas: [] }), []);

    const handleGenerateArticle = useCallback(async (topic: string, courseId: string) => {
        // Simplified version: delegates to blog post generator
        closeArticleIdeasModal();
        handleGenerateBlogPost(topic);
    }, [handleGenerateBlogPost, closeArticleIdeasModal]);

    const handleShowTopicStory = useCallback(async (subtopic: Subtopic | LearningItem) => {
        setStoryModalState({ isOpen: true, isLoading: true, title: subtopic.title, story: '', error: null });
        try {
            const story = await geminiService.generateStory(subtopic.title);
            setStoryModalState({ isOpen: true, isLoading: false, title: subtopic.title, story, error: null });
        } catch (e) {
            setStoryModalState({ isOpen: true, isLoading: false, title: subtopic.title, story: '', error: "Failed to generate story." });
        }
    }, []);

    const handleShowTopicAnalogy = useCallback(async (subtopic: Subtopic | LearningItem) => {
        setAnalogyModalState({ isOpen: true, isLoading: true, title: subtopic.title, analogy: '', error: null });
        try {
            const analogy = await geminiService.generateAnalogy(subtopic.title);
            setAnalogyModalState({ isOpen: true, isLoading: false, title: subtopic.title, analogy, error: null });
        } catch (e) {
            setAnalogyModalState({ isOpen: true, isLoading: false, title: subtopic.title, analogy: '', error: "Failed to get analogy." });
        }
    }, []);

    const handleShowTopicFlashcards = useCallback(async (subtopic: Subtopic | LearningItem) => {
        setFlashcardModalState({ isOpen: true, isLoading: true, title: subtopic.title, flashcards: [], error: null });
        try {
            const flashcards = await geminiService.generateFlashcards(subtopic.title);
            setFlashcardModalState({ isOpen: true, isLoading: false, title: subtopic.title, flashcards, error: null });
        } catch (e) {
            setFlashcardModalState({ isOpen: true, isLoading: false, title: subtopic.title, flashcards: [], error: "Failed to generate flashcards." });
        }
    }, []);

    const handleExpandTopicInModule = useCallback(async (course: Course, topic: Topic, subtopic: Subtopic, prompt: string) => {
        setExpandTopicModalState({ isOpen: true, isLoading: true, course, topic, subtopic, error: null });
        try {
            const newSubtopics = await geminiService.generateFollowUpSubtopics(course.title, topic.title, subtopic.title, prompt);
            setCourses(prev => prev.map(c => {
                if (c.id === course.id) {
                    const newTopics = c.topics.map(t => {
                        if (t.title === topic.title) {
                            const subtopicIndex = t.subtopics.findIndex(s => s.id === subtopic.id);
                            const newSubtopicsWithFlag = newSubtopics.map(ns => ({ ...ns, isAdaptive: true }));
                            const updatedSubtopics = [...t.subtopics];
                            updatedSubtopics.splice(subtopicIndex + 1, 0, ...newSubtopicsWithFlag);
                            return { ...t, subtopics: updatedSubtopics };
                        }
                        return t;
                    });
                    return { ...c, topics: newTopics };
                }
                return c;
            }));
            closeExpandTopicModal();
        } catch (e) {
            setExpandTopicModalState(prev => ({ ...prev, isLoading: false, error: "Failed to expand topic." }));
        }
    }, [closeExpandTopicModal]);

    const handleShowExpandTopicModal = useCallback((course: Course) => {
        setExpandTopicModalState({ isOpen: true, isLoading: false, course, topic: null, subtopic: null, error: null });
    }, []);
    
    const handleShowExploreModal = useCallback(async (course: Course) => {
        setExploreModalState({ isOpen: true, isLoading: true, course, relatedTopics: [] });
        try {
            const topics = await geminiService.generateRelatedTopics(course.title);
            setExploreModalState({ isOpen: true, isLoading: false, course, relatedTopics: topics });
        } catch (e) {
            setExploreModalState(prev => ({ ...prev, isLoading: false, error: "Failed to load topics." }));
        }
    }, []);

    const handleShowMindMapModal = useCallback((course: Course) => {
        setMindMapModalState({ isOpen: true, course });
    }, []);

    const handleShowSocraticQuiz = useCallback(async (subtopic: Subtopic | LearningItem) => {
        setSocraticModalState({ isOpen: true, isLoading: true, subtopic, quiz: [], error: null });
        try {
            let content = '';
            if (subtopic.type === 'article' && subtopic.data.contentBlocks) {
                content = subtopic.data.contentBlocks.filter(b => b.type === 'text').map(b => b.text).join('\n\n');
            } else {
                content = subtopic.title;
            }
            const quizData = await geminiService.generateSocraticQuiz(content);
            setSocraticModalState({ isOpen: true, isLoading: false, subtopic, quiz: quizData, error: null });
        } catch (e) {
            setSocraticModalState({ isOpen: true, isLoading: false, subtopic, quiz: [], error: "Failed to generate quiz." });
        }
    }, []);

    const handleStartInterviewPrep = useCallback((course: Course) => {
        setInterviewPrepState({ isOpen: true, course, questionSets: course.interviewQuestionSets || [], isGenerating: false, elaboratingIndex: null, error: null });
    }, []);

    const handleGenerateInterviewQuestions = useCallback(async (courseId: string, difficulty: KnowledgeLevel, count: number) => {
        setInterviewPrepState(prev => ({ ...prev, isGenerating: true }));
        try {
            // This is a simplified local implementation. In a real app, this would be an API call.
            const course = courses.find(c => c.id === courseId);
            if (!course) throw new Error("Course not found");
            
            const existingQuestions = course.interviewQuestionSets?.flatMap(set => set.questions.map(q => q.question)) || [];
            const newQuestions = await geminiService.generateInterviewQuestions(course.title, difficulty, count, existingQuestions);
            
            const newSet: InterviewQuestionSet = {
                id: `set_${Date.now()}`,
                timestamp: Date.now(),
                difficulty,
                questionCount: newQuestions.length,
                questions: newQuestions,
            };

            const updatedCourse = { ...course, interviewQuestionSets: [...(course.interviewQuestionSets || []), newSet] };
            setCourses(prev => prev.map(c => c.id === courseId ? updatedCourse : c));
            setInterviewPrepState(prev => ({ ...prev, isGenerating: false, questionSets: updatedCourse.interviewQuestionSets || [] }));
        } catch (e) {
            setInterviewPrepState(prev => ({ ...prev, isGenerating: false, error: "Failed to generate questions." }));
        }
    }, [courses]);

    const handleElaborateAnswer = useCallback(async (courseId: string, setId: string, qIndex: number, question: string, answer: string) => {
        const setIndex = interviewPrepState.questionSets.findIndex(s => s.id === setId);
        setInterviewPrepState(prev => ({ ...prev, elaboratingIndex: { setIndex, qIndex } }));
        try {
            const elaborated = await geminiService.elaborateOnAnswer(question, answer);
            setCourses(prevCourses => prevCourses.map(c => {
                if (c.id === courseId) {
                    const newSets = (c.interviewQuestionSets || []).map(s => {
                        if (s.id === setId) {
                            const newQuestions = [...s.questions];
                            newQuestions[qIndex] = { ...newQuestions[qIndex], answer: elaborated };
                            return { ...s, questions: newQuestions };
                        }
                        return s;
                    });
                    setInterviewPrepState(prev => ({...prev, questionSets: newSets}));
                    return { ...c, interviewQuestionSets: newSets };
                }
                return c;
            }));
        } catch (e) {
            // Handle error visually if needed
        } finally {
            setInterviewPrepState(prev => ({ ...prev, elaboratingIndex: null }));
        }
    }, [interviewPrepState.questionSets]);

    const resetInterviewPrep = useCallback(() => {
        setInterviewPrepState({ isOpen: false, course: null, questionSets: [], isGenerating: false, elaboratingIndex: null, error: null });
    }, []);

    const closeInterviewPrepModal = useCallback(() => setInterviewPrepState(prev => ({...prev, isOpen: false})), []);

    const handleUpdateContentBlock = useCallback((courseId: string, itemId: string, blockId: string, newSyntax: string) => {
        setCourses(prev => prev.map(c => {
            if (c.id === courseId) {
                return {
                    ...c,
                    topics: c.topics.map(t => ({
                        ...t,
                        subtopics: t.subtopics.map(s => {
                            if (s.id === itemId && s.type === 'article' && s.data.contentBlocks) {
                                return {
                                    ...s,
                                    data: {
                                        ...s.data,
                                        contentBlocks: s.data.contentBlocks.map(b => b.id === blockId ? { ...b, diagram: newSyntax } : b)
                                    }
                                };
                            }
                            return s;
                        })
                    }))
                };
            }
            return c;
        }));
    }, []);

    const handleOpenArticleTutor = useCallback((article: Article) => {
        setArticleTutorModalState({ isOpen: true, isLoading: false, article, chatHistory: [{ role: 'model', content: `Hello! How can I help you with the article "${article.title}"?` }] });
    }, []);

    const closeArticleTutor = useCallback(() => setArticleTutorModalState({ isOpen: false, isLoading: false, article: null, chatHistory: [] }), []);

    const sendArticleTutorMessage = useCallback(async (message: string) => {
        if (!articleTutorModalState.article) return;
        const newHistory: ChatMessage[] = [...articleTutorModalState.chatHistory, { role: 'user', content: message }];
        setArticleTutorModalState(prev => ({ ...prev, chatHistory: newHistory, isLoading: true }));
        try {
            const context = `The user is asking about the following article:\n\nTitle: ${articleTutorModalState.article.title}\nContent:\n${articleTutorModalState.article.blogPost}`;
            const response = await geminiService.generateChatResponse(newHistory, context);
            setArticleTutorModalState(prev => ({ ...prev, chatHistory: [...newHistory, { role: 'model', content: response }], isLoading: false }));
        } catch (e) {
            setArticleTutorModalState(prev => ({ ...prev, chatHistory: [...newHistory, { role: 'model', content: "Sorry, I had an issue." }], isLoading: false }));
        }
    }, [articleTutorModalState]);

    const handleCheckUnderstanding = useCallback(async (subtopic: Subtopic | LearningItem) => {
        setUnderstandingCheckState({ isOpen: true, isLoading: true, subtopic, quiz: [], error: null });
        try {
            const content = subtopic.type === 'article' ? subtopic.data.contentBlocks?.map(b => b.text).join('\n') || '' : '';
            const quizData = await geminiService.generateUnderstandingCheck(content);
            setUnderstandingCheckState({ isOpen: true, isLoading: false, subtopic, quiz: quizData, error: null });
        } catch (e) {
            setUnderstandingCheckState({ isOpen: true, isLoading: false, subtopic, quiz: [], error: "Failed to generate questions." });
        }
    }, []);

    const closeUnderstandingCheckModal = useCallback(() => setUnderstandingCheckState({ isOpen: false, isLoading: false, subtopic: null, quiz: [], error: null }), []);

    const handleUnderstandingCheckSubmit = useCallback((answers: Map<number, number>) => {
        // Here you could add logic to check answers, provide feedback, or generate remedial content.
        closeUnderstandingCheckModal();
        if (understandingCheckState.subtopic) {
            handleToggleItemComplete(activeCourse!.id, understandingCheckState.subtopic.id);
        }
    }, [understandingCheckState.subtopic, closeUnderstandingCheckModal, handleToggleItemComplete, activeCourse]);

    const closeProjectTutorModal = useCallback(() => setProjectTutorState({ isOpen: false, isLoading: false, projectStep: null, userCode: null, feedback: null, error: null }), []);

    const handleGetProjectFeedback = useCallback(async (step: ProjectStep, userCode: string) => {
        setProjectTutorState({ isOpen: true, isLoading: true, projectStep: step, userCode, feedback: null, error: null });
        try {
            const feedback = await geminiService.reviewProjectCode(step.challenge, userCode);
            setProjectTutorState(prev => ({ ...prev, isLoading: false, feedback }));
        } catch (e) {
            setProjectTutorState(prev => ({ ...prev, isLoading: false, error: "Failed to get feedback." }));
        }
    }, []);



    // --- HABIT ACTIONS ---
    const handleAddHabit = useCallback((title: string) => {
        const newHabit: Habit = {
            id: `habit_${Date.now()}`,
            title,
            goal: 'daily',
            createdAt: Date.now(),
            history: {},
        };
        setGuestUser(prev => ({
            ...prev,
            habits: [...prev.habits, newHabit],
        }));
    }, []);

    const handleToggleHabitCompletion = useCallback((habitId: string, date: string) => {
        setGuestUser(prev => {
            const updatedHabits = prev.habits.map(habit => {
                if (habit.id === habitId) {
                    const newHistory = { ...habit.history };
                    if (newHistory[date]) {
                        delete newHistory[date]; // Un-checking removes the key
                    } else {
                        newHistory[date] = true; // Checking adds it
                    }
                    return { ...habit, history: newHistory };
                }
                return habit;
            });
            return { ...prev, habits: updatedHabits };
        });
    }, []);

    const handleDeleteHabit = useCallback((habitId: string) => {
        if (window.confirm("Are you sure you want to delete this habit? All its history will be lost.")) {
            setGuestUser(prev => ({
                ...prev,
                habits: prev.habits.filter(h => h.id !== habitId),
            }));
        }
    }, []);

    const value: AppContextType = useMemo(() => ({
        courses, folders, projects, articles, localUser, activeCourse, activeProject, activeArticle, activePlan, topic, error, handleGenerateCourse, handleSelectCourse, handleSelectArticle, handleDeleteCourse, handleToggleItemComplete, handleCreateFolder, handleDeleteFolder, handleUpdateFolderName, handleMoveCourseToFolder, handleSaveItemNote, handleDeleteArticle, handleMoveArticleToFolder, lastActiveCourseId, isChatOpen, chatHistory, isChatLoading, toggleChat, sendChatMessage, activeTask, backgroundTasks, cancelTask, minimizeTask, clearBackgroundTask, handleBackgroundTaskClick, handleSelectProject, handleDeleteProject, handleToggleProjectStepComplete, handleGenerateProject, liveInterviewState, handleStartLiveInterview, handleSendLiveInterviewMessage, handleEndLiveInterview, practiceQuizSession, isPracticeQuizLoading, handleStartPracticeQuiz, practiceSession, isPracticeLoading, practiceError, handleStartTopicPractice, codeExplanation, handleGenerateCodeExplanation, createTopicsModalState, openCreateTopicsModal, closeCreateTopicsModal, handleBulkGenerateCourses, createArticlesModalState, openCreateArticlesModal, closeCreateArticlesModal, handleBulkGenerateArticles, handleCreateLearningPlan, handleSelectPlan, handleDeletePlan, handleRescheduleTask, handleDeleteTaskFromPlan, handleToggleTaskComplete, unlockAchievement, unlockedAchievementNotification, clearUnlockedAchievementNotification, dailyQuest, handleDefineTerm, definitionState, isDefinitionLoading, closeDefinition, articleCreatorState, handleGenerateBlogPost, bulkArticleGenerationState, handleGenerateBulkArticlesForPage, resetBulkArticleGeneration, articleIdeasModalState, handleShowArticleIdeasModal, closeArticleIdeasModal, handleGenerateArticle, storyModalState, handleShowTopicStory, closeStoryModal, analogyModalState, handleShowTopicAnalogy, closeAnalogyModal, flashcardModalState, handleShowTopicFlashcards, closeFlashcardModal, expandTopicModalState, closeExpandTopicModal, handleExpandTopicInModule, handleShowExpandTopicModal, exploreModalState, handleShowExploreModal, closeExploreModal, mindMapModalState, handleShowMindMapModal, closeMindMapModal, socraticModalState, handleShowSocraticQuiz, closeSocraticModal, interviewPrepState, handleStartInterviewPrep, handleGenerateInterviewQuestions, handleElaborateAnswer, resetInterviewPrep, closeInterviewPrepModal, preloadedTest, clearPreloadedTest, handleUpdateContentBlock, articleTutorModalState, handleOpenArticleTutor, closeArticleTutor, sendArticleTutorMessage, upNextItem, understandingCheckState, handleCheckUnderstanding, closeUnderstandingCheckModal, handleUnderstandingCheckSubmit, projectTutorState, closeProjectTutorModal, handleGetProjectFeedback,
        handleAddHabit, handleToggleHabitCompletion, handleDeleteHabit,
    }), [
        courses, folders, projects, articles, localUser, activeCourse, activeProject, activeArticle, activePlan, topic, error, handleGenerateCourse, handleSelectCourse, handleSelectArticle, handleDeleteCourse, handleToggleItemComplete, handleCreateFolder, handleDeleteFolder, handleUpdateFolderName, handleMoveCourseToFolder, handleSaveItemNote, handleDeleteArticle, handleMoveArticleToFolder, lastActiveCourseId, isChatOpen, chatHistory, isChatLoading, toggleChat, sendChatMessage, activeTask, backgroundTasks, cancelTask, minimizeTask, clearBackgroundTask, handleBackgroundTaskClick, handleSelectProject, handleDeleteProject, handleToggleProjectStepComplete, handleGenerateProject, liveInterviewState, handleStartLiveInterview, handleSendLiveInterviewMessage, handleEndLiveInterview, practiceQuizSession, isPracticeQuizLoading, handleStartPracticeQuiz, practiceSession, isPracticeLoading, practiceError, handleStartTopicPractice, codeExplanation, handleGenerateCodeExplanation, createTopicsModalState, openCreateTopicsModal, closeCreateTopicsModal, handleBulkGenerateCourses, createArticlesModalState, openCreateArticlesModal, closeCreateArticlesModal, handleBulkGenerateArticles, handleCreateLearningPlan, handleSelectPlan, handleDeletePlan, handleRescheduleTask, handleDeleteTaskFromPlan, handleToggleTaskComplete, unlockAchievement, unlockedAchievementNotification, clearUnlockedAchievementNotification, dailyQuest, handleDefineTerm, definitionState, isDefinitionLoading, closeDefinition, articleCreatorState, handleGenerateBlogPost, bulkArticleGenerationState, handleGenerateBulkArticlesForPage, resetBulkArticleGeneration, articleIdeasModalState, handleShowArticleIdeasModal, closeArticleIdeasModal, handleGenerateArticle, storyModalState, handleShowTopicStory, closeStoryModal, analogyModalState, handleShowTopicAnalogy, closeAnalogyModal, flashcardModalState, handleShowTopicFlashcards, closeFlashcardModal, expandTopicModalState, closeExpandTopicModal, handleExpandTopicInModule, handleShowExpandTopicModal, exploreModalState, handleShowExploreModal, closeExploreModal, mindMapModalState, handleShowMindMapModal, closeMindMapModal, socraticModalState, handleShowSocraticQuiz, closeSocraticModal, interviewPrepState, handleStartInterviewPrep, handleGenerateInterviewQuestions, handleElaborateAnswer, resetInterviewPrep, closeInterviewPrepModal, preloadedTest, clearPreloadedTest, handleUpdateContentBlock, articleTutorModalState, handleOpenArticleTutor, closeArticleTutor, sendArticleTutorMessage, upNextItem, understandingCheckState, handleCheckUnderstanding, closeUnderstandingCheckModal, handleUnderstandingCheckSubmit, projectTutorState, closeProjectTutorModal, handleGetProjectFeedback,
        handleAddHabit, handleToggleHabitCompletion, handleDeleteHabit
    ]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
