/**
 * BSc Computer Science 3rd Year Student List
 * Complete list of students with Registration Number and Name
 * TODO: Add actual student data
 */

export const BSC_CS_3RD_YEAR_STUDENTS = [
    // TODO: Add BSc CS 3rd Year students here
    // Format: { registerNumber: 'REGNO', name: 'STUDENT NAME' },
];

/**
 * Helper function to format student data for Firestore
 */
export const formatBScCS3rdYearStudentData = (registerNumber, name) => ({
    registerNumber: registerNumber.toUpperCase(),
    name: name.trim(),
    course: 'UG',
    program: 'BSc Computer Science',
    year: 3,
    section: 'A',
    isActive: true,
    createdAt: new Date().toISOString(),
});

