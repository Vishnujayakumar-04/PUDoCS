import { db } from '../services/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Seed MCA 1st Year Students to Firestore
 * Creates student profiles in the students_pg_mca_1 collection
 */

const MCA_STUDENTS = [
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

const COLLECTION_NAME = 'students_pg_mca_1'; // MCA 1st Year collection

export const seedMCAStudents = async () => {
    try {
        console.log('🌱 Seeding MCA 1st Year Students...');
        console.log(`📋 Total students: ${MCA_STUDENTS.length}`);
        
        const results = {
            created: [],
            updated: [],
            skipped: [],
            errors: []
        };
        
        for (const student of MCA_STUDENTS) {
            try {
                const registerNumber = student.registerNumber;
                const email = `${registerNumber.toLowerCase()}@pondiuni.ac.in`; // Lowercase email format
                
                // Check if student already exists
                const studentRef = doc(db, COLLECTION_NAME, registerNumber);
                const studentDoc = await getDoc(studentRef);
                
                const studentData = {
                    registerNumber: registerNumber,
                    name: student.name,
                    email: email,
                    program: 'MCA',
                    year: 'I',
                    course: 'PG',
                    // Photo fields left empty - students will add their own
                    photoUrl: null,
                    photo: null,
                    // Basic profile fields
                    phone: '',
                    gender: '',
                    fatherName: '',
                    fatherMobile: '',
                    motherName: '',
                    motherMobile: '',
                    caste: '',
                    houseAddress: '',
                    // Timestamps
                    createdAt: studentDoc.exists() 
                        ? studentDoc.data().createdAt || new Date().toISOString()
                        : new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                
                if (studentDoc.exists()) {
                    // Update existing student (preserve existing data, only update basic fields)
                    const existingData = studentDoc.data();
                    await setDoc(studentRef, {
                        ...existingData,
                        ...studentData,
                        // Preserve photo if already exists
                        photoUrl: existingData.photoUrl || null,
                        photo: existingData.photo || null,
                        updatedAt: new Date().toISOString(),
                    }, { merge: true });
                    results.updated.push(registerNumber);
                    console.log(`✅ Updated: ${student.name} (${registerNumber})`);
                } else {
                    // Create new student
                    await setDoc(studentRef, studentData);
                    results.created.push(registerNumber);
                    console.log(`✅ Created: ${student.name} (${registerNumber})`);
                }
            } catch (error) {
                console.error(`❌ Error processing ${student.name} (${student.registerNumber}):`, error);
                results.errors.push({
                    registerNumber: student.registerNumber,
                    name: student.name,
                    error: error.message
                });
            }
        }
        
        console.log('\n📊 Seeding Summary:');
        console.log(`✅ Created: ${results.created.length}`);
        console.log(`🔄 Updated: ${results.updated.length}`);
        console.log(`❌ Errors: ${results.errors.length}`);
        
        if (results.errors.length > 0) {
            console.log('\n❌ Errors:');
            results.errors.forEach(err => {
                console.log(`  - ${err.name} (${err.registerNumber}): ${err.error}`);
            });
        }
        
        return {
            success: results.errors.length === 0,
            created: results.created.length,
            updated: results.updated.length,
            errors: results.errors.length,
            details: results
        };
    } catch (error) {
        console.error('❌ Fatal error seeding students:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

