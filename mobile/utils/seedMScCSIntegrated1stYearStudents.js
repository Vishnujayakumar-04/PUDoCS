import { db } from '../services/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Seed M.Sc CS Integrated 1st Year Students to Firestore
 * Creates student profiles in the students_pg_msc_cs_int_1 collection
 */

const M_SC_CS_INTEGRATED_1ST_YEAR_STUDENTS = [
    { name: 'Aarthi M', registerNumber: '22384101' },
    { name: 'Arathi Ramesh', registerNumber: '22384103' },
    { name: 'Athul Krishnan T R', registerNumber: '22384104' },
    { name: 'Balaji P', registerNumber: '22384105' },
    { name: 'Boda Kaveri', registerNumber: '22384106' },
    { name: 'Fuad PP', registerNumber: '22384107' },
    { name: 'Gokul G', registerNumber: '22384108' },
    { name: 'Harish P', registerNumber: '22384109' },
    { name: 'Indhumathi R', registerNumber: '22384110' },
    { name: 'Lakshmi Nandana B', registerNumber: '22384111' },
    { name: 'Leeladevi M', registerNumber: '22384112' },
    { name: 'Meesala Venkata Suresh', registerNumber: '22384113' },
    { name: 'Megavath Nandini', registerNumber: '22384114' },
    { name: 'Mohamed Rifath A', registerNumber: '22384115' },
    { name: 'Mohan Raju Donga', registerNumber: '22384116' },
    { name: 'Naresh T', registerNumber: '22384117' },
    { name: 'Pushpendra Yadav', registerNumber: '22384119' },
    { name: 'Shreya Sri K C', registerNumber: '22384120' },
    { name: 'Shwetha P', registerNumber: '22384121' },
    { name: 'Sivangi Sankar', registerNumber: '22384122' },
    { name: 'Suba P', registerNumber: '22384123' },
    { name: 'Chandu Tuvvadodi', registerNumber: '22384124' },
    { name: 'Vishnupriya S V', registerNumber: '22384125' },
    { name: 'Viswapriya R', registerNumber: '22384126' },
    { name: 'Ealaf Sherin AS', registerNumber: '21384109' },
    { name: 'Vidhyashree S', registerNumber: '21384130' },
];

const COLLECTION_NAME = 'students_pg_msc_cs_int_1'; // M.Sc CS Integrated 1st Year collection

export const seedMScCSIntegrated1stYearStudents = async () => {
    try {
        console.log('🌱 Seeding M.Sc CS Integrated 1st Year Students...');
        console.log(`📋 Total students: ${M_SC_CS_INTEGRATED_1ST_YEAR_STUDENTS.length}`);
        
        const results = {
            created: [],
            updated: [],
            skipped: [],
            errors: []
        };
        
        for (const student of M_SC_CS_INTEGRATED_1ST_YEAR_STUDENTS) {
            try {
                const registerNumber = student.registerNumber;
                const email = `${registerNumber}@pondiuni.ac.in`; // Email format: 22384101@pondiuni.ac.in
                
                // Check if student already exists
                const studentRef = doc(db, COLLECTION_NAME, registerNumber);
                const studentDoc = await getDoc(studentRef);
                
                const studentData = {
                    registerNumber: registerNumber,
                    name: student.name,
                    email: email,
                    program: 'M.Sc CS Integrated',
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

