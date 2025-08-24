import React from 'react';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';

export const GoogleLoginButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { login, loading } = useFirebaseAuth() as any;
  return (
    <button
      onClick={() => login()}
      disabled={loading}
      className={`px-4 py-2 rounded-md border bg-white text-black shadow-lg hover:shadow-xl border-gray-300 ${className}`}
    >
      Sign in with Google
    </button>
  );
};
