// Utility to create or reset a single staff account
// This can be called from the Office Dashboard to fix individual accounts

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import staffData from '../data/staffData';

/**
 * Create or reset a single staff account
 * @param {string} email - Staff email
 * @param {string} password - Password (default: Pass@123)
 */
export const createOrResetStaffAccount = async (email, password = 'Pass@123') => {
    try {
        const emailLower = email.toLowerCase().trim();
        
        // Find staff in staffData
        const staff = staffData.find(s => s.email.toLowerCase().trim() === emailLower);
        
        if (!staff) {
            throw new Error(`Staff not found in staffData for email: ${email}`);
        }

        console.log(`🔧 Creating/resetting account for: ${staff.name} (${emailLower})...`);

        // First, try to sign in to check if account exists and password is correct
        try {
            await signInWithEmailAndPassword(auth, emailLower, password);
            // If sign in succeeds, account exists with correct password
            console.log(`✅ Account ${emailLower} exists with correct password`);
            
            // Update Firestore document
            const usersQuery = query(
                collection(db, 'users'),
                where('email', '==', emailLower)
            );
            const querySnapshot = await getDocs(usersQuery);
            
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                await setDoc(doc(db, 'users', userDoc.id), {
                    ...userDoc.data(),
                    role: 'Staff',
                    name: staff.name,
                    designation: staff.designation,
                    department: staff.department,
                    contact: staff.contact,
                    subjectsHandled: staff.subjectsHandled || [],
                    courseCoordinator: staff.courseCoordinator || null,
                    imageKey: staff.imageKey,
                    isActive: true,
                }, { merge: true });
            }
            
            // Sign out after checking
            await auth.signOut();
            
            return { 
                success: true, 
                message: 'Account already exists with correct password. Firestore updated.', 
                action: 'verified'
            };
        } catch (signInError) {
            // If sign in fails, try to create account
            if (signInError.code === 'auth/user-not-found') {
                // Account doesn't exist, create it
                try {
                    const userCredential = await createUserWithEmailAndPassword(
                        auth,
                        emailLower,
                        password
                    );
                    
                    // Create user document in Firestore
                    await setDoc(doc(db, 'users', userCredential.user.uid), {
                        uid: userCredential.user.uid,
                        email: emailLower,
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
                    
                    console.log(`✅ Created new account for: ${staff.name}`);
                    return { success: true, message: 'Account created successfully!', action: 'created' };
                } catch (createError) {
                    throw createError;
                }
            } else if (signInError.code === 'auth/wrong-password' || signInError.code === 'auth/invalid-credential') {
                // Account exists but password is wrong
                return { 
                    success: false, 
                    message: `Account exists but password is incorrect.\n\nSOLUTION:\n\nOption 1 - Reset Password:\n1. Go to Firebase Console → Authentication → Users\n2. Find ${emailLower}\n3. Click on the user\n4. Click "Reset Password"\n5. Set password to: Pass@123\n6. Save\n\nOption 2 - Delete and Recreate:\n1. Delete the account from Firebase Console\n2. Use "Create 19 Staff Accounts" button to recreate\n\nAfter fixing, staff can login with:\nEmail: ${emailLower}\nPassword: Pass@123`, 
                    action: 'password_mismatch',
                    requiresDeletion: true,
                    requiresPasswordReset: true
                };
            } else if (signInError.code === 'auth/email-already-in-use') {
                // This shouldn't happen after user-not-found check, but handle it
                return { 
                    success: false, 
                    message: 'Account exists but could not verify password. Please delete from Firebase Console and recreate.', 
                    action: 'error',
                    requiresDeletion: true
                };
            } else {
                throw signInError;
            }
        }
    } catch (error) {
        console.error(`❌ Error:`, error);
        return { 
            success: false, 
            message: error.message || 'Failed to create/reset account',
            action: 'error'
        };
    }
};

/**
 * Create account for Krishnapriya specifically
 */
export const createKrishnapriyaAccount = async () => {
    return await createOrResetStaffAccount('krishnapriya.csc@pondiuni.ac.in', 'Pass@123');
};

