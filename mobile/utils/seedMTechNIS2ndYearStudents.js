import { db } from '../services/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Seed M.Tech NIS 2nd Year Students to Firestore
 * Creates student profiles in the students_pg_mtech_nis_2 collection
 */

const M_TECH_NIS_2ND_YEAR_STUDENTS = [
    { name: 'Amarjeet Paswan', registerNumber: '24MTNISPY0001' },
    { name: 'Manish Kumar G.', registerNumber: '24MTNISPY0002' },
    { name: 'Sreeveni PA.', registerNumber: '24MTNISPY0003' },
    { name: 'Santanu Mondal', registerNumber: '24MTNISPY0004' },
    { name: 'Santhiya M.', registerNumber: '24MTNISPY0005' },
    { name: 'Farisha KR.', registerNumber: '24MTNISPY0006' },
    { name: 'Surajit Halder', registerNumber: '24MTNISPY0007' },
    { name: 'Devsri S.', registerNumber: '24MTNISPY0008' },
    { name: 'Kalpana A.', registerNumber: '24MTNISPY0009' },
    { name: 'Gopiga B.', registerNumber: '24MTNISPY0010' },
    { name: 'Jiva Bharathi M.', registerNumber: '24MTNISPY0011' },
    { name: 'Balavinayaga S.', registerNumber: '24MTNISPY0012' },
    { name: 'Sneha Lakra', registerNumber: '24MTNISPY0013' },
    { name: 'Ananthu Ajith', registerNumber: '24MTNISPY0014' },
    { name: 'Rajesh R.', registerNumber: '24MTNISPY0015' },
    { name: 'Swathi L.', registerNumber: '24MTNISPY0016' },
    { name: 'Dhanya R.', registerNumber: '24MTNISPY0017' },
    { name: 'Gods Graceson M. U', registerNumber: '24MTNISPY0018' },
];

const COLLECTION_NAME = 'students_pg_mtech_nis_2'; // M.Tech NIS 2nd Year collection

export const seedMTechNIS2ndYearStudents = async () => {
    try {
        console.log('🌱 Seeding M.Tech NIS 2nd Year Students...');
        console.log(`📋 Total students: ${M_TECH_NIS_2ND_YEAR_STUDENTS.length}`);
        
        const results = {
            created: [],
            updated: [],
            skipped: [],
            errors: []
        };
        
        for (const student of M_TECH_NIS_2ND_YEAR_STUDENTS) {
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
                    program: 'M.Tech NIS',
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

