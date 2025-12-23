/**
 * M.Tech CSE 2nd Year Student List
 * Complete list of students with Registration Number and Name
 */

export const M_TECH_CSE_2ND_YEAR_STUDENTS = [
    { registerNumber: '24MTCSEPY0001', name: 'SRIMAN D' },
    { registerNumber: '24MTCSEPY0004', name: 'AMJAD ZAMAN J' },
    { registerNumber: '24MTCSEPY0005', name: 'KIRTHIVERSHA M' },
    { registerNumber: '24MTCSEPY0006', name: 'SUBHIKSHA R' },
    { registerNumber: '24MTCSEPY0007', name: 'MONISHA N' },
    { registerNumber: '24MTCSEPY0008', name: 'LAVUDYA VASANTH RAO' },
    { registerNumber: '24MTCSEPY0009', name: 'ANKIT KUMAR' },
    { registerNumber: '24MTCSEPY0010', name: 'ANABHAYAN S' },
    { registerNumber: '24MTCSEPY0011', name: 'M SINDUJA' },
    { registerNumber: '24MTCSEPY0012', name: 'HARSHIT RAJ' },
    { registerNumber: '24MTCSEPY0013', name: 'SRI GURUBAGHUVELA D' },
    { registerNumber: '24MTCSEPY0014', name: 'DHANUSH KUMAR S' },
    { registerNumber: '24MTCSEPY0015', name: 'M MANISHA' },
    { registerNumber: '24MTCSEPY0016', name: 'SANTHAKUMAR R' },
    { registerNumber: '24MTCSEPY0017', name: 'HEMA N' },
    { registerNumber: '24MTCSEPY0018', name: 'KOLA VARUN CHANDRA' },
    { registerNumber: '24MTCSEPY0019', name: 'KOTTE SAI GANESH' },
    { registerNumber: '24MTCSEPY0020', name: 'ANANYA GAUTAM' },
    { registerNumber: '24MTCSEPY0021', name: 'N GOKULNATH' },
    { registerNumber: '24MTCSEPY0023', name: 'SAKTHIVEL V' },
];

/**
 * Helper function to format student data for Firestore
 */
export const formatMtechCSEStudentData = (registerNumber, name) => ({
    registerNumber: registerNumber.toUpperCase(),
    name: name.trim(),
    course: 'PG',
    program: 'M.Tech CSE',
    year: 2,
    section: 'A',
    isActive: true,
    createdAt: new Date().toISOString(),
});
