import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import { staffData } from '../data/staffData';

export const createStaffAccounts = async () => {
    const defaultPassword = 'Pass@123';
    const results = [];
    const errors = [];

    for (let i = 0; i < staffData.length; i++) {
        const staff = staffData[i];
        try {
            const email = staff.email.toLowerCase().trim();
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, defaultPassword);

                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    uid: userCredential.user.uid,
                    email: email,
                    role: 'Staff',
                    name: staff.name,
                    designation: staff.designation,
                    department: staff.department,
                    contact: staff.contact,
                    subjectsHandled: staff.subjectsHandled || [],
                    courseCoordinator: staff.courseCoordinator || null,
                    imageKey: staff.imageKey,
                    isActive: true,
                    passwordChanged: false,
                    createdAt: new Date().toISOString(),
                });

                results.push({ email, name: staff.name, status: 'success' });
            } catch (authError) {
                if (authError.code === 'auth/email-already-in-use') {
                    results.push({ email, name: staff.name, status: 'already_exists' });
                } else {
                    throw authError;
                }
            }

            if (i < staffData.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        } catch (error) {
            errors.push({ email: staff.email, name: staff.name, error: error.message });
        }
    }

    return {
        success: results.length,
        failed: errors.length,
        results,
        errors,
    };
};
