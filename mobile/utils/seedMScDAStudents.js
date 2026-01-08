import { db } from '../services/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Seed M.Sc Data Analytics 1st Year Students to Firestore
 * Creates student profiles in the students_pg_msc_da_1 collection
 */

const M_SC_DA_STUDENTS = [
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

const COLLECTION_NAME = 'students_pg_msc_da_1'; // M.Sc Data Analytics 1st Year collection

export const seedMScDAStudents = async () => {
    try {
        console.log('🌱 Seeding M.Sc Data Analytics 1st Year Students...');
        console.log(`📋 Total students: ${M_SC_DA_STUDENTS.length}`);
        
        const results = {
            created: [],
            updated: [],
            skipped: [],
            errors: []
        };
        
        for (const student of M_SC_DA_STUDENTS) {
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
                    program: 'M.Sc Data Analytics',
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

