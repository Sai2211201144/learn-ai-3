import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { User, AchievementId, LearningPlan } from '../types';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    login: (credential: string) => void;
    logout: () => void;
    updateUserStats: (stats: { xp?: number, level?: number, achievements?: AchievementId[], learningPlans?: LearningPlan[] }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('learnai-user-credential');
        setUser(null);
    }, []);

    const processCredential = useCallback((credential: string) => {
        try {
            const decoded: { name: string, email: string, picture: string, sub: string } = jwtDecode(credential);
            const userData: User = {
                id: decoded.sub,
                email: decoded.email,
                name: decoded.name,
                picture: decoded.picture,
                // These will be loaded from local storage specific to the user
                xp: 0,
                level: 1,
                achievements: [],
                articles: [],
                folders: [],
                learningPlans: [],
                habits: [],
            };
            setUser(userData);
            localStorage.setItem('learnai-user-credential', credential);
        } catch (error) {
            console.error("Failed to decode JWT or process user data", error);
            logout();
        }
    }, [logout]);
    
    useEffect(() => {
        const savedCredential = localStorage.getItem('learnai-user-credential');
        if (savedCredential) {
            processCredential(savedCredential);
        }
        setIsLoading(false);
    }, [processCredential]);

    const login = useCallback((credential: string) => {
        setIsLoading(true);
        processCredential(credential);
        setIsLoading(false);
    }, [processCredential]);
    
    const updateUserStats = useCallback((stats: { xp?: number; level?: number, achievements?: AchievementId[], learningPlans?: LearningPlan[] }) => {
        setUser(prev => prev ? { ...prev, ...stats } : null);
    }, []);

    const isAuthenticated = !!user;

    const value = useMemo(() => ({
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
        updateUserStats,
    }), [isAuthenticated, user, isLoading, login, logout, updateUserStats]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Helper for decoding, as direct import might not work in all module setups
const jwtDecodeHack = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};
