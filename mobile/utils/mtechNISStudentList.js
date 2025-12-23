/**
 * M.Tech NIS 2nd Year Student List
 * Complete list of students with Registration Number and Name
 */

export const M_TECH_NIS_2ND_YEAR_STUDENTS = [
    { registerNumber: '24MTNISPY0001', name: 'Amarjeet Paswan' },
    { registerNumber: '24MTNISPY0002', name: 'Manish Kumar G.' },
    { registerNumber: '24MTNISPY0003', name: 'Sreeveni PA.' },
    { registerNumber: '24MTNISPY0004', name: 'Santanu Mondal' },
    { registerNumber: '24MTNISPY0005', name: 'Santhiya M.' },
    { registerNumber: '24MTNISPY0006', name: 'Farisha KR.' },
    { registerNumber: '24MTNISPY0007', name: 'Surajit Halder' },
    { registerNumber: '24MTNISPY0008', name: 'Devsri S.' },
    { registerNumber: '24MTNISPY0009', name: 'Kalpana A.' },
    { registerNumber: '24MTNISPY0010', name: 'Gopiga B.' },
    { registerNumber: '24MTNISPY0011', name: 'Jiva Bharathi M.' },
    { registerNumber: '24MTNISPY0012', name: 'Balavinayaga S.' },
    { registerNumber: '24MTNISPY0013', name: 'Sneha Lakra' },
    { registerNumber: '24MTNISPY0014', name: 'Ananthu Ajith' },
    { registerNumber: '24MTNISPY0015', name: 'Rajesh R.' },
    { registerNumber: '24MTNISPY0016', name: 'Swathi L.' },
    { registerNumber: '24MTNISPY0017', name: 'Dhanya R.' },
    { registerNumber: '24MTNISPY0018', name: 'Gods Graceson M. U' },
];

/**
 * Helper function to format student data for Firestore
 */
export const formatMtechNISStudentData = (registerNumber, name) => ({
    registerNumber: registerNumber.toUpperCase(),
    name: name.trim(),
    course: 'PG',
    program: 'M.Tech NIS',
    year: 2,
    section: 'A',
    isActive: true,
    createdAt: new Date().toISOString(),
});
