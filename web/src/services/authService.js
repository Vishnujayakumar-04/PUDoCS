import { doc, getDoc, collection, query, where, getDocs } from "./mockFirebase";
import { signInWithEmailAndPassword, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "./mockAuth";
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
        const userEmail = user.email.toLowerCase();

        // 2. Determine correct collection based on selected role
        let collectionName = 'users';
        if (role === 'Student') collectionName = 'students';
        else if (role === 'Staff' || role === 'Office') collectionName = 'staff';
        else if (role === 'Parent') collectionName = 'parents';

        console.log(`Attempting login for role: ${role}, checking collection: ${collectionName}`);

        // 3. Fetch User Role from Firestore - Try multiple lookup strategies
        let userDocSnap = null;
        let userData = null;

        // Strategy 1: Try to find by UID in the role-specific collection
        try {
            const userDocRef = doc(db, collectionName, user.uid);
            userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                console.log(`Found user in ${collectionName} by UID`);
                userData = userDocSnap.data();
            }
        } catch (error) {
            console.warn(`Error reading from ${collectionName} by UID:`, error);
        }

        // Strategy 2: If not found by UID, try to find by email in the role-specific collection
        if (!userData) {
            console.log(`Trying to find user in ${collectionName} by email...`);
            const emailDoc = await findUserByEmail(collectionName, userEmail);
            if (emailDoc) {
                console.log(`Found user in ${collectionName} by email`);
                userData = emailDoc.data();
            }
        }

        // Strategy 3: Try to find in 'users' collection by UID
        if (!userData) {
            console.log("Trying 'users' collection by UID...");
            try {
                const usersDocRef = doc(db, 'users', user.uid);
                const usersDocSnap = await getDoc(usersDocRef);
                if (usersDocSnap.exists()) {
                    const usersData = usersDocSnap.data();
                    // Verify the role matches what they selected
                    if (usersData.role === role ||
                        (role === 'Staff' && usersData.role === 'Staff') ||
                        (role === 'Office' && (usersData.role === 'Office' || usersData.role === 'Admin'))) {
                        console.log(`Found user in 'users' collection by UID`);
                        userData = usersData;
                    }
                }
            } catch (error) {
                console.warn("Error reading from 'users' by UID:", error);
            }
        }

        // Strategy 4: Try to find in 'users' collection by email
        if (!userData) {
            console.log("Trying 'users' collection by email...");
            const usersEmailDoc = await findUserByEmail('users', userEmail);
            if (usersEmailDoc) {
                const usersData = usersEmailDoc.data();
                // Verify the role matches what they selected
                if (usersData.role === role ||
                    (role === 'Staff' && usersData.role === 'Staff') ||
                    (role === 'Office' && (usersData.role === 'Office' || usersData.role === 'Admin'))) {
                    console.log(`Found user in 'users' collection by email`);
                    userData = usersData;
                }
            }
        }

        // If after all attempts we still don't have user data, sign out and throw error
        if (!userData) {
            await signOut(auth);
            throw new Error(`Access Denied: Your account was not found in the ${role} database. Please ensure you have selected the correct role.`);
        }

        // Derive role from database or use selected role
        const derivedRole = userData.role || role;

        // 4. Store Session
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
