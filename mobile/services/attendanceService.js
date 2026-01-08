import { studentService } from './studentService';
import { officeService } from './officeService';
import { getDefaultSubjects } from '../utils/defaultSubjects';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Attendance Service (Local First)
 * Handles attendance recording and calculation
 */

const getAttendanceKey = (studentId) => `attendance_record_${studentId}`;

export const attendanceService = {
    /**
     * Get student's timetable to extract subjects with credits
     */
    getStudentSubjects: async (program, year) => {
        try {
            // First try to get from timetable
            const timetable = await studentService.getTimetable(program, year);
            if (timetable && timetable.subjects && timetable.subjects.length > 0) {
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
            }

            // Fallback to default subjects
            const defaultSubjects = getDefaultSubjects(program, year);
            if (defaultSubjects && defaultSubjects.length > 0) {
                return defaultSubjects.map(subject => ({
                    code: subject.code,
                    name: subject.name,
                    credits: subject.hours || 3,
                    type: subject.type || 'Hardcore',
                    faculty: subject.faculty || '',
                }));
            }

            return [];
        } catch (error) {
            console.error('Error getting student subjects:', error);
            // Fallback
            const defaultSubjects = getDefaultSubjects(program, year);
            return defaultSubjects ? defaultSubjects.map(subject => ({
                code: subject.code,
                name: subject.name,
                credits: subject.hours || 3,
                type: subject.type || 'Hardcore',
                faculty: subject.faculty || '',
            })) : [];
        }
    },

    /**
     * Get attendance records for a student
     */
    getStudentAttendance: async (studentId, program, year) => {
        try {
            // Get subjects from timetable
            const subjects = await attendanceService.getStudentSubjects(program, year);

            // Get attendance records from Local Storage
            const key = getAttendanceKey(studentId);
            const dataStr = await AsyncStorage.getItem(key);
            const attendanceData = dataStr ? JSON.parse(dataStr) : {};
            const records = attendanceData.records || [];

            // Calculate attendance for each subject
            const subjectAttendance = subjects.map(subject => {
                const subjectCode = subject.code;
                const subjectName = subject.name;

                // Match by code or name
                const subjectRecords = records.filter(r =>
                    (subjectCode && r.subjectCode === subjectCode) || (r.subject === subjectName)
                );

                const totalClasses = subjectRecords.length;
                const attendedClasses = subjectRecords.filter(r => r.status === 'Present' || r.status === 'present').length;
                const notAttendedClasses = totalClasses - attendedClasses;

                // Calculate percentage logic
                const credits = subject.credits || 3;
                // Simple percentage for now: (attended / total) * 100
                // If using credit weighting logic (e.g. absent = -percentage points):
                // For simplicity in migration, stick to standard percentage
                const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100;

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
     */
    addAttendanceRecord: async (studentId, subjectCode, subjectName, date, status, markedBy) => {
        try {
            const key = getAttendanceKey(studentId);
            const dataStr = await AsyncStorage.getItem(key);
            const existingData = dataStr ? JSON.parse(dataStr) : {};
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

            // Update Local Storage
            await AsyncStorage.setItem(key, JSON.stringify({
                studentId,
                records,
                lastUpdated: new Date().toISOString(),
            }));

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

                // Simple case insensitive check
                const programMatch = sProgram.includes(program.toLowerCase());

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
     * Get attendance records for a specific date and subject
     */
    getAttendanceByDateAndSubject: async (date, subjectCode) => {
        // Not easily efficient in local storage without an index
        // Returning empty for now
        return [];
    },
};


