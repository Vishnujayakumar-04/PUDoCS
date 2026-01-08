/**
 * Script to create Firebase Auth users using Firebase Admin SDK
 * 
 * Prerequisites:
 * 1. Install Firebase Admin SDK: npm install firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Place service account key in project root as 'serviceAccountKey.json'
 * 
 * Usage:
 * node scripts/createFirebaseAuthUsers.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
try {
    const serviceAccount = require('../serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
} catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    console.log('\n📋 Please ensure:');
    console.log('1. serviceAccountKey.json exists in project root');
    console.log('2. Firebase Admin SDK is installed: npm install firebase-admin');
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

async function createAuthUsers() {
    console.log('🔐 Creating Firebase Auth users for M.Tech DS students...\n');
    
    const results = {
        created: [],
        alreadyExists: [],
        errors: []
    };
    
    for (const student of STUDENTS) {
        try {
            console.log(`Processing: ${student.name} (${student.email})...`);
            
            // Create user in Firebase Auth
            const userRecord = await admin.auth().createUser({
                email: student.email,
                password: COMMON_PASSWORD,
                emailVerified: false,
                disabled: false,
            });
            
            console.log(`✅ Created: ${student.email} (UID: ${userRecord.uid})`);
            
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
            
            console.log(`✅ User document created in Firestore`);
            
            results.created.push({
                name: student.name,
                email: student.email,
                registerNumber: student.registerNumber,
                uid: userRecord.uid
            });
            
        } catch (error) {
            if (error.code === 'auth/email-already-exists') {
                console.log(`ℹ️ Already exists: ${student.email}`);
                results.alreadyExists.push({
                    name: student.name,
                    email: student.email,
                    registerNumber: student.registerNumber
                });
            } else {
                console.error(`❌ Error: ${error.message}`);
                results.errors.push({
                    name: student.name,
                    email: student.email,
                    registerNumber: student.registerNumber,
                    error: error.message
                });
            }
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`✅ Created: ${results.created.length}`);
    console.log(`ℹ️ Already exists: ${results.alreadyExists.length}`);
    console.log(`❌ Errors: ${results.errors.length}`);
    
    if (results.created.length > 0) {
        console.log('\n✅ Successfully created:');
        results.created.forEach(user => {
            console.log(`  - ${user.name} (${user.email})`);
        });
    }
    
    if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(err => {
            console.log(`  - ${err.name} (${err.email}): ${err.error}`);
        });
    }
    
    return results;
}

// Run the script
createAuthUsers()
    .then(() => {
        console.log('\n🎉 Script completed!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });

