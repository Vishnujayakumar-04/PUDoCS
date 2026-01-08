import { db } from '../services/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Seed MCA 2nd Year Students to Firestore
 * Creates student profiles in the students_pg_mca_2 collection
 */

const MCA_2ND_YEAR_STUDENTS = [
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

const COLLECTION_NAME = 'students_pg_mca_2'; // MCA 2nd Year collection

export const seedMCA2ndYearStudents = async () => {
    try {
        console.log('🌱 Seeding MCA 2nd Year Students...');
        console.log(`📋 Total students: ${MCA_2ND_YEAR_STUDENTS.length}`);
        
        const results = {
            created: [],
            updated: [],
            skipped: [],
            errors: []
        };
        
        for (const student of MCA_2ND_YEAR_STUDENTS) {
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
                    year: 'II',
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

