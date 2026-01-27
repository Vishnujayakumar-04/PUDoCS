// web/src/services/mockAuth.js
import { db, getDocs, query, collection, where } from './mockFirebase';

const AUTH_KEY = 'MOCK_AUTH_USER_SESSION';

export const auth = { type: 'mock' };

export const signInWithEmailAndPassword = async (authObj, email, password) => {
    console.log(`[MockAuth] Signing in: ${email}`);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 500));

    // Basic Validation
    if (!email || !password) throw new Error("Missing credentials");

    // "Password Check" (In mock, we accept 'Pass@123' or 'Parent@123' or 'Office@123' or 'Staff@123')
    // Or just accept anything for ease of use?
    // User requested "turn into local storage". 
    // Let's implement a simple check.

    // Get user from Mock DB
    const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        throw { code: 'auth/user-not-found', message: 'User not found in Mock DB.' };
    }

    const userData = snapshot.docs[0].data();

    // Create session
    const authUser = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.name
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));

    // Trigger listeners (simple window event for cross-component sync if needed, or rely on reload)
    // For now, simpler: Just return credential.
    return {
        user: authUser
    };
};

export const signOut = async (authObj) => {
    localStorage.removeItem(AUTH_KEY);
    console.log("[MockAuth] Signed out");
};

export const onAuthStateChanged = (authObj, callback) => {
    // Check initial
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
        callback(JSON.parse(stored));
    } else {
        callback(null);
    }

    // Mock unsubscribe
    return () => { };
};

// Also export createUser for compatibility with old scripts (though they shouldn't run)
export const createUserWithEmailAndPassword = async (authObj, email, password) => {
    console.warn("Create User called in Mock Mode. Creating simple entry.");
    const uid = 'user_' + Date.now();
    const authUser = { uid, email };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    return { user: authUser };
};

export const updatePassword = async () => true;
export const reauthenticateWithCredential = async () => true;
export const EmailAuthProvider = { credential: () => ({}) };
