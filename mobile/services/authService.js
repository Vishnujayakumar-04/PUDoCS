import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
    // Login
    login: async (email, password, role) => {
        try {
            const response = await api.post('/auth/login', { email, password, role });
            const { token, ...userData } = response.data;

            // Store token and user data
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('role', role);

            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Register (for demo purposes)
    register: async (email, password, role, profileData) => {
        try {
            const response = await api.post('/auth/register', {
                email,
                password,
                role,
                profileData,
            });
            const { token, ...userData } = response.data;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('role', role);

            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Verify token
    verifyToken: async () => {
        try {
            const response = await api.get('/auth/verify');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Logout
    logout: async () => {
        await AsyncStorage.multiRemove(['token', 'user', 'role']);
    },

    // Get stored user data
    getStoredUser: async () => {
        const user = await AsyncStorage.getItem('user');
        const role = await AsyncStorage.getItem('role');
        return user ? { ...JSON.parse(user), role } : null;
    },

    // Check if user is authenticated
    isAuthenticated: async () => {
        const token = await AsyncStorage.getItem('token');
        return !!token;
    },
};
