import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
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
