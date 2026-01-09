
import { studentService } from './studentService';
import { getDefaultSubjects } from '../utils/defaultSubjects';

/**
 * Attendance Service (Web Local First)
 */

const getAttendanceKey = (studentId) => `attendance_record_${studentId}`;

export const attendanceService = {
    /**
     * Get student's timetable to extract subjects with credits
     */
    getStudentSubjects: async (program, year) => {
        try {
            // First try to get from timetable (check studentService web impl)
            const timetable = await studentService.getTimetable(program, year);
            if (timetable && timetable.subjects && timetable.subjects.length > 0) {
                // Extract unique subjects
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
            const subjects = await attendanceService.getStudentSubjects(program, year);
            const key = getAttendanceKey(studentId);
            const dataStr = localStorage.getItem(key);
            const attendanceData = dataStr ? JSON.parse(dataStr) : {};
            const records = attendanceData.records || [];

            const subjectAttendance = subjects.map(subject => {
                const subjectCode = subject.code;
                const subjectName = subject.name;

                const subjectRecords = records.filter(r =>
                    (subjectCode && r.subjectCode === subjectCode) || (r.subject === subjectName)
                );

                const totalClasses = subjectRecords.length;
                const attendedClasses = subjectRecords.filter(r => r.status === 'Present' || r.status === 'present').length;
                const notAttendedClasses = totalClasses - attendedClasses;

                const credits = subject.credits || 3;

                // Simple percentage for now: (attended / total) * 100
                const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100;

                const isEligible = attendancePercentage >= 75;

                return {
                    ...subject,
                    totalClasses,
                    attendedClasses,
                    notAttendedClasses,
                    attendancePercentage: Math.round(attendancePercentage * 100) / 100,
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
            const dataStr = localStorage.getItem(key);
            const existingData = dataStr ? JSON.parse(dataStr) : {};
            const records = existingData.records || [];

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
                records[existingIndex] = newRecord;
            } else {
                records.push(newRecord);
            }

            localStorage.setItem(key, JSON.stringify({
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
    }
};
