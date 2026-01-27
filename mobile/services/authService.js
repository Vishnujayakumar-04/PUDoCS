import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';

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

        // 2. STRICT: Fetch User Role from Firestore using UID
        let userDocRef = doc(db, 'users', user.uid);
        let userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            // Fallback: Check parents collection
            userDocRef = doc(db, 'parents', user.uid);
            userDocSnap = await getDoc(userDocRef);
        }

        if (!userDocSnap.exists()) {
            // Log out if no Firestore record exists for this UID
            await signOut(auth);
            throw new Error('Access Denied: No user record found in Firestore.');
        }

        const userData = userDocSnap.data();
        const derivedRole = userData.role;

        // 3. Store Session
        await storeSession(user, derivedRole);

        return {
            user: user,
            role: derivedRole,
            profile: userData
        };
    } catch (error) {
        console.error("Login verification failed:", error.message);
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

