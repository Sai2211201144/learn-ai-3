import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, signInWithGoogle, signOutUser } from '../services/firebase';
import { upsertUserProfile, UserProfile } from '../services/supabase';

interface FirebaseAuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
        } catch (e) {
          console.error('Failed to upsert profile', e);
        }
      } else {
        setProfile(null);
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

  const value = useMemo(() => ({ user, profile, loading, login, logout }), [user, profile, loading]);

  return <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>;
};

export const useFirebaseAuth = () => {
  const ctx = useContext(FirebaseAuthContext);
  if (!ctx) throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  return ctx;
};
