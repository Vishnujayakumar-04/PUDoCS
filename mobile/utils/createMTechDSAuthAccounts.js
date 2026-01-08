import { auth } from '../services/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../services/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Create Firebase Auth accounts for M.Tech DS students
 * Common password: pass@123
 * Email format: 25mtnispy0002@pondiuni.ac.in (lowercase)
 */

const M_TECH_DS_STUDENTS = [
    { name: 'Durgadevi', registerNumber: '25MTNISPY0002' },
    { name: 'Vijayadamodaran N', registerNumber: '25MTNISPY0003' },
    { name: 'Rachakonda Sagar', registerNumber: '25MTNISPY0004' },
    { name: 'Ayesetty Jaswanth Sai Raj', registerNumber: '25MTNISPY0005' },
    { name: 'Davinsi Ragamalika M', registerNumber: '25MTNISPY0006' },
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

const COMMON_PASSWORD = 'pass@123';

export const createMTechDSAuthAccounts = async () => {
    try {
        console.log('🔐 Creating Firebase Auth accounts for M.Tech DS students...');
        console.log(`📋 Total students: ${M_TECH_DS_STUDENTS.length}`);
        console.log(`🔑 Common password: ${COMMON_PASSWORD}`);
        
        const results = {
            created: [],
            alreadyExists: [],
            errors: []
        };
        
        for (const student of M_TECH_DS_STUDENTS) {
            try {
                const registerNumber = student.registerNumber;
                const email = `${registerNumber.toLowerCase()}@pondiuni.ac.in`;
                
                console.log(`\n📧 Processing: ${student.name} (${email})`);
                
                // Try to create Firebase Auth account
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, COMMON_PASSWORD);
                    const user = userCredential.user;
                    
                    console.log(`✅ Auth account created: ${user.uid}`);
                    
                    // Create/update user document in 'users' collection
                    const userDocRef = doc(db, 'users', user.uid);
                    await setDoc(userDocRef, {
                        uid: user.uid,
                        email: email,
                        role: 'Student',
                        registerNumber: registerNumber,
                        name: student.name,
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }, { merge: true });
                    
                    console.log(`✅ User document created in 'users' collection`);
                    
                    results.created.push({
                        registerNumber,
                        name: student.name,
                        email,
                        uid: user.uid
                    });
                    
                } catch (authError) {
                    // Check if user already exists
                    if (authError.code === 'auth/email-already-in-use') {
                        console.log(`ℹ️ Auth account already exists for ${email}`);
                        results.alreadyExists.push({
                            registerNumber,
                            name: student.name,
                            email
                        });
                    } else {
                        throw authError;
                    }
                }
                
            } catch (error) {
                console.error(`❌ Error processing ${student.name} (${student.registerNumber}):`, error);
                results.errors.push({
                    registerNumber: student.registerNumber,
                    name: student.name,
                    email: `${student.registerNumber.toLowerCase()}@pondiuni.ac.in`,
                    error: error.message,
                    code: error.code
                });
            }
        }
        
        console.log('\n📊 Account Creation Summary:');
        console.log(`✅ Created: ${results.created.length}`);
        console.log(`ℹ️ Already exists: ${results.alreadyExists.length}`);
        console.log(`❌ Errors: ${results.errors.length}`);
        
        if (results.errors.length > 0) {
            console.log('\n❌ Errors:');
            results.errors.forEach(err => {
                console.log(`  - ${err.name} (${err.registerNumber}): ${err.error}`);
            });
        }
        
        if (results.created.length > 0) {
            console.log('\n✅ Successfully created accounts:');
            results.created.forEach(acc => {
                console.log(`  - ${acc.name} (${acc.email})`);
            });
        }
        
        return {
            success: results.errors.length === 0,
            created: results.created.length,
            alreadyExists: results.alreadyExists.length,
            errors: results.errors.length,
            details: results
        };
    } catch (error) {
        console.error('❌ Fatal error creating auth accounts:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Note: This function requires admin privileges or should be run server-side
// For client-side, you may need to use Firebase Admin SDK or run this from a backend service

