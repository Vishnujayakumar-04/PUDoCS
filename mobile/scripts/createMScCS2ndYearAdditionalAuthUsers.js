/**
 * Create Firebase Auth accounts for Additional M.Sc CS 2nd Year students
 * Common password: pass@123
 * Email format: 21384101@pondiuni.ac.in
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

// Additional M.Sc CS 2nd Year Students
const STUDENTS = [
    { name: 'ABHINAND P S', registerNumber: '21384101' },
    { name: 'ANJANA V', registerNumber: '21384102' },
    { name: 'ATHIRA K', registerNumber: '21384104' },
    { name: 'DAWOOD HAIDER KHAN', registerNumber: '21384105' },
    { name: 'DEEKSHITH V P', registerNumber: '21384106' },
    { name: 'DEVAN V', registerNumber: '21384107' },
    { name: 'DINESHKUMAR T', registerNumber: '21384108' },
    { name: 'KARTHIKEYAN AK', registerNumber: '21384111' },
    { name: 'KOORU MAHEY V', registerNumber: '21384112' },
    { name: 'KRISHNANAND YADAV', registerNumber: '21384113' },
    { name: 'MAHESH E', registerNumber: '21384114' },
    { name: 'PADMAJHA', registerNumber: '21384116' },
    { name: 'SADHEED', registerNumber: '21384119' },
    { name: 'SENGKATHIRSELVAN B', registerNumber: '21384122' },
    { name: 'SINDHU BHARATHI P G', registerNumber: '21384123' },
    { name: 'SOWMIYA P', registerNumber: '21384124' },
    { name: 'SREEHARI S', registerNumber: '21384125' },
    { name: 'NAVINASRI S', registerNumber: '21384126' },
    { name: 'SURIYAMOORTHI G', registerNumber: '21384128' },
    { name: 'THINESH KUMAR S', registerNumber: '21384129' },
];

const COMMON_PASSWORD = 'pass@123';

async function createUsers() {
    console.log('🔐 Creating Firebase Auth users for Additional M.Sc CS 2nd Year students...');
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
            console.log(`[${i + 1}/${STUDENTS.length}] ${student.name} (${student.registerNumber}@pondiuni.ac.in)...`);
            
            const email = `${student.registerNumber}@pondiuni.ac.in`;
            
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
                    email: `${student.registerNumber}@pondiuni.ac.in`,
                    registerNumber: student.registerNumber
                });
            } else {
                console.error(`   ❌ Error: ${error.message}\n`);
                results.errors.push({
                    name: student.name,
                    email: `${student.registerNumber}@pondiuni.ac.in`,
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

