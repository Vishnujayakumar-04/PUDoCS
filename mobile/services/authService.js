import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to store session locally
const storeSession = async (user, role, profile) => {
    try {
        const session = {
            uid: user.uid,
            email: user.email,
            role: role,
            name: profile?.name || user.displayName || 'User',
            profile: profile
        };
        await AsyncStorage.setItem('pudocs_session', JSON.stringify(session));
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
        const uid = user.uid;

        console.log(`[MobileAuth] User authenticated: ${uid}. Checking 'users' router...`);

        // 2. Strict Router Pattern Check (users/{uid})
        // The 'users' collection is the SOURCE OF TRUTH for Role and Profile location.
        const userRouterRef = doc(db, 'users', uid);
        const userRouterSnap = await getDoc(userRouterRef);

        if (!userRouterSnap.exists()) {
            console.error(`[MobileAuth] Access Denied. No router document in 'users/${uid}'.`);
            await signOut(auth); // Access Denied
            throw new Error(`Access Denied: Your account is not properly configured. Please contact the office.`);
        }

        const routerData = userRouterSnap.data();
        const dbRole = routerData.role;

        // 3. Role Validation
        if (role && dbRole.toLowerCase() !== role.toLowerCase() && role !== 'Office') {
            console.warn(`[MobileAuth] Role Mismatch. DB: ${dbRole}, Requested: ${role}`);
            // Logic parity: We allow it but log warning, mirroring Web.
        }

        console.log(`[MobileAuth] Router Verified. Role: ${dbRole}. Fetching Profile...`);

        // 4. Fetch Actual Profile Data
        let profileData = null;
        let collectionName = '';

        if (dbRole === 'Student') collectionName = 'students';
        else if (dbRole === 'Staff' || dbRole === 'Office') collectionName = 'staff';
        else if (dbRole === 'Parent') collectionName = 'parents';
        else if (dbRole === 'cr') collectionName = 'crs';

        if (collectionName) {
            const profileRef = doc(db, collectionName, uid);
            const profileSnap = await getDoc(profileRef);

            if (profileSnap.exists()) {
                profileData = { id: profileSnap.id, ...profileSnap.data() };
            }
        }

        const finalUserData = {
            ...routerData,
            ...profileData,
            uid,
            role: dbRole
        };

        // 5. Store Session
        await storeSession(user, dbRole, finalUserData);

        return {
            user: user,
            role: dbRole,
            profile: finalUserData
        };

    } catch (error) {
        console.error("Login verification failed:", error.message);
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        await AsyncStorage.removeItem('pudocs_session'); // Standardized key
    } catch (error) {
        console.error("Logout error:", error);
    }
};

export const checkAuthStatus = async () => {
    try {
        const sessionStr = await AsyncStorage.getItem('pudocs_session'); // Standardized key
        if (sessionStr) {
            return JSON.parse(sessionStr);
        }
        return null; // Return null if session is invalid or missing
    } catch (error) {
        return null;
    }
};

// Change password function
export const changePassword = async (currentPassword, newPassword) => {
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

