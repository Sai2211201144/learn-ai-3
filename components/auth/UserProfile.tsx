import React from 'react';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';

export const UserProfile: React.FC = () => {
  const { user, profile, logout } = useFirebaseAuth();
  if (!user || !profile) return null;
  return (
    <div className="p-4 border rounded-md bg-white text-gray-800 max-w-md">
      <div className="flex items-center gap-3">
        <img src={user.photoURL || ''} alt="" className="w-12 h-12 rounded-full" />
        <div>
          <div className="font-semibold">{profile.full_name || user.displayName}</div>
          <div className="text-sm text-gray-600">{profile.email || user.email}</div>
        </div>
      </div>
      <button onClick={() => logout()} className="mt-3 px-3 py-2 rounded bg-red-600 text-white">Sign out</button>
    </div>
  );
};
