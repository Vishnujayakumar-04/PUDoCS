/**
 * Create Firebase Auth accounts for M.Tech CSE students
 * Common password: pass@123
 * Email format: 25mtcsepy0003@pondiuni.ac.in (lowercase)
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
    console.log('✅ Firebase Admin initialized\n');
} catch (error) {
    console.error('❌ Error: serviceAccountKey.json not found');
    console.log('\n📋 Steps to get service account key:');
    console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
    console.log('2. Click "Generate new private key"');
    console.log('3. Save as serviceAccountKey.json in project root\n');
    process.exit(1);
}

// M.Tech CSE Students
const STUDENTS = [
    { name: 'P OM SHIVA', registerNumber: '25MTCSEPY0003' },
    { name: 'SNEKHA S', registerNumber: '25MTCSEPY0004' },
    { name: 'MOHANAPRIYA M', registerNumber: '25MTCSEPY0005' },
    { name: 'S KRISHNA PRANIL', registerNumber: '25MTCSEPY0006' },
    { name: 'P REETHU JOYCEY', registerNumber: '25MTCSEPY0007' },
    { name: 'CHINTHAKINDI BHANU', registerNumber: '25MTCSEPY0008' },
    { name: 'CHINTHA HASA SRI', registerNumber: '25MTCSEPY0009' },
    { name: 'ANUJITH BALAN', registerNumber: '25MTCSEPY0010' },
    { name: 'ASHMI C L', registerNumber: '25MTCSEPY0011' },
    { name: 'VISWANATH M', registerNumber: '25MTCSEPY0013' },
    { name: 'M NANTHAKUMAR', registerNumber: '25MTCSEPY0014' },
    { name: 'VISHNU VARDHAN P', registerNumber: '25MTCSEPY0016' },
    { name: 'YOUGAARAJ R', registerNumber: '25MTCSEPY0017' },
    { name: 'DHINESH G', registerNumber: '25MTCSEPY0018' },
    { name: 'ABISHEK S', registerNumber: '25MTCSEPY0019' },
    { name: 'ANBIRKAVIN A', registerNumber: '25MTCSEPY0020' },
];

const COMMON_PASSWORD = 'pass@123';

async function createUsers() {
    console.log('🔐 Creating Firebase Auth users for M.Tech CSE 1st Year students...');
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
            console.log(`[${i + 1}/${STUDENTS.length}] ${student.name} (${student.registerNumber.toLowerCase()}@pondiuni.ac.in)...`);
            
            const email = `${student.registerNumber.toLowerCase()}@pondiuni.ac.in`;
            
            // Create user with plain text password
            const userRecord = await admin.auth().createUser({
                email: email,
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
                email: email,
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
                email: email,
                registerNumber: student.registerNumber,
                uid: userRecord.uid
            });
            
        } catch (error) {
            if (error.code === 'auth/email-already-exists') {
                console.log(`   ℹ️ Already exists\n`);
                results.alreadyExists.push({
                    name: student.name,
                    email: `${student.registerNumber.toLowerCase()}@pondiuni.ac.in`,
                    registerNumber: student.registerNumber
                });
            } else {
                console.error(`   ❌ Error: ${error.message}\n`);
                results.errors.push({
                    name: student.name,
                    email: `${student.registerNumber.toLowerCase()}@pondiuni.ac.in`,
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

