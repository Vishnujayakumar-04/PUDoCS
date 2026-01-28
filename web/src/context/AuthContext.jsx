import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const storedUser = authService.getStoredUser();
            if (storedUser) {
                setUser(storedUser);
                setRole(storedUser.role);
                setIsAuthenticated(true);

                // Trigger Background Sync on App Launch
                triggerSync(storedUser);
            }
        } catch (error) {
            console.error('Auth check error:', error);
        } finally {
            setLoading(false);
        }
    };

    const triggerSync = (userData) => {
        // Map role to primary collection to sync first
        const collections = ['users'];
        if (userData.role === 'Student') collections.push('students');
        else if (userData.role === 'Staff') collections.push('staff', 'students'); // Staff needs student list
        else if (userData.role === 'Office') collections.push('staff', 'students', 'parents');

        // Run sync (Fire & Forget for UI speed, but logs errors)
        import('../services/syncEngine').then(({ syncEngine }) => {
            syncEngine.runFullSync(userData.uid, collections);
        });
    };

    const login = async (email, password, selectedRole) => {
        try {
            const data = await authService.login(email, password, selectedRole);
            setUser(data.user);
            setRole(data.role);
            setIsAuthenticated(true);

            // Trigger Sync
            triggerSync({ uid: data.user.uid, role: data.role });

            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            setRole(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const value = {
        user,
        role,
        loading,
        isAuthenticated,
        login,
        logout,
        userProfile: user?.profile || null // Helper for components
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
