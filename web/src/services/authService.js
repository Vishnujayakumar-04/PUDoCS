import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth, db } from "./firebaseConfig";



// Helper function to find user document by email in a collection
const findUserByEmail = async (collectionName, email) => {
    try {
        const q = query(collection(db, collectionName), where("email", "==", email.toLowerCase()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0];
        }
    } catch (error) {
        console.warn(`Error querying ${collectionName} by email:`, error);
    }
    return null;
};

export const loginUser = async (email, password, role) => {
    try {
        // 1. Firebase Auth Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid;

        console.log(`[Auth] User authenticated: ${uid}. Checking 'users' router...`);

        // 2. Strict Router Pattern Check (users/{uid})
        // The 'users' collection is the SOURCE OF TRUTH for Role and Profile location.
        const userRouterRef = doc(db, 'users', uid);
        const userRouterSnap = await getDoc(userRouterRef);

        if (!userRouterSnap.exists()) {
            console.error(`[Auth] Access Denied. No router document in 'users/${uid}'.`);
            await signOut(auth); // Access Denied
            throw new Error(`Access Denied: Your account is not properly configured. Please contact the office.`);
        }

        const routerData = userRouterSnap.data();
        const dbRole = routerData.role;

        // 3. Role Validation
        if (role && dbRole.toLowerCase() !== role.toLowerCase() && role !== 'Office') {
            // For strict parity, we warn but prioritize DB Role unless blocked by logic
            console.warn(`[Auth] Role Mismatch. DB: ${dbRole}, Requested: ${role}`);
            if (dbRole !== 'Office' && role !== dbRole) {
                // Option: Throw error if strict role matching is desired on login screen
            }
        }

        console.log(`[Auth] Router Verified. Role: ${dbRole}. Fetching Profile...`);

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

        // 5. Update Local Session
        const session = {
            uid: uid,
            email: user.email,
            role: dbRole,
            name: finalUserData.name || user.displayName || 'User',
            profile: finalUserData
        };

        localStorage.setItem('pudocs_session', JSON.stringify(session));
        return { user, role: dbRole, profile: finalUserData };

    } catch (error) {
        console.error("Login Error:", error.message);
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('pudocs_session');
    } catch (error) {
        console.error("Logout error:", error);
    }
};

export const checkAuthStatus = () => {
    try {
        const sessionStr = localStorage.getItem('pudocs_session');
        if (sessionStr) {
            return JSON.parse(sessionStr);
        }
        return null; // Return null if session is invalid or missing
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
