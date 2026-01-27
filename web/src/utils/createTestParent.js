import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../services/mockAuth';
import { doc, setDoc, getDocs, collection, query, where } from '../services/mockFirebase';
import { auth, db } from '../services/firebaseConfig';

const createTestParent = async () => {
    const parentEmail = "parent@pondiuni.ac.in";
    const parentPassword = "Parent@123";
    const studentRegisterNumber = "25MSCSCPY0001"; // Target student

    console.log("Starting Parent Account Creation...");

    try {
        // 1. Find Student
        console.log(`Looking for student with RegNo: ${studentRegisterNumber}...`);
        const q = query(collection(db, "students"), where("registerNumber", "==", studentRegisterNumber));
        const cx = await getDocs(q);

        if (cx.empty) {
            console.error("Student not found! Cannot link parent.");
            return;
        }

        const studentDoc = cx.docs[0];
        const studentId = studentDoc.id;
        console.log(`Found student: ${studentDoc.data().name} (ID: ${studentId})`);

        // 2. Create Auth User
        console.log("Creating Firebase Auth user...");
        let uid;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, parentEmail, parentPassword);
            uid = userCredential.user.uid;
            console.log("Auth user created with UID:", uid);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log("User already exists, attempting login to retrieve UID...");
                try {
                    const userCredential = await signInWithEmailAndPassword(auth, parentEmail, parentPassword);
                    uid = userCredential.user.uid;
                    console.log("Logged in existing user. UID:", uid);
                } catch (loginError) {
                    console.error("Could not login to existing account. Password might differ?", loginError);
                    alert("Account exists but login failed (wrong password?). Cannot fix profile.");
                    return;
                }
            } else {
                throw error;
            }
        }

        // 3. Create Parent Profile
        console.log("Creating Parent Profile in Firestore...");
        const parentData = {
            uid: uid,
            email: parentEmail,
            role: 'Parent',
            name: "Test Parent",
            linkedStudentId: studentId, // Linking to the student
            createdAt: new Date().toISOString()
        };

        // Write to 'parents' collection
        await setDoc(doc(db, 'parents', uid), parentData);
        // Also write to 'users' map for generic login role lookup if needed (though we updated login to check 'parents')
        await setDoc(doc(db, 'users', uid), parentData);

        console.log("✅ Success! Parent account created.");
        console.log(`Email: ${parentEmail}`);
        console.log(`Password: ${parentPassword}`);
        console.log(`Linked Student: ${studentDoc.data().name}`);

    } catch (error) {
        console.error("Failed:", error);
    }
};

// Execute if running in suitable environment (requires browser context usually for Firebase JS SDK)
// Since we are adding this to the project, the user can call it from a component or we can run it via node if we mock valid environment, 
// BUT this uses client SDK which requires browser or polyfills. 
// Recommend user to import and run this once, or run via a temporary UI button.

export default createTestParent;
