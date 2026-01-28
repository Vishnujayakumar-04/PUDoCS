
import { db } from './firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

/**
 * Attendance Service (Unified Firebase Backend)
 * 
 * Replaces legacy local-only storage.
 * Fetches directly from 'attendance' collection populated by Staff.
 */

export const attendanceService = {

    /**
     * Get attendance records for a student
     * @param {string} studentId - The student's ID (or Register Number)
     * @param {string} program - (Optional) Program name for metadata
     * @param {number} year - (Optional) Year for metadata
     */
    getStudentAttendance: async (studentId, program, year) => {
        try {
            console.log(`Getting attendance for student: ${studentId}`);

            // 1. Query 'attendance' collection where studentIds array contains this studentId
            // This relies on staffService.saveAttendance adding this field.
            const q = query(
                collection(db, 'attendance'),
                where('studentIds', 'array-contains', studentId)
            );

            const snapshot = await getDocs(q);
            const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            console.log(`Found ${records.length} attendance documents for student.`);

            // 2. Process Records into Subject-wise breakdown
            const subjectMap = {};

            records.forEach(record => {
                const subjectName = record.subject || 'Unknown Subject';
                const subjectCode = record.subjectCode || subjectName; // Fallback

                // Find specific student status in this record
                const studentEntry = record.students?.find(s => s.id === studentId || s.regNo === studentId);

                if (studentEntry) {
                    const status = studentEntry.status; // 'P' or 'A' or 'Present'/'Absent'
                    const isPresent = status === 'P' || status === 'Present' || status === 'present';

                    if (!subjectMap[subjectName]) {
                        subjectMap[subjectName] = {
                            name: subjectName,
                            code: subjectCode,
                            totalClasses: 0,
                            attendedClasses: 0,
                            records: []
                        };
                    }

                    subjectMap[subjectName].totalClasses++;
                    if (isPresent) {
                        subjectMap[subjectName].attendedClasses++;
                    }

                    subjectMap[subjectName].records.push({
                        date: record.date,
                        status: isPresent ? 'Present' : 'Absent',
                        type: record.type || 'Regular'
                    });
                }
            });

            // 3. Format result
            const result = Object.values(subjectMap).map(subj => {
                const percentage = subj.totalClasses > 0
                    ? (subj.attendedClasses / subj.totalClasses) * 100
                    : 100;

                return {
                    ...subj,
                    attendancePercentage: Math.round(percentage * 100) / 100,
                    credits: 3 // Default credit if unknown, for overall calculation
                };
            });

            return result;

        } catch (error) {
            console.error('Error getting student attendance:', error);
            return [];
        }
    }
};
