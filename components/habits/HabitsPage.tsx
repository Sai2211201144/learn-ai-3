import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Habit } from '../../types';
import { SparklesIcon, FireIcon, TrashIcon, CheckCircleIcon, PlusIcon } from '../common/Icons';

// --- Helper Functions ---

const getYYYYMMDD = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const calculateStreak = (history: Record<string, boolean>): number => {
    let streak = 0;
    const currentDate = new Date();
    
    // If not completed today, start checking from yesterday.
    if (!history[getYYYYMMDD(currentDate)]) {
        currentDate.setDate(currentDate.getDate() - 1);
    }

    while (true) {
        const dateStr = getYYYYMMDD(currentDate);
        if (history[dateStr]) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break; // Streak is broken
        }
    }
    return streak;
};


// --- Sub Components ---

const HabitCard: React.FC<{ habit: Habit }> = ({ habit }) => {
    const { handleToggleHabitCompletion, handleDeleteHabit } = useAppContext();
    
    const streak = useMemo(() => calculateStreak(habit.history), [habit.history]);
    
    const todayStr = getYYYYMMDD(new Date());
    const isCompletedToday = !!habit.history[todayStr];

    const handleTodayCheck = () => {
        handleToggleHabitCompletion(habit.id, todayStr);
    };

    const renderHeatmap = () => {
        const cells = [];
        const today = new Date();
        // Generate cells for the last 35 days (5 weeks)
        for (let i = 34; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = getYYYYMMDD(date);
            const isCompleted = habit.history[dateStr];
            cells.push(
                <div 
                    key={dateStr}
                    title={`${dateStr}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                    className={`w-4 h-4 rounded-sm ${isCompleted ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-secondary-hover)]'}`}
                />
            );
        }
        return <div className="grid grid-cols-7 gap-1.5">{cells}</div>;
    };

    return (
        <div className="bg-[var(--color-card)] p-4 rounded-xl border border-[var(--color-border)] flex flex-col md:flex-row items-start gap-4">
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-[var(--color-foreground)]">{habit.title}</h3>
                    <div className="flex items-center gap-2 text-orange-400">
                        <FireIcon className="w-5 h-5" />
                        <span className="font-bold text-lg">{streak}</span>
                    </div>
                </div>
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-[var(--color-muted-foreground)] mb-2">Last 5 Weeks</h4>
                    {renderHeatmap()}
                </div>
            </div>
            <div className="w-full md:w-auto flex md:flex-col items-center gap-2 flex-shrink-0">
                <button
                    onClick={handleTodayCheck}
                    className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors border-2 ${isCompletedToday ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-[var(--color-secondary)] text-[var(--color-foreground)] border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}
                >
                    {isCompletedToday ? <CheckCircleIcon className="w-5 h-5"/> : <div className="w-5 h-5 border-2 border-current rounded-full"></div>}
                    {isCompletedToday ? 'Completed!' : 'Complete Today'}
                </button>
                 <button onClick={() => handleDeleteHabit(habit.id)} className="p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10 rounded-full">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

// --- Main Page Component ---

const HabitsPage: React.FC = () => {
    const { localUser, handleAddHabit } = useAppContext();
    const [newHabitTitle, setNewHabitTitle] = useState('');

    const handleAddClick = () => {
        if (newHabitTitle.trim()) {
            handleAddHabit(newHabitTitle.trim());
            setNewHabitTitle('');
        }
    };
    
    return (
        <div className="w-full max-w-5xl animate-fade-in-up">
            <header className="pb-6 border-b border-[var(--color-border)] mb-8">
                <h1 className="text-4xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                    <SparklesIcon className="w-10 h-10 text-[var(--color-primary)]" />
                    Habit Builder
                </h1>
                <p className="text-lg text-[var(--color-muted-foreground)] mt-2">
                    Track your learning habits, build streaks, and view your progress over time.
                </p>
            </header>

            <div className="bg-[var(--color-card)] p-4 rounded-xl border border-[var(--color-border)] mb-8">
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={newHabitTitle}
                        onChange={(e) => setNewHabitTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
                        placeholder="e.g., 'Code for 30 minutes'"
                        className="w-full flex-grow px-4 py-2 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                    <button
                        onClick={handleAddClick}
                        disabled={!newHabitTitle.trim()}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
                    >
                        <PlusIcon className="w-5 h-5"/>
                        Add Habit
                    </button>
                </div>
            </div>
            
            <div className="space-y-4">
                {localUser.habits.length > 0 ? (
                    localUser.habits.map(habit => <HabitCard key={habit.id} habit={habit} />)
                ) : (
                    <div className="text-center py-20 px-6 bg-[var(--color-secondary)] border-2 border-dashed border-[var(--color-border)] rounded-xl">
                        <h3 className="text-xl font-semibold text-[var(--color-foreground)]">No habits yet!</h3>
                        <p className="text-[var(--color-muted-foreground)] mt-2">
                            Add your first learning habit above to start building a streak.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HabitsPage;
