import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL - Update this with your backend URL
const API_BASE_URL = 'https://pudocs-demo-server.loca.lt/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true', // Required for localtunnel to bypass landing page
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage
            await AsyncStorage.multiRemove(['token', 'user', 'role']);
        }
        return Promise.reject(error);
    }
);

export default api;
