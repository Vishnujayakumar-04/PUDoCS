/**
 * Alternative: Create users using Firebase Admin SDK
 * This is MUCH easier than CLI import for NEW users
 * 
 * Prerequisites:
 * 1. npm install firebase-admin
 * 2. Get serviceAccountKey.json from Firebase Console
 * 
 * Usage:
 * node scripts/createUsersWithPlainPasswords.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
    const serviceAccount = require('../serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized\n');
} catch (error) {
    console.error('❌ Error: serviceAccountKey.json not found');
    console.log('\n📋 Steps to get service account key:');
    console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
    console.log('2. Click "Generate new private key"');
    console.log('3. Save as serviceAccountKey.json in project root\n');
    process.exit(1);
}

// M.Tech DS Students
const STUDENTS = [
    { name: 'Durgadevi', registerNumber: '25MTNISPY0002', email: '25mtnispy0002@pondiuni.ac.in' },
    { name: 'Vijayadamodaran N', registerNumber: '25MTNISPY0003', email: '25mtnispy0003@pondiuni.ac.in' },
    { name: 'Rachakonda Sagar', registerNumber: '25MTNISPY0004', email: '25mtnispy0004@pondiuni.ac.in' },
    { name: 'Ayesetty Jaswanth Sai Raj', registerNumber: '25MTNISPY0005', email: '25mtnispy0005@pondiuni.ac.in' },
    { name: 'Davinsi Ragamalika M', registerNumber: '25MTNISPY0006', email: '25mtnispy0006@pondiuni.ac.in' },
    { name: 'Naveenraj N', registerNumber: '25MTNISPY0007', email: '25mtnispy0007@pondiuni.ac.in' },
    { name: 'Gokulakannan C', registerNumber: '25MTNISPY0008', email: '25mtnispy0008@pondiuni.ac.in' },
    { name: 'Santhosh V', registerNumber: '25MTNISPY0009', email: '25mtnispy0009@pondiuni.ac.in' },
    { name: 'Anandhakumar P', registerNumber: '25MTNISPY0010', email: '25mtnispy0010@pondiuni.ac.in' },
    { name: 'Monika K', registerNumber: '25MTNISPY0011', email: '25mtnispy0011@pondiuni.ac.in' },
    { name: 'Preethi Ravi', registerNumber: '25MTNISPY0012', email: '25mtnispy0012@pondiuni.ac.in' },
    { name: 'Asvina S', registerNumber: '25MTNISPY0013', email: '25mtnispy0013@pondiuni.ac.in' },
    { name: 'Lagudu Yernaidu', registerNumber: '25MTNISPY0014', email: '25mtnispy0014@pondiuni.ac.in' },
    { name: 'Akash J', registerNumber: '25MTNISPY0015', email: '25mtnispy0015@pondiuni.ac.in' },
    { name: 'Harish S', registerNumber: '25MTNISPY0017', email: '25mtnispy0017@pondiuni.ac.in' },
    { name: 'Eashwar R', registerNumber: '25MTNISPY0018', email: '25mtnispy0018@pondiuni.ac.in' },
    { name: 'Harshath K', registerNumber: '25MTNISPY0019', email: '25mtnispy0019@pondiuni.ac.in' },
    { name: 'Kishore Chakkaravarthi M N', registerNumber: '25MTNISPY0020', email: '25mtnispy0020@pondiuni.ac.in' },
    { name: 'Arun', registerNumber: '25MTNISPY0023', email: '25mtnispy0023@pondiuni.ac.in' },
    { name: 'Agilan A', registerNumber: '25MTNISPY0024', email: '25mtnispy0024@pondiuni.ac.in' },
    { name: 'Praveena', registerNumber: '25MTNISPY0025', email: '25mtnispy0025@pondiuni.ac.in' },
    { name: 'Sivaprrasath S J', registerNumber: '25MTNISPY0026', email: '25mtnispy0026@pondiuni.ac.in' },
];

const COMMON_PASSWORD = 'pass@123';

async function createUsers() {
    console.log('🔐 Creating Firebase Auth users for M.Tech DS students...');
    console.log(`📋 Total students: ${STUDENTS.length}`);
    console.log(`🔑 Password: ${COMMON_PASSWORD}\n`);
    
    const results = {
        created: [],
        alreadyExists: [],
        errors: []
    };
    
    for (let i = 0; i < STUDENTS.length; i++) {
        const student = STUDENTS[i];
        try {
            console.log(`[${i + 1}/${STUDENTS.length}] ${student.name} (${student.email})...`);
            
            // Create user with plain text password (Admin SDK supports this!)
            const userRecord = await admin.auth().createUser({
                email: student.email,
                password: COMMON_PASSWORD,
                emailVerified: false,
                disabled: false,
                displayName: student.name,
            });
            
            console.log(`   ✅ Created (UID: ${userRecord.uid})`);
            
            // Create user document in Firestore
            const db = admin.firestore();
            await db.collection('users').doc(userRecord.uid).set({
                uid: userRecord.uid,
                email: student.email,
                role: 'Student',
                registerNumber: student.registerNumber,
                name: student.name,
                isActive: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            
            console.log(`   ✅ Firestore document created\n`);
            
            results.created.push({
                name: student.name,
                email: student.email,
                registerNumber: student.registerNumber,
                uid: userRecord.uid
            });
            
        } catch (error) {
            if (error.code === 'auth/email-already-exists') {
                console.log(`   ℹ️ Already exists\n`);
                results.alreadyExists.push({
                    name: student.name,
                    email: student.email,
                    registerNumber: student.registerNumber
                });
            } else {
                console.error(`   ❌ Error: ${error.message}\n`);
                results.errors.push({
                    name: student.name,
                    email: student.email,
                    registerNumber: student.registerNumber,
                    error: error.message
                });
            }
        }
        
        // Small delay to avoid rate limiting
        if (i < STUDENTS.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    // Summary
    console.log('═'.repeat(50));
    console.log('📊 SUMMARY');
    console.log('═'.repeat(50));
    console.log(`✅ Created: ${results.created.length}`);
    console.log(`ℹ️  Already exists: ${results.alreadyExists.length}`);
    console.log(`❌ Errors: ${results.errors.length}`);
    console.log('═'.repeat(50));
    
    if (results.created.length > 0) {
        console.log('\n✅ Successfully created:');
        results.created.forEach((user, idx) => {
            console.log(`   ${idx + 1}. ${user.name} - ${user.email}`);
        });
    }
    
    if (results.alreadyExists.length > 0) {
        console.log('\nℹ️  Already exists (skipped):');
        results.alreadyExists.forEach((user, idx) => {
            console.log(`   ${idx + 1}. ${user.name} - ${user.email}`);
        });
    }
    
    if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach((err, idx) => {
            console.log(`   ${idx + 1}. ${err.name} (${err.email}): ${err.error}`);
        });
    }
    
    console.log('\n🎉 Script completed!\n');
    
    return results;
}

// Run
createUsers()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });

