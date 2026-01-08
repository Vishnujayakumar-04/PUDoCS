import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "./firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { localDataService } from './localDataService';

// Helper to store session locally
const storeSession = async (user, role) => {
    try {
        const session = {
            uid: user.uid,
            email: user.email,
            role: role,
        };
        await AsyncStorage.setItem('userSession', JSON.stringify(session));
        return session;
    } catch (error) {
        console.error('Session storage error:', error);
    }
};

export const loginUser = async (email, password, role) => {
    try {
        // 1. Firebase Auth Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Determine User Role from Local Data or Storage
        let derivedRole = role; // Use provided role if available (e.g. from UI selection)
        let userData = null;

        // Check if Staff
        const staffProfile = localDataService.getStaffByEmail(email);
        if (staffProfile) {
            derivedRole = 'Staff';
            userData = { ...staffProfile, uid: user.uid, role: 'Staff' };
        }

        // Check if Student (if not Staff)
        if (!userData) {
            const studentProfile = localDataService.getStudentByEmail(email);
            if (studentProfile) {
                derivedRole = 'Student';
                userData = { ...studentProfile, uid: user.uid, role: 'Student' };
            }
        }

        // Check Local Storage for manually registered users
        if (!userData) {
            const storedProfiles = await AsyncStorage.getItem('local_users');
            if (storedProfiles) {
                const profiles = JSON.parse(storedProfiles);
                const localProfile = profiles.find(p => p.email === email);
                if (localProfile) {
                    derivedRole = localProfile.role;
                    userData = localProfile;
                }
            }
        }

        // Fallback or Default
        if (!userData) {
            console.log("User profile missing. Auto-creating profile locally.");
            derivedRole = derivedRole || 'Student';
            userData = {
                uid: user.uid,
                email: email,
                role: derivedRole,
                isActive: true,
                createdAt: new Date().toISOString()
            };
            // Save this new profile locally
            await saveLocalUser(userData);
        }

        // 3. Store Session
        await storeSession(user, derivedRole);

        return {
            user: user,
            role: derivedRole,
            profile: userData
        };
    } catch (error) {
        throw error;
    }
};

const saveLocalUser = async (userData) => {
    try {
        const storedProfiles = await AsyncStorage.getItem('local_users') || '[]';
        const profiles = JSON.parse(storedProfiles);
        const index = profiles.findIndex(p => p.email === userData.email);
        if (index >= 0) {
            profiles[index] = { ...profiles[index], ...userData };
        } else {
            profiles.push(userData);
        }
        await AsyncStorage.setItem('local_users', JSON.stringify(profiles));
    } catch (e) {
        console.error("Error saving local user:", e);
    }
};

export const registerUser = async (email, password, role, additionalData = {}) => {
    try {
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Create User Profile Locally
        const userData = {
            uid: user.uid,
            email: email,
            role: role,
            isActive: true,
            createdAt: new Date().toISOString(),
            ...additionalData
        };
        await saveLocalUser(userData);

        // 3. Store Session
        await storeSession(user, role);

        return { user, role };
    } catch (error) {
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        await AsyncStorage.removeItem('userSession');
    } catch (error) {
        console.error("Logout error:", error);
    }
};

export const checkAuthStatus = async () => {
    try {
        const sessionStr = await AsyncStorage.getItem('userSession');
        if (sessionStr) {
            return JSON.parse(sessionStr);
        }
        return null;
    } catch (error) {
        return null; // No session
    }
};

// Change password function
export const changePassword = async (currentPassword, newPassword, userId) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        // Re-authenticate user with current password
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, newPassword);

        // Update local flag 
        // We would ideally update 'local_users' here if we were strictly tracking it

        return { success: true };
    } catch (error) {
        throw error;
    }
};

// Export as an object for backward compatibility if needed, 
// but we will mainly use named exports.
export const authService = {
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    getStoredUser: checkAuthStatus,
    changePassword: changePassword
};

