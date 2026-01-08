import { db } from '../services/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Seed M.Tech CSE 1st Year Students to Firestore
 * Creates student profiles in the students_pg_mtech_cse_1 collection
 */

const M_TECH_CSE_STUDENTS = [
    { name: 'P OM SHIVA', registerNumber: '25MTCSEPY0003' },
    { name: 'SNEKHA S', registerNumber: '25MTCSEPY0004' },
    { name: 'MOHANAPRIYA M', registerNumber: '25MTCSEPY0005' },
    { name: 'S KRISHNA PRANIL', registerNumber: '25MTCSEPY0006' },
    { name: 'P REETHU JOYCEY', registerNumber: '25MTCSEPY0007' },
    { name: 'CHINTHAKINDI BHANU', registerNumber: '25MTCSEPY0008' },
    { name: 'CHINTHA HASA SRI', registerNumber: '25MTCSEPY0009' },
    { name: 'ANUJITH BALAN', registerNumber: '25MTCSEPY0010' },
    { name: 'ASHMI C L', registerNumber: '25MTCSEPY0011' },
    { name: 'VISWANATH M', registerNumber: '25MTCSEPY0013' },
    { name: 'M NANTHAKUMAR', registerNumber: '25MTCSEPY0014' },
    { name: 'VISHNU VARDHAN P', registerNumber: '25MTCSEPY0016' },
    { name: 'YOUGAARAJ R', registerNumber: '25MTCSEPY0017' },
    { name: 'DHINESH G', registerNumber: '25MTCSEPY0018' },
    { name: 'ABISHEK S', registerNumber: '25MTCSEPY0019' },
    { name: 'ANBIRKAVIN A', registerNumber: '25MTCSEPY0020' },
];

const COLLECTION_NAME = 'students_pg_mtech_cse_1'; // M.Tech CSE 1st Year collection

export const seedMTechCSEStudents = async () => {
    try {
        console.log('🌱 Seeding M.Tech CSE 1st Year Students...');
        console.log(`📋 Total students: ${M_TECH_CSE_STUDENTS.length}`);
        
        const results = {
            created: [],
            updated: [],
            skipped: [],
            errors: []
        };
        
        for (const student of M_TECH_CSE_STUDENTS) {
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
                    program: 'M.Tech CSE',
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

