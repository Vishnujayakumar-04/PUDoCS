/**
 * M.Sc Computer Science Integrated 6th Year Student List
 * Complete list of students with Registration Number and Name
 */

export const MSC_CS_INTEGRATED_6TH_YEAR_STUDENTS = [
    { registerNumber: '21384101', name: 'ABHINAND P S' },
    { registerNumber: '21384102', name: 'ANJANA V' },
    { registerNumber: '21384104', name: 'ATHIRA K' },
    { registerNumber: '21384105', name: 'DAWOOD HAIDER KHAN' },
    { registerNumber: '21384106', name: 'DEEKSHITH V P' },
    { registerNumber: '21384107', name: 'DEVAN V' },
    { registerNumber: '21384108', name: 'DINESHKUMAR T' },
    { registerNumber: '21384111', name: 'KARTHIKEYAN AK' },
    { registerNumber: '21384112', name: 'KOORU MAHEY V' },
    { registerNumber: '21384113', name: 'KRISHNANAND YADAV' },
    { registerNumber: '21384114', name: 'MAHESH E' },
    { registerNumber: '21384116', name: 'PADMAJHA' },
    { registerNumber: '21384119', name: 'SADHEED' },
    { registerNumber: '21384122', name: 'SENGKATHIRSELVAN B' },
    { registerNumber: '21384123', name: 'SINDHU BHARATHI P G' },
    { registerNumber: '21384124', name: 'SOWMIYA P' },
    { registerNumber: '21384125', name: 'SREEHARI S' },
    { registerNumber: '21384126', name: 'NAVINASRI S' },
    { registerNumber: '21384128', name: 'SURIYAMOORTHI G' },
    { registerNumber: '21384129', name: 'THINESH KUMAR S' },
];

/**
 * Helper function to format student data for Firestore
 */
export const formatMscCSIntegratedStudentData = (registerNumber, name) => ({
    registerNumber: registerNumber.toUpperCase(),
    name: name.trim(),
    course: 'PG',
    program: 'M.Sc CS Integrated',
    year: 6,
    section: 'A',
    isActive: true,
    createdAt: new Date().toISOString(),
});
