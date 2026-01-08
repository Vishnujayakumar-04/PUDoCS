/**
 * Create Firebase Auth accounts for MCA students
 * Common password: pass@123
 * Email format: 25mca00py0001@pondiuni.ac.in (lowercase)
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

// MCA Students
const STUDENTS = [
    { name: 'PRATYUSH JENA', registerNumber: '25MCA00PY0001' },
    { name: 'SATHISH V', registerNumber: '25MCA00PY0002' },
    { name: 'KARTHIKEYAN M', registerNumber: '25MCA00PY0003' },
    { name: 'SHERIN', registerNumber: '25MCA00PY0004' },
    { name: 'SIVANGI SANKAR', registerNumber: '25MCA00PY0005' },
    { name: 'SARANYA S', registerNumber: '25MCA00PY0006' },
    { name: 'BALAJI', registerNumber: '25MCA00PY0007' },
    { name: 'PRASHANT RAJAN', registerNumber: '25MCA00PY0008' },
    { name: 'ASHWANI RAJAN', registerNumber: '25MCA00PY0009' },
    { name: 'ANBARASAN A', registerNumber: '25MCA00PY0011' },
    { name: 'ROSHAN MAHANANDA', registerNumber: '25MCA00PY0012' },
    { name: 'REYNARD DAVID SUIAM', registerNumber: '25MCA00PY0013' },
    { name: 'MARIYAMMAL ALIAS PRIYADHARSHINI G', registerNumber: '25MCA00PY0014' },
    { name: 'BISHAL NATH', registerNumber: '25MCA00PY0015' },
    { name: 'SUGANYA S', registerNumber: '25MCA00PY0016' },
    { name: 'VIMMALESHWAR A', registerNumber: '25MCA00PY0017' },
    { name: 'SRIPARVATHI P P', registerNumber: '25MCA00PY0018' },
    { name: 'KUPPUSAMY M', registerNumber: '25MCA00PY0019' },
    { name: 'A MOHAMED USMAN', registerNumber: '25MCA00PY0021' },
    { name: 'SAHIL SINGH RAWAT', registerNumber: '25MCA00PY0026' },
    { name: 'ADITHYA CHAUHAN', registerNumber: '25MCA00PY0027' },
    { name: 'PRITAM SENAPATI', registerNumber: '25MCA00PY0028' },
    { name: 'SIDDHARTHA SAHA', registerNumber: '25MCA00PY0030' },
    { name: 'HARDHIK GUPTA', registerNumber: '25MCA00PY0031' },
    { name: 'ABHISHEK YADAV', registerNumber: '25MCA00PY0033' },
    { name: 'GARGI BHOWMICK', registerNumber: '25MCA00PY0034' },
    { name: 'AYUSH RAJ', registerNumber: '25MCA00PY0035' },
    { name: 'DIVYANSHU YADAV', registerNumber: '25MCA00PY0036' },
    { name: 'SANDEEP KUMAR', registerNumber: '25MCA00PY0037' },
    { name: 'SUBHRAJIT BISWAS', registerNumber: '25MCA00PY0038' },
    { name: 'URLA SARAN TEJ', registerNumber: '25MCA00PY0039' },
    { name: 'CHANCHAL ROY', registerNumber: '25MCA00PY0040' },
    { name: 'BABUDNAKI R NONGBRI', registerNumber: '25MCA00PY0042' },
    { name: 'RAUSHAN KUMAR', registerNumber: '25MCA00PY0043' },
    { name: 'J VISHAL', registerNumber: '25MCA00PY0044' },
    { name: 'KAMAL PRASAD BHURTEL', registerNumber: '25MCA00PY0045' },
    { name: 'ADHISHA S', registerNumber: '25MCA00PY0046' },
    { name: 'ABHIJITH K', registerNumber: '25MCA00PY0048' },
    { name: 'ADITYA SINGH', registerNumber: '25MCA00PY0050' },
    { name: 'BARATH S', registerNumber: '25MCA00PY0051' },
    { name: 'HARENDRA SINGH YADAV', registerNumber: '25MCA00PY0052' },
    { name: 'ABINESH M', registerNumber: '25MCA00PY0053' },
    { name: 'ANURAG KUMAR YADAV', registerNumber: '25MCA00PY0054' },
    { name: 'ROHIT YADAV', registerNumber: '25MCA00PY0055' },
    { name: 'DEBASHREETA BARIK', registerNumber: '25MCA00PY0056' },
    { name: 'MAYANK KUMAR', registerNumber: '25MCA00PY0057' },
    { name: 'SHISIS KHAMARI', registerNumber: '25MCA00PY0058' },
    { name: 'KARTHIKEYAN L', registerNumber: '25MCA00PY0059' },
    { name: 'MINAL DILIP DHOKE', registerNumber: '25MCA00PY0060' },
    { name: 'PRABHAT PATEL', registerNumber: '25MCA00PY0061' },
    { name: 'PAIASKHEM J CHYNE', registerNumber: '25MCA00PY0062' },
    { name: 'NASLA KAZUNGUM THODAN', registerNumber: '25MCA00PY0063' },
    { name: 'FATHIMA NAJIYA P K', registerNumber: '25MCA00PY0064' },
    { name: 'VAIBHAV KUMAR', registerNumber: '25MCA00PY0065' },
    { name: 'AGALYA S', registerNumber: '25MCA00PY0066' },
    { name: 'MIZFIN PUZHAKKATHODI', registerNumber: '25MCA00PY0067' },
    { name: 'AMAL E', registerNumber: '25MCA00PY0068' },
    { name: 'MOHAMMED THAAKIR S', registerNumber: '25MCA00PY0069' },
    { name: 'DHINESHKUMAR G', registerNumber: '25MCA00PY0070' },
    { name: 'GOPAL', registerNumber: '25MCA00PY0071' },
    { name: 'DEVAJITH S B', registerNumber: '25MCA00PY0072' },
    { name: 'ABHINAYA SELVI P', registerNumber: '25MCA00PY0074' },
    { name: 'KRISHAN', registerNumber: '25MCA00PY0075' },
    { name: 'THOTA AKHIL BALAJI', registerNumber: '25MCA00PY0076' },
    { name: 'RATHEESH R', registerNumber: '25MCA00PY0077' },
    { name: 'LAVANYA', registerNumber: '25MCA00PY0078' },
    { name: 'KURALAMUTHU S', registerNumber: '25MCA00PY0079' },
    { name: 'NARESH', registerNumber: '25MCA00PY0080' },
    { name: 'ARCHANA', registerNumber: '25MCA00PY0083' },
    { name: 'DEEPIKA', registerNumber: '25MCA00PY0082' },
    { name: 'SANAULLA', registerNumber: '25MCA00PY0085' },
    { name: 'MOHAMMED HASSAN', registerNumber: '25MCA00PY0084' },
    { name: 'HARI GOPI', registerNumber: '25MCA00PY0081' },
    { name: 'ROKITH', registerNumber: '25MCA00PY0086' },
    { name: 'PRIYADHARSHINI J', registerNumber: '25MCA00PY0087' },
    { name: 'ALETI SUDHAKAR', registerNumber: '25MCA00PY0088' },
];

const COMMON_PASSWORD = 'pass@123';

async function createUsers() {
    console.log('🔐 Creating Firebase Auth users for MCA 1st Year students...');
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

