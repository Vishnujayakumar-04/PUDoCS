/**
 * BTech 1st Year Student List
 * Complete list of students with Registration Number and Name
 * TODO: Add actual student data
 */

export const BTECH_1ST_YEAR_STUDENTS = [
    // TODO: Add BTech 1st Year students here
    // Format: { registerNumber: 'REGNO', name: 'STUDENT NAME' },
];

/**
 * Helper function to format student data for Firestore
 */
export const formatBTech1stYearStudentData = (registerNumber, name) => ({
    registerNumber: registerNumber.toUpperCase(),
    name: name.trim(),
    course: 'UG',
    program: 'BTech',
    year: 1,
    section: 'A',
    isActive: true,
    createdAt: new Date().toISOString(),
});

