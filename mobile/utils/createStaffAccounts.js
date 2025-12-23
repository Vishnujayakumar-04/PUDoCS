// Utility script to create 19 staff accounts
// Run this once to set up all staff member accounts

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import staffData from '../data/staffData';

/**
 * Create all 19 staff accounts
 * 
 * Default Credentials for all:
 * Email: Their email from staffData
 * Password: Pass@123
 * 
 * After first login, they can change password in Profile section
 */
export const createStaffAccounts = async () => {
    const defaultPassword = 'Pass@123';
    const results = [];
    const errors = [];

    console.log(`🚀 Starting creation of ${staffData.length} staff accounts...`);

    for (let i = 0; i < staffData.length; i++) {
        const staff = staffData[i];
        try {
            const email = staff.email.toLowerCase().trim();
            console.log(`[${i + 1}/${staffData.length}] Creating account for: ${staff.name} (${email})...`);
            
            // Check if account already exists first
            try {
                // Try to create Firebase Auth account
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    defaultPassword
                );
                
                // Create user document in Firestore with staff details
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
                    passwordChanged: false, // Track if password has been changed
                    createdAt: new Date().toISOString(),
                });
                
                results.push({
                    email: email,
                    name: staff.name,
                    status: 'success',
                });
                
                console.log(`✅ [${i + 1}/${staffData.length}] Created account for: ${staff.name} (${email})`);
            } catch (authError) {
                if (authError.code === 'auth/email-already-in-use') {
                    console.log(`⚠️ [${i + 1}/${staffData.length}] Account ${email} already exists - skipping`);
                    results.push({
                        email: email,
                        name: staff.name,
                        status: 'already_exists',
                    });
                } else {
                    throw authError; // Re-throw if it's a different error
                }
            }
            
            // Small delay to avoid rate limiting
            if (i < staffData.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        } catch (error) {
            errors.push({
                email: staff.email,
                name: staff.name,
                error: error.message,
            });
            console.error(`❌ [${i + 1}/${staffData.length}] Failed to create account for ${staff.name}: ${error.message}`);
        }
    }

    console.log(`\n📊 Account Creation Summary:`);
    console.log(`  ✅ Success/Already Exists: ${results.length}`);
    console.log(`  ❌ Failed: ${errors.length}`);
    
    if (errors.length > 0) {
        console.log(`\n❌ Errors:`);
        errors.forEach(err => {
            console.log(`  - ${err.name} (${err.email}): ${err.error}`);
        });
    }

    return {
        success: results.length,
        failed: errors.length,
        results,
        errors,
    };
};

/**
 * Display staff account credentials
 */
export const getStaffCredentials = () => {
    return staffData.map(staff => ({
        name: staff.name,
        email: staff.email.toLowerCase().trim(),
        password: 'Pass@123',
        role: 'Staff',
    }));
};

