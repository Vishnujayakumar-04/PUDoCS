import { db } from '../services/firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { studentStorageService } from '../services/studentStorageService';

/**
 * Cleanup Students - Keep only 24mscscpy0054
 * Deletes all students from Firestore and local storage except the specified register number
 */
export const cleanupStudents = async (keepRegisterNumber = '24mscscpy0054') => {
    try {
        console.log('🧹 Starting student cleanup...');
        console.log(`📌 Keeping student with register number: ${keepRegisterNumber}`);
        
        const keepRegNoUpper = keepRegisterNumber.toUpperCase();
        let deletedFromFirestore = 0;
        let deletedFromLocal = 0;
        let keptStudent = null;
        const errors = [];

        // Step 1: Delete from Firestore
        console.log('\n📤 Step 1: Cleaning Firestore...');
        const studentsRef = collection(db, 'students');
        const studentsSnapshot = await getDocs(studentsRef);
        
        console.log(`   Found ${studentsSnapshot.size} students in Firestore`);
        
        for (const studentDoc of studentsSnapshot.docs) {
            const studentData = studentDoc.data();
            const registerNumber = (studentData.registerNumber || studentDoc.id || '').toUpperCase();
            
            // Keep the specified student
            if (registerNumber === keepRegNoUpper) {
                keptStudent = {
                    id: studentDoc.id,
                    ...studentData
                };
                console.log(`   ✓ Keeping: ${registerNumber}`);
                continue;
            }
            
            // Delete all others
            try {
                await deleteDoc(doc(db, 'students', studentDoc.id));
                deletedFromFirestore++;
                console.log(`   ✗ Deleted: ${registerNumber || studentDoc.id}`);
            } catch (error) {
                console.error(`   ❌ Error deleting ${registerNumber || studentDoc.id}:`, error);
                errors.push({ type: 'firestore', id: studentDoc.id, error: error.message });
            }
        }

        // Step 2: Clean local storage
        console.log('\n📱 Step 2: Cleaning local storage...');
        const localStudents = await studentStorageService.getStudents();
        console.log(`   Found ${localStudents.length} students in local storage`);
        
        const studentsToKeep = localStudents.filter(s => {
            const regNo = (s.registerNumber || s.id || '').toUpperCase();
            return regNo === keepRegNoUpper;
        });
        
        if (studentsToKeep.length > 0) {
            // Save only the student to keep
            await studentStorageService.saveStudents(studentsToKeep);
            deletedFromLocal = localStudents.length - studentsToKeep.length;
            console.log(`   ✓ Kept ${studentsToKeep.length} student(s) in local storage`);
            console.log(`   ✗ Removed ${deletedFromLocal} student(s) from local storage`);
        } else {
            // If the student to keep is not in local storage, clear all
            if (keptStudent) {
                // Add the kept student to local storage
                await studentStorageService.addStudent(keptStudent);
                console.log(`   ✓ Added kept student to local storage`);
            }
            await studentStorageService.clearStudents();
            if (keptStudent) {
                await studentStorageService.addStudent(keptStudent);
            }
            deletedFromLocal = localStudents.length;
            console.log(`   ✗ Cleared all ${localStudents.length} students from local storage`);
        }

        // Summary
        console.log('\n✅ Cleanup completed!');
        console.log(`   📊 Summary:`);
        console.log(`      - Deleted from Firestore: ${deletedFromFirestore}`);
        console.log(`      - Deleted from local storage: ${deletedFromLocal}`);
        console.log(`      - Kept student: ${keepRegNoUpper}`);
        if (errors.length > 0) {
            console.log(`      - Errors: ${errors.length}`);
            errors.forEach(err => {
                console.log(`        • ${err.type}: ${err.id} - ${err.error}`);
            });
        }

        return {
            success: true,
            deletedFromFirestore,
            deletedFromLocal,
            keptStudent: keptStudent || studentsToKeep[0] || null,
            errors: errors.length > 0 ? errors : null
        };
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Test function to verify cleanup
 */
export const testCleanup = async () => {
    try {
        console.log('🧪 Testing cleanup function...');
        const result = await cleanupStudents('24mscscpy0054');
        
        if (result.success) {
            console.log('\n✅ Test completed successfully!');
            console.log('Result:', JSON.stringify(result, null, 2));
        } else {
            console.log('\n❌ Test failed!');
            console.log('Error:', result.error);
        }
        
        return result;
    } catch (error) {
        console.error('❌ Test error:', error);
        return { success: false, error: error.message };
    }
};

