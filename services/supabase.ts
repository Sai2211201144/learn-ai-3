import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  (import.meta as any).env.VITE_SUPABASE_URL as string,
  (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string
);

export type UserProfile = {
  id: string; // Firebase UID
  email: string;
  full_name: string;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
  preferences?: { theme?: 'light' | 'dark'; notifications?: boolean; language?: string } | null;
};

export const upsertUserProfile = async (profile: UserProfile) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profile, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) throw error;
  return data as UserProfile;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    throw error;
  }
  return data as UserProfile | null;
};

// Learning Plans Interface
export interface UserLearningPlan {
  id: string;
  user_id: string;
  title: string;
  start_date: string;
  duration: number;
  status: 'active' | 'completed' | 'paused' | 'archived';
  folder_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserDailyTask {
  id: string;
  plan_id: string;
  user_id: string;
  course_id: string;
  task_date: string;
  is_completed: boolean;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserLearningGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  target_date?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
  goal_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

// Learning Plan Functions
export const createLearningPlan = async (plan: Omit<UserLearningPlan, 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('user_learning_plans')
    .insert(plan)
    .select('*')
    .single();
  if (error) throw error;
  return data as UserLearningPlan;
};

export const getUserLearningPlans = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_learning_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as UserLearningPlan[];
};

export const updateLearningPlan = async (planId: string, updates: Partial<UserLearningPlan>) => {
  const { data, error } = await supabase
    .from('user_learning_plans')
    .update(updates)
    .eq('id', planId)
    .select('*')
    .single();
  if (error) throw error;
  return data as UserLearningPlan;
};

export const deleteLearningPlan = async (planId: string) => {
  const { error } = await supabase
    .from('user_learning_plans')
    .delete()
    .eq('id', planId);
  if (error) throw error;
};

// Daily Task Functions
export const createDailyTask = async (task: Omit<UserDailyTask, 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('user_daily_tasks')
    .insert(task)
    .select('*')
    .single();
  if (error) throw error;
  return data as UserDailyTask;
};

export const getDailyTasksForPlan = async (planId: string) => {
  const { data, error } = await supabase
    .from('user_daily_tasks')
    .select('*')
    .eq('plan_id', planId)
    .order('task_date', { ascending: true });
  if (error) throw error;
  return data as UserDailyTask[];
};

export const updateDailyTask = async (taskId: string, updates: Partial<UserDailyTask>) => {
  const { data, error } = await supabase
    .from('user_daily_tasks')
    .update(updates)
    .eq('id', taskId)
    .select('*')
    .single();
  if (error) throw error;
  return data as UserDailyTask;
};

export const deleteDailyTask = async (taskId: string) => {
  const { error } = await supabase
    .from('user_daily_tasks')
    .delete()
    .eq('id', taskId);
  if (error) throw error;
};

// Learning Goal Functions
export const createLearningGoal = async (goal: Omit<UserLearningGoal, 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('user_learning_goals')
    .insert(goal)
    .select('*')
    .single();
  if (error) throw error;
  return data as UserLearningGoal;
};

export const getUserLearningGoals = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_learning_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as UserLearningGoal[];
};

export const updateLearningGoal = async (goalId: string, updates: Partial<UserLearningGoal>) => {
  const { data, error } = await supabase
    .from('user_learning_goals')
    .update(updates)
    .eq('id', goalId)
    .select('*')
    .single();
  if (error) throw error;
  return data as UserLearningGoal;
};

export const deleteLearningGoal = async (goalId: string) => {
  const { error } = await supabase
    .from('user_learning_goals')
    .delete()
    .eq('id', goalId);
  if (error) throw error;
};
