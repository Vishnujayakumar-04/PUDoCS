/**
 * M.Tech CSE 1st Year Student List
 * Complete list of students with Registration Number and Name
 */

export const M_TECH_CSE_1ST_YEAR_STUDENTS = [
    { registerNumber: '25MTCSEPY0003', name: 'P OM SHIVA' },
    { registerNumber: '25MTCSEPY0004', name: 'SNEKHA S' },
    { registerNumber: '25MTCSEPY0005', name: 'MOHANAPRIYA M' },
    { registerNumber: '25MTCSEPY0006', name: 'S KRISHNA PRANIL' },
    { registerNumber: '25MTCSEPY0007', name: 'P REETHU JOYCEY' },
    { registerNumber: '25MTCSEPY0008', name: 'CHINTHAKINDI BHANU' },
    { registerNumber: '25MTCSEPY0009', name: 'CHINTHA HASA SRI' },
    { registerNumber: '25MTCSEPY0010', name: 'ANUJITH BALAN' },
    { registerNumber: '25MTCSEPY0011', name: 'ASHMI C L' },
    { registerNumber: '25MTCSEPY0013', name: 'VISWANATH M' },
    { registerNumber: '25MTCSEPY0014', name: 'M NANTHAKUMAR' },
    { registerNumber: '25MTCSEPY0016', name: 'VISHNU VARDHAN P' },
    { registerNumber: '25MTCSEPY0017', name: 'YOUGAARAJ R' },
    { registerNumber: '25MTCSEPY0018', name: 'DHINESH G' },
    { registerNumber: '25MTCSEPY0019', name: 'ABISHEK S' },
    { registerNumber: '25MTCSEPY0020', name: 'ANBIRKAVIN A' },
];

/**
 * Helper function to format student data for Firestore
 */
export const formatMtechCSE1stYearStudentData = (registerNumber, name) => ({
    registerNumber: registerNumber.toUpperCase(),
    name: name.trim(),
    course: 'PG',
    program: 'M.Tech CSE',
    year: 1,
    section: 'A',
    isActive: true,
    createdAt: new Date().toISOString(),
});
