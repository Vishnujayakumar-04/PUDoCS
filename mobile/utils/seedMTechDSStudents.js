import { db } from '../services/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Seed M.Tech DS 1st Year Students to Firestore
 * Creates student profiles in the students_pg_mtech_da_1 collection
 */

const M_TECH_DS_STUDENTS = [
    { name: 'Durgadevi', registerNumber: '25MTNISPY0002' },
    { name: 'Vijayadamodaran N', registerNumber: '25MTNISPY0003' },
    { name: 'Rachakonda Sagar', registerNumber: '25MTNISPY0004' },
    { name: 'Ayesetty Jaswanth Sai Raj', registerNumber: '25MTNISPY0005' },
    { name: 'Davinsi Ragamalika M', registerNumber: '25MTNISPY0006' }, // Already done
    { name: 'Naveenraj N', registerNumber: '25MTNISPY0007' },
    { name: 'Gokulakannan C', registerNumber: '25MTNISPY0008' },
    { name: 'Santhosh V', registerNumber: '25MTNISPY0009' },
    { name: 'Anandhakumar P', registerNumber: '25MTNISPY0010' },
    { name: 'Monika K', registerNumber: '25MTNISPY0011' },
    { name: 'Preethi Ravi', registerNumber: '25MTNISPY0012' },
    { name: 'Asvina S', registerNumber: '25MTNISPY0013' },
    { name: 'Lagudu Yernaidu', registerNumber: '25MTNISPY0014' },
    { name: 'Akash J', registerNumber: '25MTNISPY0015' },
    { name: 'Harish S', registerNumber: '25MTNISPY0017' },
    { name: 'Eashwar R', registerNumber: '25MTNISPY0018' },
    { name: 'Harshath K', registerNumber: '25MTNISPY0019' },
    { name: 'Kishore Chakkaravarthi M N', registerNumber: '25MTNISPY0020' },
    { name: 'Arun', registerNumber: '25MTNISPY0023' },
    { name: 'Agilan A', registerNumber: '25MTNISPY0024' },
    { name: 'Praveena', registerNumber: '25MTNISPY0025' },
    { name: 'Sivaprrasath S J', registerNumber: '25MTNISPY0026' },
];

const COLLECTION_NAME = 'students_pg_mtech_da_1'; // M.Tech DS 1st Year collection

export const seedMTechDSStudents = async () => {
    try {
        console.log('🌱 Seeding M.Tech DS 1st Year Students...');
        console.log(`📋 Total students: ${M_TECH_DS_STUDENTS.length}`);
        
        const results = {
            created: [],
            updated: [],
            skipped: [],
            errors: []
        };
        
        for (const student of M_TECH_DS_STUDENTS) {
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
                    program: 'M.Tech DS',
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

// For direct execution (if needed)
if (typeof window === 'undefined') {
    seedMTechDSStudents()
        .then(result => {
            console.log('\n🎉 Seeding complete!');
            console.log('Result:', JSON.stringify(result, null, 2));
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

