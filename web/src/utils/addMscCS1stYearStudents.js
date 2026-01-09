import { db, auth } from '../services/firebaseConfig';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { MSC_CS_1ST_YEAR_STUDENTS, formatMscCS1stYearStudentData } from './mscCS1stYearStudentList';
import { studentStorageService } from '../services/studentStorageService';
import { getStudentCollectionName } from './collectionMapper';

export const addMscCS1stYearStudents = async () => {
    console.log('🚀 Starting M.Sc CS 1st Year student import...');

    const students = MSC_CS_1ST_YEAR_STUDENTS.map(student =>
        formatMscCS1stYearStudentData(student.registerNumber, student.name)
    );

    const results = [];
    const errors = [];

    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        try {
            const collectionName = getStudentCollectionName(
                student.course || 'PG',
                student.program || '',
                student.year || 1
            );

            const docRef = doc(db, collectionName, student.registerNumber);
            const studentData = {
                ...student,
                isActive: true,
                createdAt: student.createdAt || new Date().toISOString(),
            };

            await setDoc(docRef, studentData, { merge: true });

            const savedStudent = { id: student.registerNumber, ...studentData };
            results.push({ registerNumber: student.registerNumber, name: student.name, status: 'success' });

            await studentStorageService.addStudent(savedStudent);
        } catch (error) {
            errors.push({ registerNumber: student.registerNumber, name: student.name, error: error.message });
        }

        if (i < students.length - 1 && (i + 1) % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return {
        success: results.length,
        failed: errors.length,
        results,
        errors,
    };
};
