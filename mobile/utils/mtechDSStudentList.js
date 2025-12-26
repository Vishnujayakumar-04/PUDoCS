/**
 * M.Tech Data Science & AI (DS & AI) 1st Year Student List
 * Complete list of students with Registration Number and Name
 */

export const M_TECH_DS_1ST_YEAR_STUDENTS = [
    { registerNumber: '25MTNISPY0002', name: 'Durgadevi' },
    { registerNumber: '25MTNISPY0003', name: 'Vijayadamodaran N' },
    { registerNumber: '25MTNISPY0004', name: 'Rachakonda Sagar' },
    { registerNumber: '25MTNISPY0005', name: 'Ayesetty Jaswanth Sai Raj' },
    { registerNumber: '25MTNISPY0006', name: 'Davinsi Ragamalika M' },
    { registerNumber: '25MTNISPY0007', name: 'Naveenraj N' },
    { registerNumber: '25MTNISPY0008', name: 'Gokulakannan C' },
    { registerNumber: '25MTNISPY0009', name: 'Santhosh V' },
    { registerNumber: '25MTNISPY0010', name: 'Anandhakumar P' },
    { registerNumber: '25MTNISPY0011', name: 'Monika K' },
    { registerNumber: '25MTNISPY0012', name: 'Preethi Ravi' },
    { registerNumber: '25MTNISPY0013', name: 'Asvina S' },
    { registerNumber: '25MTNISPY0014', name: 'Lagudu Yernaidu' },
    { registerNumber: '25MTNISPY0015', name: 'Akash J' },
    { registerNumber: '25MTNISPY0017', name: 'Harish S' },
    { registerNumber: '25MTNISPY0018', name: 'Eashwar R' },
    { registerNumber: '25MTNISPY0019', name: 'Harshath K' },
    { registerNumber: '25MTNISPY0020', name: 'Kishore Chakkaravarthi M N' },
    { registerNumber: '25MTNISPY0023', name: 'Arun' },
    { registerNumber: '25MTNISPY0024', name: 'Agilan A' },
    { registerNumber: '25MTNISPY0025', name: 'Praveena' },
    { registerNumber: '25MTNISPY0026', name: 'Sivaprrasath S J' },
];

// Export formatStudentData alias for backward compatibility
export const formatStudentData = formatMtechDSStudentData;

/**
 * Helper function to format student data for Firestore
 */
export const formatMtechDSStudentData = (registerNumber, name) => ({
    registerNumber: registerNumber.toUpperCase(),
    name: name.trim(),
    course: 'PG',
    program: 'M.Tech Data Analytics',
    year: 1,
    section: 'A',
    isActive: true,
    createdAt: new Date().toISOString(),
});
