
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';

const createTestOffice = async () => {
    const email = "office.csc@pondiuni.ac.in";
    const password = "Office@123";

    console.log("Starting Office Account Creation...");

    let uid;
    try {
        console.log("Creating Auth User...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log("User exists, logging in to get UID...");
            try {
                const cred = await signInWithEmailAndPassword(auth, email, password);
                uid = cred.user.uid;
            } catch (loginError) {
                console.error("Login failed for existing user:", loginError);
                throw loginError;
            }
        } else {
            console.error("Auth creation failed:", error);
            throw error;
        }
    }

    const officeProfile = {
        uid: uid,
        name: "Admin Office",
        email: email,
        role: "Office",
        designation: "Administrator",
        department: "Computer Science",
        createdAt: new Date().toISOString()
    };

    try {
        // Router Doc
        await setDoc(doc(db, 'users', uid), officeProfile);

        // Profile Data (Office users serve as Staff in DB for schema simplicity usually, or separate 'office' collection?)
        // based on authService.js: "if (dbRole === 'Staff' || dbRole === 'Office') collectionName = 'staff';"
        // So we write to 'staff'.
        await setDoc(doc(db, 'staff', uid), officeProfile);

        console.log("✅ Office Account Created Successfully.");
    } catch (e) {
        console.error("Firestore Write Failed:", e);
        throw e;
    }
};

export default createTestOffice;
