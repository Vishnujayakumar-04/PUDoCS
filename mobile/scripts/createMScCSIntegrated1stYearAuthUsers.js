/**
 * Create Firebase Auth accounts for M.Sc CS Integrated 1st Year students
 * Common password: pass@123
 * Email format: 22384101@pondiuni.ac.in
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

// M.Sc CS Integrated 1st Year Students
const STUDENTS = [
    { name: 'Aarthi M', registerNumber: '22384101' },
    { name: 'Arathi Ramesh', registerNumber: '22384103' },
    { name: 'Athul Krishnan T R', registerNumber: '22384104' },
    { name: 'Balaji P', registerNumber: '22384105' },
    { name: 'Boda Kaveri', registerNumber: '22384106' },
    { name: 'Fuad PP', registerNumber: '22384107' },
    { name: 'Gokul G', registerNumber: '22384108' },
    { name: 'Harish P', registerNumber: '22384109' },
    { name: 'Indhumathi R', registerNumber: '22384110' },
    { name: 'Lakshmi Nandana B', registerNumber: '22384111' },
    { name: 'Leeladevi M', registerNumber: '22384112' },
    { name: 'Meesala Venkata Suresh', registerNumber: '22384113' },
    { name: 'Megavath Nandini', registerNumber: '22384114' },
    { name: 'Mohamed Rifath A', registerNumber: '22384115' },
    { name: 'Mohan Raju Donga', registerNumber: '22384116' },
    { name: 'Naresh T', registerNumber: '22384117' },
    { name: 'Pushpendra Yadav', registerNumber: '22384119' },
    { name: 'Shreya Sri K C', registerNumber: '22384120' },
    { name: 'Shwetha P', registerNumber: '22384121' },
    { name: 'Sivangi Sankar', registerNumber: '22384122' },
    { name: 'Suba P', registerNumber: '22384123' },
    { name: 'Chandu Tuvvadodi', registerNumber: '22384124' },
    { name: 'Vishnupriya S V', registerNumber: '22384125' },
    { name: 'Viswapriya R', registerNumber: '22384126' },
    { name: 'Ealaf Sherin AS', registerNumber: '21384109' },
    { name: 'Vidhyashree S', registerNumber: '21384130' },
];

const COMMON_PASSWORD = 'pass@123';

async function createUsers() {
    console.log('🔐 Creating Firebase Auth users for M.Sc CS Integrated 1st Year students...');
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

