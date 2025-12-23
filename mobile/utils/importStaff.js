/**
 * Import Staff Utility
 * Removes old staff data and adds new staff to the 'staff' collection
 * Also updates the 'users' collection for authentication
 */

import { db } from '../services/firebaseConfig';
import { collection, doc, getDocs, deleteDoc, setDoc } from 'firebase/firestore';
import { STAFF_LIST, formatStaffData } from './staffList';

/**
 * Remove all existing staff from the 'staff' collection
 */
export const cleanupStaff = async () => {
    try {
        console.log('🧹 Cleaning up old staff data...');
        const staffCollection = collection(db, 'staff');
        const staffSnapshot = await getDocs(staffCollection);
        
        const deletePromises = staffSnapshot.docs.map(async (docSnap) => {
            try {
                await deleteDoc(doc(db, 'staff', docSnap.id));
                console.log(`  ✅ Deleted: ${docSnap.id}`);
            } catch (error) {
                console.error(`  ❌ Failed to delete ${docSnap.id}:`, error);
            }
        });
        
        await Promise.all(deletePromises);
        console.log(`✅ Cleanup complete. Deleted ${staffSnapshot.docs.length} staff records.`);
        
        return {
            success: true,
            deleted: staffSnapshot.docs.length,
        };
    } catch (error) {
        console.error('❌ Error during staff cleanup:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Import all 19 staff members to the 'staff' collection
 * Also creates/updates Firebase Auth accounts and 'users' collection
 */
export const importStaff = async () => {
    const results = {
        success: 0,
        failed: 0,
        errors: [],
        details: [],
    };

    console.log(`🚀 Starting import of ${STAFF_LIST.length} staff members...`);

    // First, cleanup old staff data
    const cleanupResult = await cleanupStaff();
    if (!cleanupResult.success) {
        console.warn('⚠️ Cleanup had issues, but continuing with import...');
    }

    // Import each staff member
    for (let i = 0; i < STAFF_LIST.length; i++) {
        const staff = STAFF_LIST[i];
        try {
            const email = staff.email.toLowerCase().trim();
            console.log(`[${i + 1}/${STAFF_LIST.length}] Processing: ${staff.name} (${email})...`);

            // Format staff data
            const staffData = formatStaffData(staff);

            // Use the provided UID (Firebase Auth accounts already exist)
            const staffUid = staff.uid;

            // 1. Save to 'staff' collection (using email as document ID for easy lookup)
            const staffDocRef = doc(db, 'staff', email);
            await setDoc(staffDocRef, {
                ...staffData,
                uid: staffUid,
            }, { merge: true });
            console.log(`  ✅ Saved to 'staff' collection`);

            // 2. Update 'users' collection (for authentication)
            const userDocRef = doc(db, 'users', staffUid);
            await setDoc(userDocRef, {
                ...staffData,
                uid: staffUid,
            }, { merge: true });
            console.log(`  ✅ Updated 'users' collection`);

            results.success++;
            results.details.push({
                name: staff.name,
                email: email,
                status: 'success',
            });

            console.log(`✅ [${i + 1}/${STAFF_LIST.length}] Successfully imported: ${staff.name}`);

            // Small delay to avoid rate limiting
            if (i < STAFF_LIST.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } catch (error) {
            results.failed++;
            results.errors.push({
                name: staff.name,
                email: staff.email,
                error: error.message,
            });
            console.error(`❌ [${i + 1}/${STAFF_LIST.length}] Failed to import ${staff.name}:`, error.message);
        }
    }

    console.log(`\n📊 Staff Import Summary:`);
    console.log(`  ✅ Success: ${results.success}`);
    console.log(`  ❌ Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
        console.log(`\n❌ Errors:`);
        results.errors.forEach(err => {
            console.log(`  - ${err.name} (${err.email}): ${err.error}`);
        });
    }

    return results;
};

/**
 * Get all staff from the 'staff' collection
 */
export const getAllStaff = async () => {
    try {
        const staffCollection = collection(db, 'staff');
        const staffSnapshot = await getDocs(staffCollection);
        
        return staffSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error fetching staff:', error);
        return [];
    }
};

