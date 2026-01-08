/**
 * Create Firebase Auth accounts for M.Sc CS 2nd Year students (24MSCSCPY format)
 * Common password: pass@123
 * Email format: 24mscscpy0001@pondiuni.ac.in (lowercase)
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

// M.Sc CS 2nd Year Students (24MSCSCPY format)
const STUDENTS = [
    { name: 'PREMA NANCY', registerNumber: '24MSCSCPY0001' },
    { name: 'THAGDE AVINASH', registerNumber: '24MSCSCPY0002' },
    { name: 'RAMYA V', registerNumber: '24MSCSCPY0003' },
    { name: 'NAVEENA V S', registerNumber: '24MSCSCPY0004' },
    { name: 'BITAN MAJUMDER', registerNumber: '24MSCSCPY0005' },
    { name: 'KOMMU RUCHITHA', registerNumber: '24MSCSCPY0006' },
    { name: 'JANANIE N', registerNumber: '24MSCSCPY0007' },
    { name: 'AARTHIKA M', registerNumber: '24MSCSCPY0008' },
    { name: 'HEMALATHA M', registerNumber: '24MSCSCPY0010' },
    { name: 'GAYATHRI M', registerNumber: '24MSCSCPY0011' },
    { name: 'SAGGITHYA R P', registerNumber: '24MSCSCPY0012' },
    { name: 'PATIVADA NAVEEN KUMAR', registerNumber: '24MSCSCPY0013' },
    { name: 'ABHINAV V', registerNumber: '24MSCSCPY0014' },
    { name: 'THOTAKURI SUJEEV JOHN', registerNumber: '24MSCSCPY0015' },
    { name: 'PRABAL TALUKDAR', registerNumber: '24MSCSCPY0016' },
    { name: 'PRAKASH RAJ S', registerNumber: '24MSCSCPY0017' },
    { name: 'PREETHI D', registerNumber: '24MSCSCPY0018' },
    { name: 'SHEELA DEVI V', registerNumber: '24MSCSCPY0019' },
    { name: 'DHANUSH S', registerNumber: '24MSCSCPY0020' },
    { name: 'NILA', registerNumber: '24MSCSCPY0021' },
    { name: 'SYED AJMAL S', registerNumber: '24MSCSCPY0022' },
    { name: 'JOSH JOHN JOSEPH', registerNumber: '24MSCSCPY0023' },
    { name: 'SANJAI S', registerNumber: '24MSCSCPY0024' },
    { name: 'ROSELINE SWETHA T', registerNumber: '24MSCSCPY0025' },
    { name: 'THALLURI SRIJA', registerNumber: '24MSCSCPY0026' },
    { name: 'KRISHNARAJ E', registerNumber: '24MSCSCPY0027' },
    { name: 'FATHIMMATH NAHLA NM', registerNumber: '24MSCSCPY0028' },
    { name: 'SHAHNA K', registerNumber: '24MSCSCPY0029' },
    { name: 'MURSHIDUL HIBHAN', registerNumber: '24MSCSCPY0030' },
    { name: 'JANGAM RAKESH', registerNumber: '24MSCSCPY0031' },
    { name: 'K VARUN TEJA', registerNumber: '24MSCSCPY0032' },
    { name: 'CHURCHILL SAMUEL E', registerNumber: '24MSCSCPY0033' },
    { name: 'VASEEM N', registerNumber: '24MSCSCPY0034' },
    { name: 'ABUSALEEM S', registerNumber: '24MSCSCPY0037' },
    { name: 'VELMURUGAN G', registerNumber: '24MSCSCPY0038' },
    { name: 'ANJU ANEESH', registerNumber: '24MSCSCPY0039' },
    { name: 'ADARSH SINGH B', registerNumber: '24MSCSCPY0040' },
    { name: 'APARNA C', registerNumber: '24MSCSCPY0041' },
    { name: 'NAVEEN P', registerNumber: '24MSCSCPY0042' },
    { name: 'SHARISHNA', registerNumber: '24MSCSCPY0043' },
    { name: 'RIFNA K', registerNumber: '24MSCSCPY0044' },
    { name: 'SHAHEEL P', registerNumber: '24MSCSCPY0045' },
    { name: 'RAJESH V', registerNumber: '24MSCSCPY0046' },
    { name: 'FELIX G', registerNumber: '24MSCSCPY0047' },
    { name: 'ARAVINDAN N', registerNumber: '24MSCSCPY0048' },
    { name: 'NANDHAKUMAR S', registerNumber: '24MSCSCPY0049' },
    { name: 'KARTHICK P', registerNumber: '24MSCSCPY0050' },
    { name: 'SUBASINI S', registerNumber: '24MSCSCPY0051' },
    { name: 'THIRUKUMARAN S', registerNumber: '24MSCSCPY0052' },
    { name: 'MIRIYALA MOUNIKA', registerNumber: '24MSCSCPY0053' },
    { name: 'VISHNU J', registerNumber: '24MSCSCPY0054' },
    { name: 'ASHWIN K SHAJI', registerNumber: '24MSCSCPY0055' },
    { name: 'YESURAJ G', registerNumber: '24MSCSCPY0056' },
    { name: 'JANARTHANAN S', registerNumber: '24MSCSCPY0057' },
    { name: 'SORYAH A S', registerNumber: '24MSCSCPY0058' },
    { name: 'ALYAZAH.SM', registerNumber: '24MSCSCPY0059' },
    { name: 'KISHORE S', registerNumber: '24MSCSCPY0060' },
    { name: 'ABIRAMI G', registerNumber: '24MSCSCPY0061' },
    { name: 'AMEEN AHSAN N', registerNumber: '24MSCSCPY0063' },
    { name: 'DEVANATHAN T', registerNumber: '24MSCSCPY0064' },
    { name: 'DONELL DARIN A', registerNumber: '24MSCSCPY0065' },
    { name: 'NARENDRA K', registerNumber: '24MSCSCPY0066' },
    { name: 'AARTHI J', registerNumber: '24MSCSCPY0067' },
    { name: 'DHARANI T', registerNumber: '24MSCSCPY0068' },
];

const COMMON_PASSWORD = 'pass@123';

async function createUsers() {
    console.log('🔐 Creating Firebase Auth users for M.Sc CS 2nd Year students (24MSCSCPY format)...');
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

