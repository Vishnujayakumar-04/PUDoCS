import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth, db } from "./firebaseConfig";

// Helper to store session locally
const storeSession = (user, role) => {
    try {
        const session = {
            uid: user.uid,
            email: user.email,
            role: role,
        };
        localStorage.setItem('userSession', JSON.stringify(session));
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
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            // Log out if no Firestore record exists for this UID
            await signOut(auth);
            throw new Error('Access Denied: No user record found in Firestore.');
        }

        const userData = userDocSnap.data();
        const derivedRole = userData.role;

        // 3. Store Session
        storeSession(user, derivedRole);

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
        localStorage.removeItem('userSession');
    } catch (error) {
        console.error("Logout error:", error);
    }
};

export const checkAuthStatus = () => {
    try {
        const sessionStr = localStorage.getItem('userSession');
        if (sessionStr) {
            return JSON.parse(sessionStr);
        }
        return null;
    } catch (error) {
        return null;
    }
};

export const changePassword = async (currentPassword, newPassword) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);

        return { success: true };
    } catch (error) {
        throw error;
    }
};

export const authService = {
    login: loginUser,
    logout: logoutUser,
    getStoredUser: checkAuthStatus,
    changePassword: changePassword
};
