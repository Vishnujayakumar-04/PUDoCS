import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

        // 2. Fetch User Role from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        let userData;

        if (!userDoc.exists()) {
            console.log("User document missing. Auto-creating profile for manually added user.");
            // Auto-create the profile using the role the user selected on the previous screen
            userData = {
                uid: user.uid,
                email: email,
                role: role || 'Student', // Fallback to Student if undefined
                isActive: true,
                createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, userData);
        } else {
            userData = userDoc.data();
        }

        // 3. Store Session
        await storeSession(user, userData.role);

        return {
            user: user,
            role: userData.role,
            profile: userData
        };
    } catch (error) {
        throw error;
    }
};

export const registerUser = async (email, password, role, additionalData = {}) => {
    try {
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Create User Document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: email,
            role: role,
            isActive: true,
            createdAt: new Date().toISOString(),
            ...additionalData
        });

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

// Export as an object for backward compatibility if needed, 
// but we will mainly use named exports.
export const authService = {
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    getStoredUser: checkAuthStatus
};
