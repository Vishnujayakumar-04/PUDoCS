/**
 * Collection Mapper Utility
 * Maps program and year to Firestore collection names
 */

export const getStudentCollectionName = (course, program, year) => {
    const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
    const normalizedProgram = program?.trim().toLowerCase() || '';

    if (course === 'UG') {
        if (normalizedProgram.includes('btech') || normalizedProgram.includes('b.tech')) {
            if (normalizedProgram.includes('cse')) {
                return `students_ug_btech_cse_${yearNum}`;
            }
        } else if (normalizedProgram.includes('bsc') && (normalizedProgram.includes('cs') || normalizedProgram.includes('computer science'))) {
            return `students_ug_bsc_cs_${yearNum}`;
        }
    } else if (course === 'PG') {
        if (normalizedProgram.includes('msc') || normalizedProgram.includes('m.sc')) {
            if (normalizedProgram.includes('data analytics') || normalizedProgram.includes('data analy')) {
                return `students_pg_msc_da_${yearNum}`;
            } else if (normalizedProgram.includes('cs integrated') || normalizedProgram.includes('integrated')) {
                return `students_pg_msc_cs_int_${yearNum}`;
            } else if (normalizedProgram.includes('cs') || normalizedProgram.includes('computer science')) {
                return `students_pg_msc_cs_${yearNum}`;
            }
        } else if (normalizedProgram.includes('mca')) {
            return `students_pg_mca_${yearNum}`;
        } else if (normalizedProgram.includes('mtech') || normalizedProgram.includes('m.tech')) {
            if (normalizedProgram.includes('data analytics') || normalizedProgram.includes('data science') || normalizedProgram.includes('da') || normalizedProgram.includes('ds & ai') || normalizedProgram.includes('ds')) {
                return `students_pg_mtech_da_${yearNum}`;
            } else if (normalizedProgram.includes('nis') || normalizedProgram.includes('network')) {
                return `students_pg_mtech_nis_${yearNum}`;
            } else if (normalizedProgram.includes('cse') || normalizedProgram.includes('computer science')) {
                return `students_pg_mtech_cse_${yearNum}`;
            }
        }
    }

    return `students_${course.toLowerCase()}_${normalizedProgram.replace(/\s+/g, '_')}_${yearNum}`;
};

export const getCollectionFromDisplayName = (programDisplayName, year) => {
    const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
    const program = programDisplayName?.trim().toLowerCase() || '';

    const mappings = {
        'btech': { course: 'UG', collection: `students_ug_btech_${yearNum}` },
        'b.tech': { course: 'UG', collection: `students_ug_btech_${yearNum}` },
        'bsc computer science': { course: 'UG', collection: `students_ug_bsc_cs_${yearNum}` },
        'bsc cs': { course: 'UG', collection: `students_ug_bsc_cs_${yearNum}` },
        'msc computer science': { course: 'PG', collection: `students_pg_msc_cs_${yearNum}` },
        'msc cs': { course: 'PG', collection: `students_pg_msc_cs_${yearNum}` },
        'msc data analytics': { course: 'PG', collection: `students_pg_msc_da_${yearNum}` },
        'msc cs integrated': { course: 'PG', collection: `students_pg_msc_cs_int_${yearNum}` },
        'mca': { course: 'PG', collection: `students_pg_mca_${yearNum}` },
        'mtech data analytics': { course: 'PG', collection: `students_pg_mtech_da_${yearNum}` },
        'mtech data science': { course: 'PG', collection: `students_pg_mtech_da_${yearNum}` },
        'mtech cse': { course: 'PG', collection: `students_pg_mtech_cse_${yearNum}` },
        'mtech nis': { course: 'PG', collection: `students_pg_mtech_nis_${yearNum}` },
    };

    for (const [key, value] of Object.entries(mappings)) {
        if (program.includes(key)) return value.collection;
    }

    return getStudentCollectionName(
        program.includes('btech') || program.includes('bsc') ? 'UG' : 'PG',
        programDisplayName,
        yearNum
    );
};

export const getAllCollectionsForCourse = (course) => {
    if (course === 'UG') {
        return ['students_ug_btech_cse_1', 'students_ug_btech_cse_2', 'students_ug_bsc_cs_1', 'students_ug_bsc_cs_2', 'students_ug_bsc_cs_3'];
    } else if (course === 'PG') {
        return ['students_pg_msc_cs_2', 'students_pg_msc_da_1', 'students_pg_msc_cs_int_1', 'students_pg_mca_1', 'students_pg_mca_2', 'students_pg_mtech_da_1', 'students_pg_mtech_cse_1'];
    }
    return [];
};

export const getAllStudentCollections = () => [...getAllCollectionsForCourse('UG'), ...getAllCollectionsForCourse('PG')];
export const getStaffCollectionName = () => 'staff';
