// Update existing staff accounts with their Firestore documents
// These accounts already exist in Firebase Auth with UIDs

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import staffData from '../data/staffData';

// Staff accounts with their Firebase Auth UIDs
const STAFF_ACCOUNTS_WITH_UIDS = [
    { name: 'Dr. R. Subramanian', email: 'rsubramanian.csc@pondiuni.ac.in', uid: 'LaCFcdzzlfVTV7aQBq10RmATR962' },
    { name: 'Dr. T. Chithralekha', email: 'tchithralekha.csc@pondiuni.ac.in', uid: 'QbycWm2pAeRh6m1hikh1fTRMEcm2' },
    { name: 'Dr. S. Sivasathya', email: 'ssivasathya.csc@pondiuni.ac.in', uid: 'bjbTINTWCKdwZBOsf4x795CPM7J2' },
    { name: 'Dr. S. K. V. Jayakumar', email: 'head.csc@pondiuni.ac.in', uid: 'AQAyKIo3CTWGxUGBcsmRcNaNeK02' },
    { name: 'Dr. K. Suresh Joseph', email: 'ksureshjoseph.csc@pondiuni.ac.in', uid: 'bqyyL7oKF2grQY2ByK4iQnWyn9a2' },
    { name: 'Dr. S. Ravi', email: 'sravi.csc@pondiuni.ac.in', uid: '08Eo6sQGjMUNLqlXoedUvJKgxLE2' },
    { name: 'Dr. M. Nandhini', email: 'mnandhini.csc@pondiuni.ac.in', uid: 'G7ThTfwjgXQXtDeUMvt8VhzG3Vj2' },
    { name: 'Dr. Pothula Sujatha', email: 'psujatha.csc@pondiuni.ac.in', uid: 'yF2LwzcceaVvmdCnQhHDAo4AvkO2' },
    { name: 'Dr. P. Shanthi Bala', email: 'pshanthi.csc@pondiuni.ac.in', uid: '730SDajTUXZD4SYRJyYc3zqIl792' },
    { name: 'Dr. R. Sunitha', email: 'rsunitha.csc@pondiuni.ac.in', uid: 'XCaaiFHMmBZRbq6ybgRAfjraEki1' },
    { name: 'Dr. K. S. Kuppusamy', email: 'kskuppusamy.csc@pondiuni.ac.in', uid: 'GCKQctq2qqPPc9oDLrD3ePkVonq1' },
    { name: 'Dr. V. Uma', email: 'vuma.csc@pondiuni.ac.in', uid: 'YQ7tNqdGQKVEfhSQYAPt9MhtkWX2' },
    { name: 'Dr. T. Vengattaraman', email: 'tvengattaraman.csc@pondiuni.ac.in', uid: 'iXQaGdm2qqbJ7HaQe433wvuSzD42' },
    { name: 'R. P. Seenivasan', email: 'rpseenivasan.csc@pondiuni.ac.in', uid: '4aQmeR7TGSOVFPINAhrVYYVn8Qt2' },
    { name: 'Dr. T. Sivakumar', email: 'tsivakumar.csc@pondiuni.ac.in', uid: 'CDgpKYb2NsVYebbxeWz0shNkf9X2' },
    { name: 'Dr. M. Sathya', email: 'msathya.csc@pondiuni.ac.in', uid: 'LwB4M934wPcBK9oJIIxzcsHMBZe2' },
    { name: 'Dr. S. L. Jayalakshmi', email: 'sljayalakshmi.csc@pondiuni.ac.in', uid: 'TwJ8xqWQGmYghfA83gRZSScD9fy2' },
    { name: 'Dr. Krishnapriya', email: 'krishnapriya.csc@pondiuni.ac.in', uid: 'qY3oLx8luEW1qbWmyMWqA5nKEno1' },
    { name: 'Dr. Sukhvinder Singh', email: 'ssingh.csc@pondiuni.ac.in', uid: 'K6OEAt6c1rTlG9VxbizzPZhK8Bj2' },
];

/**
 * Update Firestore documents for existing staff accounts
 * This will create/update user documents with all staff details
 */
export const updateExistingStaffAccounts = async () => {
    const results = [];
    const errors = [];

    console.log(`🚀 Updating Firestore documents for ${STAFF_ACCOUNTS_WITH_UIDS.length} staff accounts...`);

    for (let i = 0; i < STAFF_ACCOUNTS_WITH_UIDS.length; i++) {
        const account = STAFF_ACCOUNTS_WITH_UIDS[i];
        try {
            const emailLower = account.email.toLowerCase().trim();
            
            // Find staff in staffData
            const staff = staffData.find(s => 
                s.email.toLowerCase().trim() === emailLower || 
                s.name === account.name
            );
            
            if (!staff) {
                console.warn(`⚠️ Staff not found in staffData for: ${account.name} (${emailLower})`);
                errors.push({
                    email: emailLower,
                    name: account.name,
                    error: 'Staff not found in staffData'
                });
                continue;
            }

            console.log(`[${i + 1}/${STAFF_ACCOUNTS_WITH_UIDS.length}] Updating: ${staff.name} (${emailLower})...`);
            
            // Update Firestore document using the UID
            await setDoc(doc(db, 'users', account.uid), {
                uid: account.uid,
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
            }, { merge: true });
            
            results.push({
                email: emailLower,
                name: staff.name,
                uid: account.uid,
                status: 'updated'
            });
            
            console.log(`✅ [${i + 1}/${STAFF_ACCOUNTS_WITH_UIDS.length}] Updated: ${staff.name}`);
        } catch (error) {
            errors.push({
                email: account.email,
                name: account.name,
                error: error.message
            });
            console.error(`❌ [${i + 1}/${STAFF_ACCOUNTS_WITH_UIDS.length}] Failed for ${account.name}: ${error.message}`);
        }
    }

    console.log(`\n📊 Update Summary:`);
    console.log(`  ✅ Success: ${results.length}`);
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

