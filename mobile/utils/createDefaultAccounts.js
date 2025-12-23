// Utility script to create default Staff and Office accounts
// Run this once to set up default admin accounts

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';

/**
 * Create default Staff and Office accounts
 * 
 * Default Credentials:
 * Staff: staff@pondiuni.ac.in / Staff@123
 * Office: office@pondiuni.ac.in / Office@123
 */
export const createDefaultAccounts = async () => {
    const defaultAccounts = [
        {
            email: 'staff@pondiuni.ac.in',
            password: 'Staff@123',
            role: 'Staff',
            name: 'Staff Account',
        },
        {
            email: 'office@pondiuni.ac.in',
            password: 'Office@123',
            role: 'Office',
            name: 'Office Account',
        },
    ];

    const results = [];
    const errors = [];

    for (const account of defaultAccounts) {
        try {
            console.log(`Creating ${account.role} account: ${account.email}...`);
            
            // Create Firebase Auth account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                account.email,
                account.password
            );
            
            // Create user document in Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                uid: userCredential.user.uid,
                email: account.email,
                role: account.role,
                name: account.name,
                isActive: true,
                createdAt: new Date().toISOString(),
            });
            
            results.push({
                email: account.email,
                role: account.role,
                status: 'success',
            });
            
            console.log(`✅ Created ${account.role} account: ${account.email}`);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log(`⚠️ Account ${account.email} already exists`);
                results.push({
                    email: account.email,
                    role: account.role,
                    status: 'already_exists',
                });
            } else {
                errors.push({
                    email: account.email,
                    role: account.role,
                    error: error.message,
                });
                console.error(`❌ Failed to create ${account.role} account: ${error.message}`);
            }
        }
    }

    return {
        success: results.length,
        failed: errors.length,
        results,
        errors,
    };
};

/**
 * Display default account credentials
 */
export const getDefaultCredentials = () => {
    return {
        staff: {
            email: 'staff@pondiuni.ac.in',
            password: 'Staff@123',
            role: 'Staff',
        },
        office: {
            email: 'office@pondiuni.ac.in',
            password: 'Office@123',
            role: 'Office',
        },
    };
};

