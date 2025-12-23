/**
 * Generic utility to add students class-wise
 * Works with any class/program/year combination
 */

import { db } from '../services/firebaseConfig';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { studentStorageService } from '../services/studentStorageService';
import { getStudentCollectionName } from './collectionMapper';

/**
 * Add students for a specific class
 * @param {Array} studentsList - Array of { registerNumber, name }
 * @param {string} course - 'UG' or 'PG'
 * @param {string} program - Program name (e.g., 'BTech', 'M.Sc CS', etc.)
 * @param {number} year - Year (1, 2, 3, 4, 5, 6)
 * @param {string} section - Section (default: 'A')
 * @returns {Promise<Object>} Import results
 */
export const addStudentsByClass = async (studentsList, course, program, year, section = 'A') => {
    console.log(`🚀 Starting student import for ${program} ${year}${year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year...`);
    console.log(`📋 Total students to import: ${studentsList.length}`);
    console.log(`📚 Course: ${course}, Program: ${program}, Year: ${year}`);
    
    const results = [];
    const errors = [];
    
    // Get the correct collection name
    const collectionName = getStudentCollectionName(course, program, year);
    console.log(`📦 Using collection: ${collectionName}`);
    
    for (let i = 0; i < studentsList.length; i++) {
        const student = studentsList[i];
        try {
            const registerNumber = student.registerNumber || student.regNo || student.id;
            const name = student.name || student.studentName;
            
            if (!registerNumber || !name) {
                throw new Error('Missing registerNumber or name');
            }
            
            console.log(`[${i + 1}/${studentsList.length}] Adding: ${name} (${registerNumber})`);
            
            // Prepare student data
            const studentData = {
                registerNumber: registerNumber.toUpperCase(),
                name: name.trim(),
                course: course,
                program: program,
                year: year,
                section: section,
                isActive: true,
                createdAt: new Date().toISOString(),
            };
            
            // Use registerNumber as document ID
            const docRef = doc(db, collectionName, registerNumber.toUpperCase());
            
            // Save to Firestore (merge to avoid overwriting existing data)
            await setDoc(docRef, studentData, { merge: true });
            
            // Verify it was saved
            const verifyDoc = await getDoc(docRef);
            if (!verifyDoc.exists()) {
                throw new Error('Document was not created');
            }
            
            const savedStudent = { id: registerNumber.toUpperCase(), ...studentData };
            results.push({ registerNumber, name, status: 'success' });
            
            // Also save to local storage
            try {
                await studentStorageService.addStudent(savedStudent);
            } catch (storageError) {
                console.warn(`  ⚠️ Local storage save failed: ${storageError.message}`);
            }
            
            console.log(`  ✅ Successfully added to ${collectionName}`);
        } catch (error) {
            const errorMsg = error.message || 'Unknown error';
            const registerNumber = student.registerNumber || student.regNo || student.id || 'N/A';
            const name = student.name || student.studentName || 'N/A';
            errors.push({ registerNumber, name, error: errorMsg });
            console.error(`  ❌ Failed: ${errorMsg}`);
        }
        
        // Small delay to avoid overwhelming Firestore
        if (i < studentsList.length - 1 && (i + 1) % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    // Sync all students to local storage after bulk add
    if (results.length > 0) {
        try {
            const savedStudents = results.map(r => {
                const student = studentsList.find(s => 
                    (s.registerNumber || s.regNo || s.id) === r.registerNumber
                );
                if (student) {
                    return {
                        id: r.registerNumber.toUpperCase(),
                        registerNumber: r.registerNumber.toUpperCase(),
                        name: student.name || student.studentName,
                        course,
                        program,
                        year,
                        section,
                        isActive: true,
                        createdAt: new Date().toISOString(),
                    };
                }
                return null;
            }).filter(Boolean);
            
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
        collectionName,
    };
};

/**
 * Helper to format year suffix
 */
const getYearSuffix = (year) => {
    if (year === 1) return '1st';
    if (year === 2) return '2nd';
    if (year === 3) return '3rd';
    return `${year}th`;
};

