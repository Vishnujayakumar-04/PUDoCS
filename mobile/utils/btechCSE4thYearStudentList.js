/**
 * BTech CSE 4th Year Student List
 * Complete list of students with Registration Number and Name
 * TODO: Add actual student data
 */

export const BTECH_CSE_4TH_YEAR_STUDENTS = [
    // TODO: Add BTech CSE 4th Year students here
    // Format: { registerNumber: 'REGNO', name: 'STUDENT NAME' },
];

/**
 * Helper function to format student data for Firestore
 */
export const formatBTechCSE4thYearStudentData = (registerNumber, name) => ({
    registerNumber: registerNumber.toUpperCase(),
    name: name.trim(),
    course: 'UG',
    program: 'BTech CSE',
    year: 4,
    section: 'A',
    isActive: true,
    createdAt: new Date().toISOString(),
});

