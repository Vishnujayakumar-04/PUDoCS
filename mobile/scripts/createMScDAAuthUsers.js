/**
 * Create Firebase Auth accounts for M.Sc Data Analytics students
 * Common password: pass@123
 * Email format: 25mscscpy0001@pondiuni.ac.in (lowercase)
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

// M.Sc Data Analytics Students
const STUDENTS = [
    { name: 'AHAMED THIJANI PP', registerNumber: '25MSCSCPY0001' },
    { name: 'AKUDARI VARSHA', registerNumber: '25MSCSCPY0002' },
    { name: 'PAMPATTIWAR SHREEVASTHAV', registerNumber: '25MSCSCPY0003' },
    { name: 'SHARON BENZY', registerNumber: '25MSCSCPY0004' },
    { name: 'G MUGILAN', registerNumber: '25MSCSCPY0005' },
    { name: 'AMAN KUMAR', registerNumber: '25MSCSCPY0006' },
    { name: 'RONAK', registerNumber: '25MSCSCPY0008' },
    { name: 'MUHAMMED SAFWAN AHAMMED A', registerNumber: '25MSCSCPY0009' },
    { name: 'AYUSH KUMAR GUPTA', registerNumber: '25MSCSCPY0010' },
    { name: 'ADHEERA P K', registerNumber: '25MSCSCPY0011' },
    { name: 'VYSAKH BINU', registerNumber: '25MSCSCPY0012' },
    { name: 'RAMAKURI MANOJ KUMAR', registerNumber: '25MSCSCPY0013' },
    { name: 'SREELAKSHMI M S', registerNumber: '25MSCSCPY0014' },
    { name: 'NALLA SHYAMAL', registerNumber: '25MSCSCPY0015' },
    { name: 'ARIBA RAHMANI', registerNumber: '25MSCSCPY0016' },
    { name: 'RAGUL E', registerNumber: '25MSCSCPY0017' },
    { name: 'KOMARA VAMSI PHANINDRA', registerNumber: '25MSCSCPY0018' },
    { name: 'R SARAVANAN', registerNumber: '25MSCSCPY0019' },
    { name: 'GOKUL KRISHNAN V', registerNumber: '25MSCSCPY0020' },
    { name: 'SASITHA', registerNumber: '25MSCSCPY0021' },
    { name: 'BYAGARI NIKHIL KUMAR', registerNumber: '25MSCSCPY0022' },
    { name: 'DARA UJWALA SAI KUMAR', registerNumber: '25MSCSCPY0023' },
    { name: 'PUJARINI PADHAN', registerNumber: '25MSCSCPY0024' },
    { name: 'CHENNAM PRASHANTH REDDY', registerNumber: '25MSCSCPY0025' },
    { name: 'ILAVARASU DIMANCHE', registerNumber: '25MSCSCPY0027' },
    { name: 'K VARUN TEJA', registerNumber: '25MSCSCPY0028' },
    { name: 'ASHWIN', registerNumber: '25MSCSCPY0030' },
    { name: 'SHIFIN MUSTHAFA P P', registerNumber: '25MSCSCPY0031' },
    { name: 'VIGNESH R', registerNumber: '25MSCSCPY0032' },
    { name: 'SUNKARI SHIVA KRISHNA', registerNumber: '25MSCSCPY0033' },
    { name: 'SATHYADARSHAN S', registerNumber: '25MSCSCPY0034' },
    { name: 'GOWSIGAN', registerNumber: '25MSCSCPY0036' },
    { name: 'DAMODHARAN R', registerNumber: '25MSCSCPY0037' },
    { name: 'SHANAMONI SRAVANI', registerNumber: '25MSCSCPY0038' },
    { name: 'MUTHUKUMAR V', registerNumber: '25MSCSCPY0039' },
    { name: 'POONGUZHALI S', registerNumber: '25MSCSCPY0040' },
    { name: 'ARATHI RAMESH', registerNumber: '25MSCSCPY0041' },
    { name: 'LANA FATHIMA', registerNumber: '25MSCSCPY0042' },
    { name: 'MONESH S', registerNumber: '25MSCSCPY0043' },
    { name: 'SURUTHI T', registerNumber: '25MSCSCPY0045' },
    { name: 'PRAVIN P', registerNumber: '25MSCSCPY0046' },
    { name: 'RAHUL N', registerNumber: '25MSCSCPY0047' },
    { name: 'S KAVIYAPRIYA', registerNumber: '25MSCSCPY0049' },
    { name: 'S RAMKUMAR', registerNumber: '25MSCSCPY0050' },
    { name: 'MOHAMMED AKEED ANEES P K', registerNumber: '25MSCSCPY0051' },
    { name: 'MOHAMMED HAFIZ N M', registerNumber: '25MSCSCPY0052' },
];

const COMMON_PASSWORD = 'pass@123';

async function createUsers() {
    console.log('🔐 Creating Firebase Auth users for M.Sc Data Analytics 1st Year students...');
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

