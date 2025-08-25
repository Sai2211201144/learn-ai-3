import React, { useState, useEffect, useMemo } from 'react';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import { useAppContext } from '../../context/AppContext';
import { 
    CalendarDaysIcon, 
    ChartBarIcon,
    BookOpenIcon,
    TrophyIcon,
    ClockIcon,
    FireIcon,
    PlusIcon,
    ArrowRightIcon,
    PlayIcon,
    CheckCircleIcon,
    AcademicCapIcon,
    SparklesIcon,
    RocketLaunchIcon,
    CubeIcon
} from '../common/Icons';
import ProgressBar from '../common/ProgressBar';
import ContinueLearningCard from './ContinueLearningCard';
import StatsCard from './StatsCard';
import ProjectStyleCourseCard from './ProjectStyleCourseCard';

interface DashboardStats {
    totalCourses: number;
    completedCourses: number;
    totalLearningTime: number;
    currentStreak: number;
    totalXP: number;
    weeklyGoalsCompleted: number;
    averageScore: number;
}

const PersonalizedDashboard: React.FC = () => {
    const { 
        user: firebaseUser, 
        profile: userProfile,
        learningPlans,
        activePlan,
        learningGoals,
        dailyTasks
    } = useFirebaseAuth();
    
    const { 
        courses, 
        articles,
        folders,
        handleSelectCourse,
        handleStartQuest
    } = useAppContext();

    // Get user name
    const userName = firebaseUser ? 
        (userProfile?.full_name || firebaseUser.displayName || 'Learner') : 
        'Guest';

    const firstName = userName.split(' ')[0];

    // Calculate dashboard stats
    const stats: DashboardStats = useMemo(() => {
        const totalCourses = courses.length;
        const completedCourses = courses.filter(course => 
            course.modules.every(module => 
                module.topics.every(topic => 
                    topic.subtopics.every(subtopic => subtopic.completed)
                )
            )
        ).length;

        // Calculate total learning time (estimated)
        const totalLearningTime = courses.reduce((total, course) => {
            return total + (course.modules.length * 30); // 30 min per module estimate
        }, 0);

        // Current streak (days)
        const currentStreak = Math.floor(Math.random() * 15) + 1; // Placeholder

        // Total XP
        const totalXP = completedCourses * 500 + articles.length * 100;

        // Weekly goals completed
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        const weeklyGoalsCompleted = learningGoals.filter(goal => {
            const goalDate = new Date(goal.target_date);
            return goalDate >= weekStart && goal.is_completed;
        }).length;

        // Average score
        const averageScore = Math.floor(Math.random() * 30) + 70; // Placeholder

        return {
            totalCourses,
            completedCourses,
            totalLearningTime,
            currentStreak,
            totalXP,
            weeklyGoalsCompleted,
            averageScore
        };
    }, [courses, articles, learningGoals]);

    // Get recent courses
    const recentCourses = useMemo(() => {
        return courses.slice(0, 4);
    }, [courses]);

    // Get today's goals
    const todaysGoals = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return learningGoals.filter(goal => 
            goal.goal_type === 'daily' && 
            goal.target_date === today &&
            !goal.is_completed
        ).slice(0, 3);
    }, [learningGoals]);

    // Get completion percentage for active plan
    const planProgress = useMemo(() => {
        if (!activePlan) return 0;
        const totalTasks = activePlan.dailyTasks?.length || 0;
        const completedTasks = activePlan.dailyTasks?.filter(task => task.completed).length || 0;
        return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    }, [activePlan]);

    // Time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    if (!firebaseUser) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-20">
                    <RocketLaunchIcon className="w-16 h-16 text-[var(--color-muted-foreground)]/30 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">Welcome to LearnAI</h3>
                    <p className="text-[var(--color-muted-foreground)] mb-6">
                        Sign in to access your personalized learning dashboard
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Welcome Section */}
            <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-foreground)]">
                    {getGreeting()}, {firstName}! 👋
                </h1>
                <p className="text-lg text-[var(--color-muted-foreground)]">
                    Ready to continue your learning journey today?
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    icon={<BookOpenIcon className="w-6 h-6 text-blue-500" />}
                    label="Courses"
                    value={stats.totalCourses}
                    subtitle={`${stats.completedCourses} completed`}
                />
                <StatsCard
                    icon={<FireIcon className="w-6 h-6 text-orange-500" />}
                    label="Streak"
                    value={`${stats.currentStreak} days`}
                    subtitle="Keep it up!"
                />
                <StatsCard
                    icon={<TrophyIcon className="w-6 h-6 text-yellow-500" />}
                    label="XP Points"
                    value={stats.totalXP}
                    subtitle="Total earned"
                />
                <StatsCard
                    icon={<ChartBarIcon className="w-6 h-6 text-green-500" />}
                    label="Avg Score"
                    value={`${stats.averageScore}%`}
                    subtitle="This week"
                />
            </div>

            {/* Current Learning Plan */}
            {activePlan && (
                <div className="bg-[var(--color-card)] rounded-2xl p-6 border border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <CalendarDaysIcon className="w-6 h-6 text-[var(--color-primary)]" />
                            <h2 className="text-xl font-bold text-[var(--color-foreground)]">Current Learning Plan</h2>
                        </div>
                        <span className="text-sm text-[var(--color-muted-foreground)]">
                            {Math.round(planProgress)}% Complete
                        </span>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-[var(--color-foreground)] mb-2">{activePlan.title}</h3>
                            <p className="text-[var(--color-muted-foreground)] text-sm mb-3">{activePlan.description}</p>
                            <ProgressBar progress={planProgress} className="h-2" />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-[var(--color-muted-foreground)]">
                                {activePlan.duration} day plan • {activePlan.status}
                            </span>
                            <button className="flex items-center gap-2 text-[var(--color-primary)] font-medium text-sm hover:opacity-80">
                                Continue Learning <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Today's Goals */}
            {todaysGoals.length > 0 && (
                <div className="bg-[var(--color-card)] rounded-2xl p-6 border border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <CheckCircleIcon className="w-6 h-6 text-green-500" />
                            <h2 className="text-xl font-bold text-[var(--color-foreground)]">Today's Goals</h2>
                        </div>
                        <span className="text-sm text-[var(--color-muted-foreground)]">
                            {todaysGoals.length} remaining
                        </span>
                    </div>
                    <div className="space-y-3">
                        {todaysGoals.map((goal) => (
                            <div key={goal.id} className="flex items-center gap-3 p-3 bg-[var(--color-secondary)] rounded-lg">
                                <div className="w-4 h-4 rounded-full border-2 border-[var(--color-primary)]"></div>
                                <span className="flex-1 text-[var(--color-foreground)]">{goal.title}</span>
                                <PlayIcon className="w-4 h-4 text-[var(--color-muted-foreground)]" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Continue Learning Section */}
            {recentCourses.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Continue Learning</h2>
                        <button className="flex items-center gap-2 text-[var(--color-primary)] font-medium hover:opacity-80">
                            View All <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {recentCourses.map((course) => (
                            <ProjectStyleCourseCard
                                key={course.id}
                                course={course}
                                onClick={() => handleSelectCourse(course.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-[var(--color-card)] rounded-2xl p-6 border border-[var(--color-border)]">
                <div className="flex items-center gap-3 mb-4">
                    <SparklesIcon className="w-6 h-6 text-[var(--color-primary)]" />
                    <h2 className="text-xl font-bold text-[var(--color-foreground)]">Quick Actions</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="flex flex-col items-center gap-2 p-4 bg-[var(--color-secondary)] rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors">
                        <PlusIcon className="w-6 h-6 text-[var(--color-primary)]" />
                        <span className="text-sm font-medium text-[var(--color-foreground)]">New Course</span>
                    </button>
                    
                    <button className="flex flex-col items-center gap-2 p-4 bg-[var(--color-secondary)] rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors">
                        <AcademicCapIcon className="w-6 h-6 text-blue-500" />
                        <span className="text-sm font-medium text-[var(--color-foreground)]">Take Quiz</span>
                    </button>
                    
                    <button className="flex flex-col items-center gap-2 p-4 bg-[var(--color-secondary)] rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors">
                        <CalendarDaysIcon className="w-6 h-6 text-green-500" />
                        <span className="text-sm font-medium text-[var(--color-foreground)]">Plan Learning</span>
                    </button>
                    
                    <button className="flex flex-col items-center gap-2 p-4 bg-[var(--color-secondary)] rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors">
                        <CubeIcon className="w-6 h-6 text-purple-500" />
                        <span className="text-sm font-medium text-[var(--color-foreground)]">Practice</span>
                    </button>
                </div>
            </div>

            {/* Learning Insights */}
            <div className="bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 rounded-2xl p-6 border border-[var(--color-border)]">
                <div className="flex items-center gap-3 mb-4">
                    <ChartBarIcon className="w-6 h-6 text-[var(--color-primary)]" />
                    <h2 className="text-xl font-bold text-[var(--color-foreground)]">Learning Insights</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[var(--color-foreground)] mb-1">
                            {Math.round(stats.totalLearningTime / 60)}h
                        </div>
                        <div className="text-sm text-[var(--color-muted-foreground)]">Total Learning Time</div>
                    </div>
                    
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[var(--color-foreground)] mb-1">
                            {stats.weeklyGoalsCompleted}
                        </div>
                        <div className="text-sm text-[var(--color-muted-foreground)]">Goals This Week</div>
                    </div>
                    
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[var(--color-foreground)] mb-1">
                            {courses.length + articles.length}
                        </div>
                        <div className="text-sm text-[var(--color-muted-foreground)]">Total Content</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalizedDashboard;
