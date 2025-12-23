/**
 * BSc Computer Science 1st Year Student List
 * Complete list of students with Registration Number and Name
 * TODO: Add actual student data
 */

export const BSC_CS_1ST_YEAR_STUDENTS = [
    // TODO: Add BSc CS 1st Year students here
    // Format: { registerNumber: 'REGNO', name: 'STUDENT NAME' },
];

/**
 * Helper function to format student data for Firestore
 */
export const formatBScCS1stYearStudentData = (registerNumber, name) => ({
    registerNumber: registerNumber.toUpperCase(),
    name: name.trim(),
    course: 'UG',
    program: 'BSc Computer Science',
    year: 1,
    section: 'A',
    isActive: true,
    createdAt: new Date().toISOString(),
});

