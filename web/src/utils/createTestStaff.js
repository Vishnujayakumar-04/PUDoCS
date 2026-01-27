import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../services/mockAuth';
import { doc, setDoc, getDocs, collection, query, where } from '../services/mockFirebase';
import { auth, db } from '../services/firebaseConfig';

const createTestStaff = async () => {
    const email = "krishnapriya.csc@pondiuni.ac.in";
    const password = "Pass@123";

    console.log("Starting Staff Account Fix...");

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

    // 2. Create/Overlap Firestore Profile
    console.log("Creating/Updating Firestore Profile...");
    const staffProfile = {
        uid: uid,
        name: "Dr. Krishnapriya",
        email: email,
        role: "Staff",
        designation: "Assistant Professor",
        department: "Computer Science",
        employeeId: "CSC018", // Dummy ID
        createdAt: new Date().toISOString()
    };

    try {
        // 1. Write to 'users' (mirror) FIRST to satisfy role checks in rules
        await setDoc(doc(db, 'users', uid), staffProfile);
        console.log("Written to 'users' collection.");

        // 2. Write to 'staff'
        await setDoc(doc(db, 'staff', uid), staffProfile);
        console.log("Written to 'staff' collection.");

        console.log("✅ Success! Staff account fixed.");

    } catch (dbError) {
        console.error("Firestore write failed:", dbError);
        throw dbError;
    }
};

export default createTestStaff;
