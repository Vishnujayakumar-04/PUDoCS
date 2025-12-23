/**
 * M.Sc Computer Science Integrated 5th Year Student List
 * Complete list of students with Registration Number and Name
 */

export const MSC_CS_INTEGRATED_5TH_YEAR_STUDENTS = [
    { registerNumber: '22384101', name: 'Aarthi M' },
    { registerNumber: '22384103', name: 'Arathi Ramesh' },
    { registerNumber: '22384104', name: 'Athul Krishnan T R' },
    { registerNumber: '22384105', name: 'Balaji P' },
    { registerNumber: '22384106', name: 'Boda Kaveri' },
    { registerNumber: '22384107', name: 'Fuad PP' },
    { registerNumber: '22384108', name: 'Gokul G' },
    { registerNumber: '22384109', name: 'Harish P' },
    { registerNumber: '22384110', name: 'Indhumathi R' },
    { registerNumber: '22384111', name: 'Lakshmi Nandana B' },
    { registerNumber: '22384112', name: 'Leeladevi M' },
    { registerNumber: '22384113', name: 'Meesala Venkata Suresh' },
    { registerNumber: '22384114', name: 'Megavath Nandini' },
    { registerNumber: '22384115', name: 'Mohamed Rifath A' },
    { registerNumber: '22384116', name: 'Mohan Raju Donga' },
    { registerNumber: '22384117', name: 'Naresh T' },
    { registerNumber: '22384119', name: 'Pushpendra Yadav' },
    { registerNumber: '22384120', name: 'Shreya Sri K C' },
    { registerNumber: '22384121', name: 'Shwetha P' },
    { registerNumber: '22384122', name: 'Sivangi Sankar' },
    { registerNumber: '22384123', name: 'Suba P' },
    { registerNumber: '22384124', name: 'Chandu Tuvvadodi' },
    { registerNumber: '22384125', name: 'Vishnupriya S V' },
    { registerNumber: '22384126', name: 'Viswapriya R' },
    { registerNumber: '21384109', name: 'Ealaf Sherin AS' },
    { registerNumber: '21384130', name: 'Vidhyashree S' },
];

/**
 * Helper function to format student data for Firestore
 */
export const formatMscCSIntegrated5thYearStudentData = (registerNumber, name) => ({
    registerNumber: registerNumber.toUpperCase(),
    name: name.trim(),
    course: 'PG',
    program: 'M.Sc CS Integrated',
    year: 5,
    section: 'A',
    isActive: true,
    createdAt: new Date().toISOString(),
});
