import { db } from '../services/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Seed M.Tech CSE 2nd Year Students to Firestore
 * Creates student profiles in the students_pg_mtech_cse_2 collection
 */

const M_TECH_CSE_2ND_YEAR_STUDENTS = [
    { name: 'SRIMAN D', registerNumber: '24MTCSEPY0001' },
    { name: 'AMJAD ZAMAN J', registerNumber: '24MTCSEPY0004' },
    { name: 'KIRTHIVERSHA M', registerNumber: '24MTCSEPY0005' },
    { name: 'SUBHIKSHA R', registerNumber: '24MTCSEPY0006' },
    { name: 'MONISHA N', registerNumber: '24MTCSEPY0007' },
    { name: 'LAVUDYA VASANTH RAO', registerNumber: '24MTCSEPY0008' },
    { name: 'ANKIT KUMAR', registerNumber: '24MTCSEPY0009' },
    { name: 'ANABHAYAN S', registerNumber: '24MTCSEPY0010' },
    { name: 'M SINDUJA', registerNumber: '24MTCSEPY0011' },
    { name: 'HARSHIT RAJ', registerNumber: '24MTCSEPY0012' },
    { name: 'SRI GURUBAGHUVELA D', registerNumber: '24MTCSEPY0013' },
    { name: 'DHANUSH KUMAR S', registerNumber: '24MTCSEPY0014' },
    { name: 'M MANISHA', registerNumber: '24MTCSEPY0015' },
    { name: 'SANTHAKUMAR R', registerNumber: '24MTCSEPY0016' },
    { name: 'HEMA N', registerNumber: '24MTCSEPY0017' },
    { name: 'KOLA VARUN CHANDRA', registerNumber: '24MTCSEPY0018' },
    { name: 'KOTTE SAI GANESH', registerNumber: '24MTCSEPY0019' },
    { name: 'ANANYA GAUTAM', registerNumber: '24MTCSEPY0020' },
    { name: 'N GOKULNATH', registerNumber: '24MTCSEPY0021' },
    { name: 'SAKTHIVEL V', registerNumber: '24MTCSEPY0023' },
];

const COLLECTION_NAME = 'students_pg_mtech_cse_2'; // M.Tech CSE 2nd Year collection

export const seedMTechCSE2ndYearStudents = async () => {
    try {
        console.log('🌱 Seeding M.Tech CSE 2nd Year Students...');
        console.log(`📋 Total students: ${M_TECH_CSE_2ND_YEAR_STUDENTS.length}`);
        
        const results = {
            created: [],
            updated: [],
            skipped: [],
            errors: []
        };
        
        for (const student of M_TECH_CSE_2ND_YEAR_STUDENTS) {
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

