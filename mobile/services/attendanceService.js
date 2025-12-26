import { db } from './firebaseConfig';
import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { studentService } from './studentService';
import { officeService } from './officeService';
import { getAllStudentCollections } from '../utils/collectionMapper';

/**
 * Attendance Service
 * Handles attendance recording and calculation for all roles
 */

export const attendanceService = {
    /**
     * Get student's timetable to extract subjects with credits
     */
    getStudentSubjects: async (program, year) => {
        try {
            const timetable = await studentService.getTimetable(program, year);
            if (!timetable || !timetable.subjects) {
                return [];
            }
            
            // Extract unique subjects with their credits/hours
            const subjectsMap = {};
            timetable.subjects.forEach(subject => {
                const key = subject.code || subject.subjectCode || subject.name;
                if (!subjectsMap[key]) {
                    subjectsMap[key] = {
                        code: subject.code || subject.subjectCode || '',
                        name: subject.name || subject.subject || '',
                        credits: subject.hours || subject.credits || 3, // Default 3 credits
                        type: subject.type || 'Hardcore',
                        faculty: subject.faculty?.name || subject.faculty || '',
                    };
                }
            });
            
            return Object.values(subjectsMap);
        } catch (error) {
            console.error('Error getting student subjects:', error);
            return [];
        }
    },

    /**
     * Get attendance records for a student
     */
    getStudentAttendance: async (studentId, program, year) => {
        try {
            // Get subjects from timetable
            const subjects = await attendanceService.getStudentSubjects(program, year);
            
            // Get attendance records from Firestore
            const attendanceRef = doc(db, 'attendance', studentId);
            const attendanceDoc = await getDoc(attendanceRef);
            
            const attendanceData = attendanceDoc.exists() ? attendanceDoc.data() : {};
            const records = attendanceData.records || [];
            
            // Calculate attendance for each subject
            const subjectAttendance = subjects.map(subject => {
                const subjectCode = subject.code;
                const subjectRecords = records.filter(r => 
                    (r.subjectCode === subjectCode || r.subject === subject.name)
                );
                
                const totalClasses = subjectRecords.length;
                const attendedClasses = subjectRecords.filter(r => r.status === 'Present' || r.status === 'present').length;
                const notAttendedClasses = totalClasses - attendedClasses;
                
                // Calculate attendance percentage
                // Formula: If 1 class missed of 3-credit course = 3% reduction
                // So: (attended / total) * 100, but weighted by credits
                const credits = subject.credits || 3;
                const basePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100;
                
                // Weight by credits (3 credits = 3% per class, 2 credits = 2% per class, etc.)
                const creditWeight = credits;
                const totalPossible = totalClasses * creditWeight;
                const earned = attendedClasses * creditWeight;
                const attendancePercentage = totalPossible > 0 ? (earned / totalPossible) * 100 : 100;
                
                const isEligible = attendancePercentage >= 75;
                
                return {
                    ...subject,
                    totalClasses,
                    attendedClasses,
                    notAttendedClasses,
                    attendancePercentage: Math.round(attendancePercentage * 100) / 100, // Round to 2 decimals
                    isEligible,
                    records: subjectRecords,
                };
            });
            
            return subjectAttendance;
        } catch (error) {
            console.error('Error getting student attendance:', error);
            return [];
        }
    },

    /**
     * Add attendance record for a student
     * @param {string} studentId - Student register number or ID
     * @param {string} subjectCode - Subject code
     * @param {string} subjectName - Subject name
     * @param {string} date - Date in ISO format
     * @param {string} status - 'Present' or 'Absent'
     * @param {string} markedBy - Staff/Office user ID or email
     */
    addAttendanceRecord: async (studentId, subjectCode, subjectName, date, status, markedBy) => {
        try {
            const attendanceRef = doc(db, 'attendance', studentId);
            const attendanceDoc = await getDoc(attendanceRef);
            
            const existingData = attendanceDoc.exists() ? attendanceDoc.data() : {};
            const records = existingData.records || [];
            
            // Check if record already exists for this date and subject
            const existingIndex = records.findIndex(r => 
                r.date === date && (r.subjectCode === subjectCode || r.subject === subjectName)
            );
            
            const newRecord = {
                subjectCode,
                subject: subjectName,
                date,
                status: status === 'Present' || status === 'present' ? 'Present' : 'Absent',
                markedBy,
                markedAt: new Date().toISOString(),
            };
            
            if (existingIndex >= 0) {
                // Update existing record
                records[existingIndex] = newRecord;
            } else {
                // Add new record
                records.push(newRecord);
            }
            
            // Update Firestore
            await setDoc(attendanceRef, {
                studentId,
                records,
                lastUpdated: new Date().toISOString(),
            }, { merge: true });
            
            return { success: true, record: newRecord };
        } catch (error) {
            console.error('Error adding attendance record:', error);
            throw error;
        }
    },

    /**
     * Add attendance for multiple students at once (for a class)
     */
    addClassAttendance: async (students, subjectCode, subjectName, date, attendanceMap, markedBy) => {
        try {
            const results = [];
            
            for (const student of students) {
                const studentId = student.id || student._id || student.registerNumber;
                const status = attendanceMap[studentId] || 'Absent';
                
                try {
                    await attendanceService.addAttendanceRecord(
                        studentId,
                        subjectCode,
                        subjectName,
                        date,
                        status,
                        markedBy
                    );
                    results.push({ studentId, success: true });
                } catch (error) {
                    console.error(`Error adding attendance for ${studentId}:`, error);
                    results.push({ studentId, success: false, error: error.message });
                }
            }
            
            return results;
        } catch (error) {
            console.error('Error adding class attendance:', error);
            throw error;
        }
    },

    /**
     * Get all students' attendance for a class (Office view)
     */
    getClassAttendance: async (program, year) => {
        try {
            // Get all students in the class
            const allStudents = await officeService.getStudents();
            
            // Filter by program and year
            const classStudents = allStudents.filter(s => {
                const sProgram = (s.program || '').toLowerCase();
                const sYear = s.year || '';
                const normalizedYear = typeof sYear === 'string' ? 
                    (sYear === 'I' ? 1 : sYear === 'II' ? 2 : sYear === 'III' ? 3 : sYear === 'IV' ? 4 : parseInt(sYear, 10)) : 
                    sYear;
                
                const targetYear = typeof year === 'string' ? 
                    (year === 'I' ? 1 : year === 'II' ? 2 : year === 'III' ? 3 : year === 'IV' ? 4 : parseInt(year, 10)) : 
                    year;
                
                const programMatch = sProgram.includes(program.toLowerCase()) || 
                                   (program === 'B.Tech' && (sProgram.includes('btech') || sProgram.includes('b.tech'))) ||
                                   (program === 'B.Sc CS' && (sProgram.includes('bsc') || sProgram.includes('b.sc'))) ||
                                   (program === 'M.Sc CS' && (sProgram.includes('msc') || sProgram.includes('m.sc'))) ||
                                   (program === 'M.Tech DS' && (sProgram.includes('mtech') || sProgram.includes('m.tech') || sProgram.includes('data science') || sProgram.includes('data analytics'))) ||
                                   (program === 'M.Tech CSE' && (sProgram.includes('mtech') || sProgram.includes('m.tech')) && sProgram.includes('cse')) ||
                                   (program === 'M.Tech NIS' && (sProgram.includes('mtech') || sProgram.includes('m.tech')) && sProgram.includes('nis')) ||
                                   (program === 'M.Sc Data Analytics' && (sProgram.includes('msc') || sProgram.includes('m.sc')) && (sProgram.includes('data') || sProgram.includes('analytics'))) ||
                                   (program === 'M.Sc CS Integrated' && (sProgram.includes('msc') || sProgram.includes('m.sc')) && sProgram.includes('integrated')) ||
                                   (program === 'MCA' && sProgram.includes('mca'));
                
                return programMatch && normalizedYear === targetYear;
            });
            
            // Get attendance for each student
            const studentsWithAttendance = await Promise.all(
                classStudents.map(async (student) => {
                    const studentId = student.id || student._id || student.registerNumber;
                    const attendance = await attendanceService.getStudentAttendance(
                        studentId,
                        program,
                        year
                    );
                    
                    return {
                        ...student,
                        attendance,
                    };
                })
            );
            
            return studentsWithAttendance;
        } catch (error) {
            console.error('Error getting class attendance:', error);
            return [];
        }
    },

    /**
     * Get attendance records for a specific date and subject (for editing)
     */
    getAttendanceByDateAndSubject: async (date, subjectCode) => {
        try {
            // This is a more complex query - we'll need to search through all attendance documents
            // For now, we'll return empty and let the caller handle it
            // In production, you might want to create a separate collection indexed by date/subject
            return [];
        } catch (error) {
            console.error('Error getting attendance by date and subject:', error);
            return [];
        }
    },
};

