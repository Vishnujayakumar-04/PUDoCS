import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';

const createTestCR = async () => {
    const email = "cr.mca1@pondiuni.ac.in";
    const password = "Pass@123";

    console.log("Starting CR Account Creation...");

    let uid;
    try {
        // 1. Try to login to get UID
        console.log("Attempting to login to retrieve UID...");
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
        console.log("Logged in. UID:", uid);
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            console.log("User not found in Auth, creating new one...");
            try {
                const newUser = await createUserWithEmailAndPassword(auth, email, password);
                uid = newUser.user.uid;
                console.log("Created new Auth user. UID:", uid);
            } catch (createError) {
                console.error("Failed to create user:", createError);
                throw createError;
            }
        } else {
            console.error("Login failed:", error);
            throw error;
        }
    }

    if (!uid) {
        throw new Error("Could not obtain UID.");
    }

    // 2. Create/Update Firestore Profile
    console.log("Creating/Updating Firestore Profile...");
    const crProfile = {
        uid: uid,
        name: "Test Class Rep",
        email: email,
        role: "cr",
        program: "MCA",
        year: 1,
        assignedClass: "MCA-1",
        section: "A",
        createdAt: new Date().toISOString()
    };

    try {
        // 1. Write to 'users' (Router Rule Requirement)
        await setDoc(doc(db, 'users', uid), crProfile);
        console.log("Written to 'users' collection.");

        // 2. Write to 'crs' (Profile Data)
        await setDoc(doc(db, 'crs', uid), crProfile);
        console.log("Written to 'crs' collection.");

        console.log("✅ Success! CR account ready.");

    } catch (dbError) {
        console.error("Firestore write failed:", dbError);
        throw dbError;
    }
};

export default createTestCR;
