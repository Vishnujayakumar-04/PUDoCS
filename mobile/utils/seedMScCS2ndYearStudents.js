import { db } from '../services/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Seed M.Sc CS 2nd Year Students to Firestore
 * Creates student profiles in the students_pg_msc_cs_2 collection
 */

const M_SC_CS_2ND_YEAR_STUDENTS = [
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

const COLLECTION_NAME = 'students_pg_msc_cs_2'; // M.Sc CS 2nd Year collection

export const seedMScCS2ndYearStudents = async () => {
    try {
        console.log('🌱 Seeding M.Sc CS 2nd Year Students (24MSCSCPY format)...');
        console.log(`📋 Total students: ${M_SC_CS_2ND_YEAR_STUDENTS.length}`);
        
        const results = {
            created: [],
            updated: [],
            skipped: [],
            errors: []
        };
        
        for (const student of M_SC_CS_2ND_YEAR_STUDENTS) {
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
                    program: 'M.Sc CS',
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

