import { studentData } from '../data/studentData.js';
import { timetableData } from '../data/timetableData.js';
import staffData from '../data/staffData.json';

export const localDataService = {
    // Get All Staff
    getAllStaff: () => {
        return staffData || [];
    },

    // Get Staff by Email
    getStaffByEmail: (email) => {
        if (!email) return null;
        return staffData.find(s => s.email && s.email.toLowerCase() === email.toLowerCase()) || null;
    },

    // Get Student by Email
    getStudentByEmail: (email) => {
        if (!email) return null;
        const lowerEmail = email.toLowerCase();

        // Search all programs and years
        for (const program of Object.keys(studentData)) {
            const years = Object.keys(studentData[program]);
            for (const year of years) {
                const students = studentData[program][year];
                if (students && Array.isArray(students)) {
                    const found = students.find(s =>
                        (s.email && s.email.toLowerCase() === lowerEmail) ||
                        (s.registerNumber && `${s.registerNumber.toLowerCase()}@pondiuni.ac.in` === lowerEmail)
                    );
                    if (found) {
                        return { ...found, program, year };
                    }
                }
            }
        }
        return null;
    },

    // Get Timetable
    getTimetable: (program, year) => {
        try {
            if (!timetableData[program]) return null;

            // Normalize year
            let lookupYear = year;
            if (typeof year === 'number') {
                lookupYear = year.toString();
            }

            return timetableData[program][lookupYear] || null;
        } catch (error) {
            console.error('Error fetching local timetable:', error);
            return null;
        }
    },

    // Get Students
    getStudents: (program, year) => {
        try {
            if (!studentData[program]) return [];

            // Normalize year
            let lookupYear = year;
            if (typeof year === 'number') {
                lookupYear = year.toString();
            }

            return studentData[program][lookupYear] || [];
        } catch (error) {
            console.error('Error fetching local students:', error);
            return [];
        }
    },

    // Get all unique programs available
    getAvailablePrograms: () => {
        return Object.keys(studentData);
    }
};
