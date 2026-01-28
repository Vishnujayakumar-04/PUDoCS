
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import { MSC_CS_1ST_YEAR_STUDENTS, formatMscCS1stYearStudentData } from './mscCS1stYearStudentList';
import { getStudentCollectionName } from './collectionMapper';

export const createStudentAccounts = async () => {
    const defaultPassword = 'Pass@123'; // Default password for initial login
    const results = [];
    const errors = [];

    console.log("🚀 Starting Student Account Creation...");

    // Process students
    for (let i = 0; i < MSC_CS_1ST_YEAR_STUDENTS.length; i++) {
        const rawStudent = MSC_CS_1ST_YEAR_STUDENTS[i];
        const student = formatMscCS1stYearStudentData(rawStudent.registerNumber, rawStudent.name);

        try {
            const email = student.email.toLowerCase().trim();
            let uid;
            let status = 'created';

            // 1. Create or Get Auth User
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, defaultPassword);
                uid = userCredential.user.uid;
            } catch (authError) {
                if (authError.code === 'auth/email-already-in-use') {
                    // Try login to get UID if user exists
                    try {
                        const userCredential = await signInWithEmailAndPassword(auth, email, defaultPassword);
                        uid = userCredential.user.uid;
                        status = 'updated';
                    } catch (loginError) {
                        throw new Error(`User exists but login failed: ${loginError.message}`);
                    }
                } else {
                    throw authError;
                }
            }

            // 2. Determine Collection
            const collectionName = getStudentCollectionName(
                student.course,
                student.program,
                student.year
            );

            // 3. Create Router Document (users/{uid})
            await setDoc(doc(db, 'users', uid), {
                uid: uid,
                email: email,
                role: 'Student',
                name: student.name,
                registerNumber: student.registerNumber,
                profileRef: `${collectionName}/${uid}`,
                isActive: true,
                createdAt: new Date().toISOString()
            }, { merge: true });

            // 4. Create Profile Document (students_.../{uid})
            // IMPORTANT: We use UID as Document ID to match authService expectations
            await setDoc(doc(db, collectionName, uid), {
                id: uid, // redundancy
                ...student,
                // Ensure registerNumber is indexed/searchable
            }, { merge: true });

            // 5. Also create/update Global 'students' collection entry for Directory lookups if needed?
            // The directory service usually queries global 'students' or iterates partitions.
            // If strict partitioning is used, we might not need global.
            // But 'SystemSetup' Alignment aligned 'students'. 
            // Let's write to global 'students' using UID as key too, for safety/legacy.
            await setDoc(doc(db, 'students', uid), {
                id: uid,
                ...student,
                profileRef: `${collectionName}/${uid}`
            }, { merge: true });

            console.log(`[${i + 1}/${MSC_CS_1ST_YEAR_STUDENTS.length}] ${status === 'created' ? '✅' : '🔄'} ${student.registerNumber} - ${student.name}`);
            results.push({ registerNumber: student.registerNumber, name: student.name, status });

            // Rate limiting to prevent auth spamming
            if (i < MSC_CS_1ST_YEAR_STUDENTS.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }

        } catch (error) {
            console.error(`❌ Failed ${student.registerNumber}:`, error.message);
            errors.push({ registerNumber: rawStudent.registerNumber, name: rawStudent.name, error: error.message });
        }
    }

    return {
        success: results.length,
        failed: errors.length,
        results,
        errors,
    };
};

export default createStudentAccounts;
