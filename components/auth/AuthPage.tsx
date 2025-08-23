import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GOOGLE_CLIENT_ID } from './config';
import { AnimatedLearnAIIcon } from '../common/Icons';

declare const google: any;

const AuthPage: React.FC = () => {
    const { login } = useAuth();
    const googleButtonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof google === 'undefined' || !googleButtonRef.current) {
            return;
        }

        const handleCredentialResponse = (response: any) => {
            login(response.credential);
        };

        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse
        });

        google.accounts.id.renderButton(
            googleButtonRef.current,
            { theme: "outline", size: "large", type: "standard", shape: "pill", width: "300" }
        );

        // Optional: one-tap login prompt
        // google.accounts.id.prompt();

    }, [login]);

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col items-center justify-center p-4">
             <div className="w-full max-w-md text-center">
                <AnimatedLearnAIIcon className="w-24 h-24 text-[var(--color-primary)] mx-auto mb-6" />
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    Welcome to <span className="gradient-text">LearnAI</span>
                </h1>
                <p className="max-w-md mx-auto mt-6 text-base sm:text-lg text-[var(--color-muted-foreground)]">
                    Your personal AI learning companion. Sign in to begin generating courses and tracking your progress.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                    <div ref={googleButtonRef}></div>
                    {GOOGLE_CLIENT_ID.startsWith('YOUR') && (
                        <p className="text-xs text-yellow-500 max-w-xs">
                            Note: Google Sign-In is not configured. Please add your Client ID in `components/auth/config.ts`.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
