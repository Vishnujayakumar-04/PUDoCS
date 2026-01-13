import { db } from './firebaseConfig';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    setDoc,
    updateDoc,
    addDoc
} from 'firebase/firestore';
import { studentService } from './studentService';
import { officeService } from './officeService';
import { getDefaultSubjects } from '../utils/defaultSubjects';

export const attendanceService = {
    /**
     * Get student's subjects from timetable or defaults
     */
    getStudentSubjects: async (program, year) => {
        try {
            const timetable = await studentService.getTimetable(program, year);
            if (timetable && timetable.subjects && timetable.subjects.length > 0) {
                const subjectsMap = {};
                timetable.subjects.forEach(subject => {
                    const key = subject.code || subject.subjectCode || subject.name;
                    if (!subjectsMap[key]) {
                        subjectsMap[key] = {
                            code: subject.code || subject.subjectCode || '',
                            name: subject.name || subject.subject || '',
                            credits: subject.hours || subject.credits || 3,
                            type: subject.type || 'Hardcore',
                            faculty: subject.faculty?.name || subject.faculty || '',
                        };
                    }
                });
                return Object.values(subjectsMap);
            }

            const defaultSubjects = getDefaultSubjects(program, year);
            return defaultSubjects ? defaultSubjects.map(subject => ({
                code: subject.code,
                name: subject.name,
                credits: subject.hours || 3,
                type: subject.type || 'Hardcore',
                faculty: subject.faculty || '',
            })) : [];
        } catch (error) {
            console.error('Error getting student subjects:', error);
            return [];
        }
    },

    /**
     * Get attendance records for a student from Firestore
     */
    getStudentAttendance: async (studentId, program, year) => {
        try {
            const subjects = await attendanceService.getStudentSubjects(program, year);

            const q = query(collection(db, 'attendance'), where('studentId', '==', studentId));
            const snapshot = await getDocs(q);
            const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            return subjects.map(subject => {
                const subjectRecords = records.filter(r =>
                    (subject.code && r.subjectCode === subject.code) || (r.subjectName === subject.name)
                );

                const totalClasses = subjectRecords.length;
                const attendedClasses = subjectRecords.filter(r => r.status === 'Present').length;
                const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100;

                return {
                    ...subject,
                    totalClasses,
                    attendedClasses,
                    attendancePercentage: Math.round(attendancePercentage * 100) / 100,
                    isEligible: attendancePercentage >= 75,
                    records: subjectRecords,
                };
            });
        } catch (error) {
            console.error('Error getting student attendance:', error);
            return [];
        }
    },

    /**
     * Add single attendance record to Firestore
     */
    addAttendanceRecord: async (recordData) => {
        try {
            const attendanceRef = collection(db, 'attendance');
            const docRef = await addDoc(attendanceRef, {
                ...recordData,
                timestamp: new Date().toISOString()
            });
            return { id: docRef.id, success: true };
        } catch (error) {
            console.error('Error adding attendance record:', error);
            throw error;
        }
    },

    /**
     * Add class attendance (bulk)
     */
    addClassAttendance: async (students, subjectData, date, attendanceMap, markedBy) => {
        try {
            const results = [];
            for (const student of students) {
                const studentId = student.id || student.registerNumber;
                const record = {
                    studentId,
                    subjectCode: subjectData.code,
                    subjectName: subjectData.name,
                    date,
                    status: attendanceMap[studentId] || 'Absent',
                    markedBy,
                    markedAt: new Date().toISOString()
                };

                try {
                    const res = await attendanceService.addAttendanceRecord(record);
                    results.push({ studentId, success: true, id: res.id });
                } catch (e) {
                    results.push({ studentId, success: false, error: e.message });
                }
            }
            return results;
        } catch (error) {
            console.error('Error adding class attendance:', error);
            throw error;
        }
    },

    /**
     * Get class attendance (Office view)
     */
    getClassAttendance: async (program, year) => {
        try {
            const students = await officeService.getStudents({ program, year });

            return await Promise.all(students.map(async (student) => {
                const studentId = student.id || student.registerNumber;
                const attendance = await attendanceService.getStudentAttendance(studentId, program, year);
                return { ...student, attendance };
            }));
        } catch (error) {
            console.error('Error getting class attendance:', error);
            return [];
        }
    }
};
