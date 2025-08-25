-- user_profiles keyed by Firebase UID (text)
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT '{"theme": "light", "notifications": true, "language": "en"}'::jsonb
);

CREATE TABLE IF NOT EXISTS user_data (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES user_profiles(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('course_progress', 'achievements', 'notes', 'favorites', 'preferences')),
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_courses (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES user_profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  progress JSONB DEFAULT '{"completed_lessons": [], "current_lesson": null, "score": 0}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Plans Table
CREATE TABLE IF NOT EXISTS user_learning_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  duration INTEGER NOT NULL, -- days
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  folder_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Tasks for Learning Plans
CREATE TABLE IF NOT EXISTS user_daily_tasks (
  id TEXT PRIMARY KEY,
  plan_id TEXT REFERENCES user_learning_plans(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES user_profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  task_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Goals (like daily quests but more structured)
CREATE TABLE IF NOT EXISTS user_learning_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  goal_type TEXT DEFAULT 'custom' CHECK (goal_type IN ('daily', 'weekly', 'monthly', 'custom')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_type ON user_data(data_type);
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_plans_user_id ON user_learning_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_tasks_plan_id ON user_daily_tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_tasks_user_id ON user_daily_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_tasks_date ON user_daily_tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_user_learning_goals_user_id ON user_learning_goals(user_id);

-- Disable RLS for simplicity (Firebase Auth only on client)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_goals DISABLE ROW LEVEL SECURITY;

-- RLS policies removed

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_data_updated_at BEFORE UPDATE ON user_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_learning_plans_updated_at BEFORE UPDATE ON user_learning_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_daily_tasks_updated_at BEFORE UPDATE ON user_daily_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_learning_goals_updated_at BEFORE UPDATE ON user_learning_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
