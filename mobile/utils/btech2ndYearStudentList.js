/**
 * BTech 2nd Year Student List
 * Complete list of students with Registration Number and Name
 * TODO: Add actual student data
 */

export const BTECH_2ND_YEAR_STUDENTS = [
    // TODO: Add BTech 2nd Year students here
    // Format: { registerNumber: 'REGNO', name: 'STUDENT NAME' },
];

/**
 * Helper function to format student data for Firestore
 */
export const formatBTech2ndYearStudentData = (registerNumber, name) => ({
    registerNumber: registerNumber.toUpperCase(),
    name: name.trim(),
    course: 'UG',
    program: 'BTech',
    year: 2,
    section: 'A',
    isActive: true,
    createdAt: new Date().toISOString(),
});

