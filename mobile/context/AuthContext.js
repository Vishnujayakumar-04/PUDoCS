import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { syncEngine } from '../services/syncEngine';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is already logged in
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const storedUser = await authService.getStoredUser();
            if (storedUser) {
                setUser(storedUser);
                setRole(storedUser.role);
                setIsAuthenticated(true);
                // Trigger Background Sync
                syncEngine.runFullSync(storedUser.uid, storedUser.role).catch(err => console.log('Background Sync Error:', err));
            }
        } catch (error) {
            console.error('Auth check error:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password, selectedRole) => {
        try {
            // Role is now determined by the backend (Firestore) or passed for auto-creation
            const data = await authService.login(email, password, selectedRole);
            setUser(data.user);
            setRole(data.role);
            setIsAuthenticated(true);
            // Trigger Sync
            syncEngine.runFullSync(data.user.uid, data.role).catch(err => console.log('Login Sync Error:', err));
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

    const register = async (email, password, role) => {
        try {
            const data = await authService.register(email, password, role);
            setUser(data.user);
            setRole(data.role);
            setIsAuthenticated(true);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        role,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
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
