/**
 * Create Firebase Auth accounts for M.Tech CSE 2nd Year students
 * Common password: pass@123
 * Email format: 24mtcsepy0001@pondiuni.ac.in (lowercase)
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

// M.Tech CSE 2nd Year Students
const STUDENTS = [
    { name: 'SRIMAN D', registerNumber: '24MTCSEPY0001' },
    { name: 'AMJAD ZAMAN J', registerNumber: '24MTCSEPY0004' },
    { name: 'KIRTHIVERSHA M', registerNumber: '24MTCSEPY0005' },
    { name: 'SUBHIKSHA R', registerNumber: '24MTCSEPY0006' },
    { name: 'MONISHA N', registerNumber: '24MTCSEPY0007' },
    { name: 'LAVUDYA VASANTH RAO', registerNumber: '24MTCSEPY0008' },
    { name: 'ANKIT KUMAR', registerNumber: '24MTCSEPY0009' },
    { name: 'ANABHAYAN S', registerNumber: '24MTCSEPY0010' },
    { name: 'M SINDUJA', registerNumber: '24MTCSEPY0011' },
    { name: 'HARSHIT RAJ', registerNumber: '24MTCSEPY0012' },
    { name: 'SRI GURUBAGHUVELA D', registerNumber: '24MTCSEPY0013' },
    { name: 'DHANUSH KUMAR S', registerNumber: '24MTCSEPY0014' },
    { name: 'M MANISHA', registerNumber: '24MTCSEPY0015' },
    { name: 'SANTHAKUMAR R', registerNumber: '24MTCSEPY0016' },
    { name: 'HEMA N', registerNumber: '24MTCSEPY0017' },
    { name: 'KOLA VARUN CHANDRA', registerNumber: '24MTCSEPY0018' },
    { name: 'KOTTE SAI GANESH', registerNumber: '24MTCSEPY0019' },
    { name: 'ANANYA GAUTAM', registerNumber: '24MTCSEPY0020' },
    { name: 'N GOKULNATH', registerNumber: '24MTCSEPY0021' },
    { name: 'SAKTHIVEL V', registerNumber: '24MTCSEPY0023' },
];

const COMMON_PASSWORD = 'pass@123';

async function createUsers() {
    console.log('🔐 Creating Firebase Auth users for M.Tech CSE 2nd Year students...');
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

