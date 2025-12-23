// Utility script to add M.Sc Computer Science 1st Year students
// Run this from a Node.js environment or use it in the app

import { db } from '../services/firebaseConfig';
import { collection, addDoc, setDoc, doc, getDoc } from 'firebase/firestore';
import { MSC_CS_1ST_YEAR_STUDENTS, formatMscCS1stYearStudentData } from './mscCS1stYearStudentList';
import { studentStorageService } from '../services/studentStorageService';
import { getStudentCollectionName } from './collectionMapper';

/**
 * Add M.Sc Computer Science 1st Year students to Firestore
 * This function adds all students with proper program, year, and course information
 */
export const addMscCS1stYearStudents = async () => {
    console.log('🚀 Starting M.Sc CS 1st Year student import...');
    console.log(`📋 Total students to import: ${MSC_CS_1ST_YEAR_STUDENTS.length}`);
    
    const students = MSC_CS_1ST_YEAR_STUDENTS.map(student => {
        const formatted = formatMscCS1stYearStudentData(student.registerNumber, student.name);
        console.log(`Formatting: ${student.name} -> Program: ${formatted.program}, Year: ${formatted.year}`);
        return formatted;
    });

    const results = [];
    const errors = [];

    // Log first student structure for debugging
    if (students.length > 0) {
        console.log('📝 Sample student data structure:', JSON.stringify(students[0], null, 2));
    }

    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        try {
            console.log(`[${i + 1}/${students.length}] Adding: ${student.name} (${student.registerNumber})`);
            
            // Get the correct collection name
            const collectionName = getStudentCollectionName(
                student.course || 'PG',
                student.program || '',
                student.year || 1
            );
            
            // Use registerNumber as document ID for easier lookup
            const docRef = doc(db, collectionName, student.registerNumber);
            
            // Prepare student data with all required fields
            const studentData = {
                name: student.name,
                registerNumber: student.registerNumber,
                course: student.course,
                program: student.program,
                year: student.year,
                academicYear: student.academicYear,
                section: student.section,
                isActive: student.isActive !== undefined ? student.isActive : true,
                createdAt: student.createdAt || new Date().toISOString(),
            };
            
            console.log(`  Data:`, JSON.stringify(studentData, null, 2));
            
            // Save to Firestore
            await setDoc(docRef, studentData, { merge: true });
            
            // Verify it was saved
            const verifyDoc = await getDoc(docRef);
            if (!verifyDoc.exists()) {
                throw new Error('Document was not created');
            }
            
            const savedStudent = { id: student.registerNumber, ...studentData };
            results.push({ registerNumber: student.registerNumber, name: student.name, status: 'success' });
            
            // Also save to local storage
            try {
                await studentStorageService.addStudent(savedStudent);
            } catch (storageError) {
                console.warn(`  ⚠️ Local storage save failed: ${storageError.message}`);
            }
            
            console.log(`  ✅ Successfully added to Firestore`);
        } catch (error) {
            const errorMsg = error.message || 'Unknown error';
            errors.push({ registerNumber: student.registerNumber, name: student.name, error: errorMsg });
            console.error(`  ❌ Failed: ${errorMsg}`);
            console.error(`  Error details:`, error);
        }
        
        // Small delay to avoid overwhelming Firestore
        if (i < students.length - 1 && (i + 1) % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    // Sync all students to local storage after bulk add
    if (results.length > 0) {
        try {
            const savedStudents = results.map(r => {
                const student = students.find(s => s.registerNumber === r.registerNumber);
                return { id: student.registerNumber, ...student };
            });
            await studentStorageService.addStudentsBulk(savedStudents);
            console.log(`✅ Synced ${results.length} students to local storage`);
        } catch (storageError) {
            console.warn(`⚠️ Bulk local storage sync failed: ${storageError.message}`);
        }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`  ✅ Success: ${results.length}`);
    console.log(`  ❌ Failed: ${errors.length}`);
    
    if (errors.length > 0) {
        console.log(`\n❌ Errors:`);
        errors.forEach(err => {
            console.log(`  - ${err.name} (${err.registerNumber}): ${err.error}`);
        });
    }

    return {
        success: results.length,
        failed: errors.length,
        results,
        errors,
    };
};

/**
 * Add a single student (helper function)
 */
export const addSingleMscCS1stYearStudent = async (registerNumber, name) => {
    const studentData = formatMscCS1stYearStudentData(registerNumber, name);

    try {
        const collectionName = getStudentCollectionName(
            studentData.course || 'PG',
            studentData.program || '',
            studentData.year || 1
        );
        const docRef = doc(db, collectionName, registerNumber);
        await setDoc(docRef, studentData, { merge: true });
        return { success: true, registerNumber, name };
    } catch (error) {
        return { success: false, registerNumber, name, error: error.message };
    }
};

// Export the student list for reference
export { MSC_CS_1ST_YEAR_STUDENTS };

