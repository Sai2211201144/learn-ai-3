import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, signInWithGoogle, signOutUser } from '../services/firebase';
import { 
  upsertUserProfile, 
  getUserProfile, 
  UserProfile, 
  getUserLearningPlans,
  createLearningPlan,
  updateLearningPlan,
  deleteLearningPlan,
  UserLearningPlan,
  getDailyTasksForPlan,
  createDailyTask,
  updateDailyTask,
  deleteDailyTask,
  UserDailyTask,
  getUserLearningGoals,
  createLearningGoal,
  updateLearningGoal,
  deleteLearningGoal,
  UserLearningGoal
} from '../services/supabase';

interface FirebaseAuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  
  // Learning Plans
  learningPlans: UserLearningPlan[];
  activePlan: UserLearningPlan | null;
  createUserLearningPlan: (title: string, duration: number, folderId?: string) => Promise<UserLearningPlan>;
  updateUserLearningPlan: (planId: string, updates: Partial<UserLearningPlan>) => Promise<void>;
  deleteUserLearningPlan: (planId: string) => Promise<void>;
  setActivePlan: (planId: string | null) => void;
  
  // Daily Tasks
  dailyTasks: UserDailyTask[];
  createUserDailyTask: (planId: string, courseId: string, taskDate: string) => Promise<UserDailyTask>;
  updateUserDailyTask: (taskId: string, updates: Partial<UserDailyTask>) => Promise<void>;
  deleteUserDailyTask: (taskId: string) => Promise<void>;
  
  // Learning Goals
  learningGoals: UserLearningGoal[];
  createUserLearningGoal: (title: string, description?: string, targetDate?: string, goalType?: UserLearningGoal['goal_type']) => Promise<UserLearningGoal>;
  updateUserLearningGoal: (goalId: string, updates: Partial<UserLearningGoal>) => Promise<void>;
  deleteUserLearningGoal: (goalId: string) => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Learning Plan State
  const [learningPlans, setLearningPlans] = useState<UserLearningPlan[]>([]);
  const [activePlan, setActivePlanState] = useState<UserLearningPlan | null>(null);
  const [dailyTasks, setDailyTasks] = useState<UserDailyTask[]>([]);
  const [learningGoals, setLearningGoals] = useState<UserLearningGoal[]>([]);

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        try {
          const saved = await upsertUserProfile({
            id: u.uid,
            email: u.email || '',
            full_name: u.displayName || '',
            avatar_url: u.photoURL,
            preferences: { theme: 'light', notifications: true, language: 'en' },
          });
          setProfile(saved);
          
          // Load user's learning data
          const [plans, goals] = await Promise.all([
            getUserLearningPlans(u.uid),
            getUserLearningGoals(u.uid)
          ]);
          
          setLearningPlans(plans);
          setLearningGoals(goals);
          
          // Set active plan to the first active one
          const activePlanCandidate = plans.find(p => p.status === 'active');
          if (activePlanCandidate) {
            setActivePlanState(activePlanCandidate);
            // Load tasks for active plan
            const tasks = await getDailyTasksForPlan(activePlanCandidate.id);
            setDailyTasks(tasks);
          }
        } catch (e) {
          console.error('Failed to load user data', e);
        }
      } else {
        setProfile(null);
        setLearningPlans([]);
        setActivePlanState(null);
        setDailyTasks([]);
        setLearningGoals([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async () => {
    await signInWithGoogle();
  };
  const logout = async () => {
    await signOutUser();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.uid || !profile) throw new Error('No user logged in');
    
    try {
      const updatedProfile = await upsertUserProfile({
        ...profile,
        ...updates,
        id: user.uid
      });
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  // Learning Plan Functions
  const createUserLearningPlan = async (title: string, duration: number, folderId?: string) => {
    if (!user?.uid) throw new Error('No user logged in');
    
    const newPlan = await createLearningPlan({
      id: `plan-${Date.now()}-${user.uid}`,
      user_id: user.uid,
      title,
      start_date: new Date().toISOString().split('T')[0],
      duration,
      status: 'active',
      folder_id: folderId || null
    });
    
    setLearningPlans(prev => [newPlan, ...prev]);
    return newPlan;
  };

  const updateUserLearningPlan = async (planId: string, updates: Partial<UserLearningPlan>) => {
    const updatedPlan = await updateLearningPlan(planId, updates);
    setLearningPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p));
    if (activePlan?.id === planId) {
      setActivePlanState(updatedPlan);
    }
  };

  const deleteUserLearningPlan = async (planId: string) => {
    await deleteLearningPlan(planId);
    setLearningPlans(prev => prev.filter(p => p.id !== planId));
    if (activePlan?.id === planId) {
      setActivePlanState(null);
      setDailyTasks([]);
    }
  };

  const setActivePlan = async (planId: string | null) => {
    if (planId) {
      const plan = learningPlans.find(p => p.id === planId);
      if (plan) {
        setActivePlanState(plan);
        const tasks = await getDailyTasksForPlan(planId);
        setDailyTasks(tasks);
      }
    } else {
      setActivePlanState(null);
      setDailyTasks([]);
    }
  };

  // Daily Task Functions
  const createUserDailyTask = async (planId: string, courseId: string, taskDate: string) => {
    if (!user?.uid) throw new Error('No user logged in');
    
    const newTask = await createDailyTask({
      id: `task-${Date.now()}-${user.uid}`,
      plan_id: planId,
      user_id: user.uid,
      course_id: courseId,
      task_date: taskDate,
      is_completed: false
    });
    
    setDailyTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateUserDailyTask = async (taskId: string, updates: Partial<UserDailyTask>) => {
    const updatedTask = await updateDailyTask(taskId, updates);
    setDailyTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
  };

  const deleteUserDailyTask = async (taskId: string) => {
    await deleteDailyTask(taskId);
    setDailyTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Learning Goal Functions
  const createUserLearningGoal = async (title: string, description?: string, targetDate?: string, goalType: UserLearningGoal['goal_type'] = 'custom') => {
    if (!user?.uid) throw new Error('No user logged in');
    
    const newGoal = await createLearningGoal({
      id: `goal-${Date.now()}-${user.uid}`,
      user_id: user.uid,
      title,
      description: description || null,
      target_date: targetDate || null,
      is_completed: false,
      goal_type: goalType,
      metadata: {}
    });
    
    setLearningGoals(prev => [newGoal, ...prev]);
    return newGoal;
  };

  const updateUserLearningGoal = async (goalId: string, updates: Partial<UserLearningGoal>) => {
    const updatedGoal = await updateLearningGoal(goalId, updates);
    setLearningGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
  };

  const deleteUserLearningGoal = async (goalId: string) => {
    await deleteLearningGoal(goalId);
    setLearningGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const value = useMemo(() => ({ 
    user, 
    profile, 
    loading, 
    login, 
    logout, 
    updateProfile,
    learningPlans,
    activePlan,
    createUserLearningPlan,
    updateUserLearningPlan,
    deleteUserLearningPlan,
    setActivePlan,
    dailyTasks,
    createUserDailyTask,
    updateUserDailyTask,
    deleteUserDailyTask,
    learningGoals,
    createUserLearningGoal,
    updateUserLearningGoal,
    deleteUserLearningGoal
  }), [user, profile, loading, learningPlans, activePlan, dailyTasks, learningGoals]);

  return <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>;
};

export const useFirebaseAuth = () => {
  const ctx = useContext(FirebaseAuthContext);
  if (!ctx) throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  return ctx;
};
