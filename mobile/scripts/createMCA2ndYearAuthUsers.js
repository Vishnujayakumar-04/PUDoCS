/**
 * Create Firebase Auth accounts for MCA 2nd Year students
 * Common password: pass@123
 * Email format: 24mca00py0001@pondiuni.ac.in (lowercase)
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

// MCA 2nd Year Students
const STUDENTS = [
    { name: 'AZHAGANANTHAM M', registerNumber: '24MCA00PY0001' },
    { name: 'THAMIZHARASAN', registerNumber: '24MCA00PY0002' },
    { name: 'ARAVINDAN M', registerNumber: '24MCA00PY0003' },
    { name: 'MUHAMMED FASAL V', registerNumber: '24MCA00PY0004' },
    { name: 'THEJA K', registerNumber: '24MCA00PY0005' },
    { name: 'SARAN V', registerNumber: '24MCA00PY0006' },
    { name: 'TINGKU EUSIBIOUS N SANGMA', registerNumber: '24MCA00PY0007' },
    { name: 'JAGAN S', registerNumber: '24MCA00PY0008' },
    { name: 'SRILAKSHMI J', registerNumber: '24MCA00PY0009' },
    { name: 'PADMALATHA', registerNumber: '24MCA00PY0010' },
    { name: 'RAJU KUMAR PASWAN', registerNumber: '24MCA00PY0011' },
    { name: 'AISWARYA M', registerNumber: '24MCA00PY0012' },
    { name: 'VISHAL YADAV', registerNumber: '24MCA00PY0013' },
    { name: 'HARIPRAGASH K', registerNumber: '24MCA00PY0014' },
    { name: 'RATHINAVELU R', registerNumber: '24MCA00PY0015' },
    { name: 'SIVAPRASATH', registerNumber: '24MCA00PY0016' },
    { name: 'SUJITHA A', registerNumber: '24MCA00PY0017' },
    { name: 'SHAMBHAVI GANTLA', registerNumber: '24MCA00PY0018' },
    { name: 'VISWA', registerNumber: '24MCA00PY0019' },
    { name: 'JAKKULA SHIVA KUMAR', registerNumber: '24MCA00PY0020' },
    { name: 'AGALYA S', registerNumber: '24MCA00PY0021' },
    { name: 'DURGADEVI C', registerNumber: '24MCA00PY0022' },
    { name: 'SACHIN KUMAR KAUSHAL', registerNumber: '24MCA00PY0023' },
    { name: 'VIGNESH V', registerNumber: '24MCA00PY0024' },
    { name: 'MUHAMMED THAJUDHEEN', registerNumber: '24MCA00PY0025' },
    { name: 'FIDHA FATHIMA A C', registerNumber: '24MCA00PY0026' },
    { name: 'AVANIT KUMAR', registerNumber: '24MCA00PY0027' },
    { name: 'DEEPAK', registerNumber: '24MCA00PY0028' },
    { name: 'AMIT KHATRI', registerNumber: '24MCA00PY0029' },
    { name: 'ATHULDAS K K', registerNumber: '24MCA00PY0030' },
    { name: 'VIJAY PUROHIT', registerNumber: '24MCA00PY0031' },
    { name: 'BELINA V', registerNumber: '24MCA00PY0032' },
    { name: 'SANDHIYA C', registerNumber: '24MCA00PY0033' },
    { name: 'ANKIT KUMAR', registerNumber: '24MCA00PY0034' },
    { name: 'ANUP KUMAR', registerNumber: '24MCA00PY0035' },
    { name: 'KOUSHIK ADHIKARY', registerNumber: '24MCA00PY0036' },
    { name: 'VAIBHAV KUSHWAH', registerNumber: '24MCA00PY0037' },
    { name: 'PRIYA KUMARI', registerNumber: '24MCA00PY0038' },
    { name: 'SHREYANS MAHATRE', registerNumber: '24MCA00PY0039' },
    { name: 'MOHIT KUMAR', registerNumber: '24MCA00PY0040' },
    { name: 'RAHUL KUMAR RAJAK', registerNumber: '24MCA00PY0041' },
    { name: 'PUTTOJU VENKATESH', registerNumber: '24MCA00PY0042' },
    { name: 'SHIVANGI VERMA', registerNumber: '24MCA00PY0043' },
    { name: 'SAURABH TIWARI', registerNumber: '24MCA00PY0044' },
    { name: 'MD AMIRUDDIN ANSARI', registerNumber: '24MCA00PY0045' },
    { name: 'ANKUR KUMAR', registerNumber: '24MCA00PY0046' },
    { name: 'HARSH KUMAR AGARWAL', registerNumber: '24MCA00PY0047' },
    { name: 'AVINASH SAMANTRAI', registerNumber: '24MCA00PY0048' },
    { name: 'ASWIN P', registerNumber: '24MCA00PY0049' },
    { name: 'ARSHAD BAVA M', registerNumber: '24MCA00PY0050' },
    { name: 'SAURABH', registerNumber: '24MCA00PY0051' },
    { name: 'RIZWAN C K', registerNumber: '24MCA00PY0052' },
    { name: 'ANIT KUMAR MAITY', registerNumber: '24MCA00PY0053' },
    { name: 'ARVIND KUMAR SAW', registerNumber: '24MCA00PY0054' },
    { name: 'PIYUSH KUMAR GAUTAM', registerNumber: '24MCA00PY0055' },
    { name: 'SURAJ KUMAR', registerNumber: '24MCA00PY0056' },
    { name: 'BALAKUMARAN D', registerNumber: '24MCA00PY0057' },
    { name: 'RAJU DAS', registerNumber: '24MCA00PY0058' },
    { name: 'TEJA NALUKURTHI', registerNumber: '24MCA00PY0059' },
    { name: 'RAHUL RABIDAS', registerNumber: '24MCA00PY0060' },
    { name: 'KOLIMI NIKHITHA', registerNumber: '24MCA00PY0061' },
    { name: 'SHIKHA LUGUN', registerNumber: '24MCA00PY0062' },
    { name: 'UMESH PATHAK', registerNumber: '24MCA00PY0063' },
    { name: 'ITEE AGARWAL', registerNumber: '24MCA00PY0064' },
    { name: 'ANBUNATHAN', registerNumber: '24MCA00PY0065' },
    { name: 'RAJINA C', registerNumber: '24MCA00PY0066' },
    { name: 'SIVA SUBRAMANIAN U', registerNumber: '24MCA00PY0067' },
    { name: 'JAGRUTHI DASARAPU', registerNumber: '24MCA00PY0068' },
    { name: 'VARUN V', registerNumber: '24MCA00PY0069' },
    { name: 'BIJISHA K', registerNumber: '24MCA00PY0070' },
    { name: 'MOHAMMED ANFAS CP', registerNumber: '24MCA00PY0071' },
    { name: 'MOHAMMED SHAN V P', registerNumber: '24MCA00PY0072' },
    { name: 'YAMUNA', registerNumber: '24MCA00PY0073' },
];

const COMMON_PASSWORD = 'pass@123';

async function createUsers() {
    console.log('🔐 Creating Firebase Auth users for MCA 2nd Year students...');
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

