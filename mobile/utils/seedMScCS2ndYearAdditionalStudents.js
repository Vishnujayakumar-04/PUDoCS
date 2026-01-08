import { db } from '../services/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Seed Additional M.Sc CS 2nd Year Students to Firestore
 * These students have registration numbers in 21384xxx format
 * Creates student profiles in the students_pg_msc_cs_2 collection
 */

const M_SC_CS_2ND_YEAR_ADDITIONAL_STUDENTS = [
    { name: 'ABHINAND P S', registerNumber: '21384101' },
    { name: 'ANJANA V', registerNumber: '21384102' },
    { name: 'ATHIRA K', registerNumber: '21384104' },
    { name: 'DAWOOD HAIDER KHAN', registerNumber: '21384105' },
    { name: 'DEEKSHITH V P', registerNumber: '21384106' },
    { name: 'DEVAN V', registerNumber: '21384107' },
    { name: 'DINESHKUMAR T', registerNumber: '21384108' },
    { name: 'KARTHIKEYAN AK', registerNumber: '21384111' },
    { name: 'KOORU MAHEY V', registerNumber: '21384112' },
    { name: 'KRISHNANAND YADAV', registerNumber: '21384113' },
    { name: 'MAHESH E', registerNumber: '21384114' },
    { name: 'PADMAJHA', registerNumber: '21384116' },
    { name: 'SADHEED', registerNumber: '21384119' },
    { name: 'SENGKATHIRSELVAN B', registerNumber: '21384122' },
    { name: 'SINDHU BHARATHI P G', registerNumber: '21384123' },
    { name: 'SOWMIYA P', registerNumber: '21384124' },
    { name: 'SREEHARI S', registerNumber: '21384125' },
    { name: 'NAVINASRI S', registerNumber: '21384126' },
    { name: 'SURIYAMOORTHI G', registerNumber: '21384128' },
    { name: 'THINESH KUMAR S', registerNumber: '21384129' },
];

const COLLECTION_NAME = 'students_pg_msc_cs_2'; // M.Sc CS 2nd Year collection

export const seedMScCS2ndYearAdditionalStudents = async () => {
    try {
        console.log('🌱 Seeding Additional M.Sc CS 2nd Year Students...');
        console.log(`📋 Total students: ${M_SC_CS_2ND_YEAR_ADDITIONAL_STUDENTS.length}`);
        
        const results = {
            created: [],
            updated: [],
            skipped: [],
            errors: []
        };
        
        for (const student of M_SC_CS_2ND_YEAR_ADDITIONAL_STUDENTS) {
            try {
                const registerNumber = student.registerNumber;
                const email = `${registerNumber}@pondiuni.ac.in`; // Email format: 21384101@pondiuni.ac.in
                
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

