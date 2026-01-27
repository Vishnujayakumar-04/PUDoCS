/**
 * M.Sc Computer Science 1st Year Student List
 * Complete list of students with Registration Number and Name
 */

export const MSC_CS_1ST_YEAR_STUDENTS = [
    { registerNumber: '25MSCSCPY0001', name: 'AHAMED THIJANI PP' },
    { registerNumber: '25MSCSCPY0002', name: 'AKUDARI VARSHA' },
    { registerNumber: '25MSCSCPY0003', name: 'PAMPATTIWAR SHREEVASTHAV' },
    { registerNumber: '25MSCSCPY0004', name: 'SHARON BENZY' },
    { registerNumber: '25MSCSCPY0005', name: 'G MUGILAN' },
    { registerNumber: '25MSCSCPY0006', name: 'AMAN KUMAR' },
    { registerNumber: '25MSCSCPY0008', name: 'RONAK' },
    { registerNumber: '25MSCSCPY0009', name: 'MUHAMMED SAFWAN AHAMMED A' },
    { registerNumber: '25MSCSCPY0010', name: 'AYUSH KUMAR GUPTA' },
    { registerNumber: '25MSCSCPY0011', name: 'ADHEERA P K' },
    { registerNumber: '25MSCSCPY0012', name: 'VYSAKH BINU' },
    { registerNumber: '25MSCSCPY0013', name: 'RAMAKURI MANOJ KUMAR' },
    { registerNumber: '25MSCSCPY0014', name: 'SREELAKSHMI M S' },
    { registerNumber: '25MSCSCPY0015', name: 'NALLA SHYAMAL' },
    { registerNumber: '25MSCSCPY0016', name: 'ARIBA RAHMANI' },
    { registerNumber: '25MSCSCPY0017', name: 'RAGUL E' },
    { registerNumber: '25MSCSCPY0018', name: 'KOMARA VAMSI PHANINDRA' },
    { registerNumber: '25MSCSCPY0019', name: 'R SARAVANAN' },
    { registerNumber: '25MSCSCPY0020', name: 'GOKUL KRISHNAN V' },
    { registerNumber: '25MSCSCPY0021', name: 'SASITHA' },
    { registerNumber: '25MSCSCPY0022', name: 'BYAGARI NIKHIL KUMAR' },
    { registerNumber: '25MSCSCPY0023', name: 'DARA UJWALA SAI KUMAR' },
    { registerNumber: '25MSCSCPY0024', name: 'PUJARINI PADHAN' },
    { registerNumber: '25MSCSCPY0025', name: 'CHENNAM PRASHANTH REDDY' },
    { registerNumber: '25MSCSCPY0027', name: 'ILAVARASU DIMANCHE' },
    { registerNumber: '25MSCSCPY0028', name: 'K VARUN TEJA' },
    { registerNumber: '25MSCSCPY0030', name: 'ASHWIN' },
    { registerNumber: '25MSCSCPY0031', name: 'SHIFIN MUSTHAFA P P' },
    { registerNumber: '25MSCSCPY0032', name: 'VIGNESH R' },
    { registerNumber: '25MSCSCPY0033', name: 'SUNKARI SHIVA KRISHNA' },
    { registerNumber: '25MSCSCPY0034', name: 'SATHYADARSHAN S' },
    { registerNumber: '25MSCSCPY0036', name: 'GOWSIGAN' },
    { registerNumber: '25MSCSCPY0037', name: 'DAMODHARAN R' },
    { registerNumber: '25MSCSCPY0038', name: 'SHANAMONI SRAVANI' },
    { registerNumber: '25MSCSCPY0039', name: 'MUTHUKUMAR V' },
    { registerNumber: '25MSCSCPY0040', name: 'POONGUZHALI S' },
    { registerNumber: '25MSCSCPY0041', name: 'ARATHI RAMESH' },
    { registerNumber: '25MSCSCPY0042', name: 'LANA FATHIMA' },
    { registerNumber: '25MSCSCPY0043', name: 'MONESH S' },
    { registerNumber: '25MSCSCPY0045', name: 'SURUTHI T' },
    { registerNumber: '25MSCSCPY0046', name: 'PRAVIN P' },
    { registerNumber: '25MSCSCPY0047', name: 'RAHUL N' },
    { registerNumber: '25MSCSCPY0049', name: 'S KAVIYAPRIYA' },
    { registerNumber: '25MSCSCPY0050', name: 'S RAMKUMAR' },
    { registerNumber: '25MSCSCPY0051', name: 'MOHAMMED AKEED ANEES P K' },
    { registerNumber: '25MSCSCPY0052', name: 'MOHAMMED HAFIZ N M' },
];

/**
 * Helper function to format student data for Firestore
 */
export const formatMscCS1stYearStudentData = (registerNumber, name) => ({
    name: name.trim(),
    registerNumber: registerNumber.trim().toUpperCase(),
    email: `${registerNumber.trim().toLowerCase()}@pondiuni.ac.in`,
    course: 'PG',
    program: 'M.Sc CS',
    year: 1,
    academicYear: '2025-2026',
    section: 'A',
    isActive: true,
    createdAt: new Date().toISOString(),
});
