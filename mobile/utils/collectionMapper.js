/**
 * Collection Mapper Utility
 * Maps program and year to Firestore collection names
 * Creates separate databases for each class as requested
 */

/**
 * Get collection name for a student based on course, program, and year
 * @param {string} course - 'UG' or 'PG'
 * @param {string} program - Program name (e.g., 'BTech', 'M.Sc CS', etc.)
 * @param {number|string} year - Year (1, 2, 3, 4, 5, 6)
 * @returns {string} Collection name
 */
export const getStudentCollectionName = (course, program, year) => {
    const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
    
    // Normalize program name
    const normalizedProgram = program?.trim().toLowerCase() || '';
    
    if (course === 'UG') {
        // UG Collections
        if (normalizedProgram.includes('btech') || normalizedProgram.includes('b.tech')) {
            if (normalizedProgram.includes('it')) {
                return `students_ug_btech_it_${yearNum}`;
            } else if (normalizedProgram.includes('cse')) {
                return `students_ug_btech_cse_${yearNum}`;
            } else {
                return `students_ug_btech_${yearNum}`;
            }
        } else if (normalizedProgram.includes('bsc') && (normalizedProgram.includes('cs') || normalizedProgram.includes('computer science'))) {
            return `students_ug_bsc_cs_${yearNum}`;
        }
    } else if (course === 'PG') {
        // PG Collections
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
            if (normalizedProgram.includes('data analytics') || normalizedProgram.includes('da') || normalizedProgram.includes('ds & ai')) {
                return `students_pg_mtech_da_${yearNum}`;
            } else if (normalizedProgram.includes('nis')) {
                return `students_pg_mtech_nis_${yearNum}`;
            } else if (normalizedProgram.includes('cse')) {
                return `students_pg_mtech_cse_${yearNum}`;
            }
        }
    }
    
    // Fallback to generic collection if no match
    console.warn(`⚠️ No collection mapping found for: course=${course}, program=${program}, year=${yearNum}`);
    return `students_${course.toLowerCase()}_${normalizedProgram.replace(/\s+/g, '_')}_${yearNum}`;
};

/**
 * Get collection name from program display name and year
 * Used when program name comes from UI (e.g., "M.Sc Computer Science")
 */
export const getCollectionFromDisplayName = (programDisplayName, year) => {
    const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
    const program = programDisplayName?.trim().toLowerCase() || '';
    
    // Map common display names to collection names
    const mappings = {
        // UG Programs
        'btech': { course: 'UG', collection: `students_ug_btech_${yearNum}` },
        'b.tech': { course: 'UG', collection: `students_ug_btech_${yearNum}` },
        'bachelor of technology': { course: 'UG', collection: `students_ug_btech_${yearNum}` },
        'bsc computer science': { course: 'UG', collection: `students_ug_bsc_cs_${yearNum}` },
        'bsc cs': { course: 'UG', collection: `students_ug_bsc_cs_${yearNum}` },
        
        // PG Programs
        'msc computer science': { course: 'PG', collection: `students_pg_msc_cs_${yearNum}` },
        'msc cs': { course: 'PG', collection: `students_pg_msc_cs_${yearNum}` },
        'm.sc computer science': { course: 'PG', collection: `students_pg_msc_cs_${yearNum}` },
        'msc data analytics': { course: 'PG', collection: `students_pg_msc_da_${yearNum}` },
        'msc data analy': { course: 'PG', collection: `students_pg_msc_da_${yearNum}` },
        'msc cs integrated': { course: 'PG', collection: `students_pg_msc_cs_int_${yearNum}` },
        'mca': { course: 'PG', collection: `students_pg_mca_${yearNum}` },
        'master of computer applications': { course: 'PG', collection: `students_pg_mca_${yearNum}` },
        'mtech data analytics': { course: 'PG', collection: `students_pg_mtech_da_${yearNum}` },
        'mtech ds & ai': { course: 'PG', collection: `students_pg_mtech_da_${yearNum}` },
        'mtech nis': { course: 'PG', collection: `students_pg_mtech_nis_${yearNum}` },
        'mtech cse': { course: 'PG', collection: `students_pg_mtech_cse_${yearNum}` },
        'm.tech cse': { course: 'PG', collection: `students_pg_mtech_cse_${yearNum}` },
    };
    
    // Try exact match first
    for (const [key, value] of Object.entries(mappings)) {
        if (program.includes(key)) {
            return value.collection;
        }
    }
    
    // Fallback: try to infer from program name
    return getStudentCollectionName(
        program.includes('btech') || program.includes('bsc') ? 'UG' : 'PG',
        programDisplayName,
        yearNum
    );
};

/**
 * Get all collection names for a given course
 * @param {string} course - 'UG' or 'PG'
 * @returns {string[]} Array of collection names
 */
export const getAllCollectionsForCourse = (course) => {
    if (course === 'UG') {
        return [
            'students_ug_btech_it_1',
            'students_ug_btech_it_2',
            'students_ug_btech_it_3',
            'students_ug_btech_it_4',
            'students_ug_btech_cse_1',
            'students_ug_btech_cse_2',
            'students_ug_btech_cse_3',
            'students_ug_btech_cse_4',
            'students_ug_bsc_cs_1',
            'students_ug_bsc_cs_2',
            'students_ug_bsc_cs_3',
        ];
    } else if (course === 'PG') {
        return [
            'students_pg_msc_cs_2',
            'students_pg_msc_da_1',
            'students_pg_msc_cs_int_5',
            'students_pg_msc_cs_int_6',
            'students_pg_mca_2',
            'students_pg_mca_1',
            'students_pg_mtech_da_1',
            'students_pg_mtech_nis_2',
            'students_pg_mtech_cse_1',
            'students_pg_mtech_cse_2',
        ];
    }
    return [];
};

/**
 * Get all student collections
 * @returns {string[]} Array of all collection names
 */
export const getAllStudentCollections = () => {
    return [
        ...getAllCollectionsForCourse('UG'),
        ...getAllCollectionsForCourse('PG'),
    ];
};

/**
 * Get staff collection name
 * @returns {string} Collection name for staff
 */
export const getStaffCollectionName = () => {
    return 'staff';
};

/**
 * Parse collection name to get course, program, and year
 * @param {string} collectionName - Collection name (e.g., 'students_ug_btech_1')
 * @returns {object} { course, program, year }
 */
export const parseCollectionName = (collectionName) => {
    const parts = collectionName.split('_');
    if (parts.length < 4) return null;
    
    const course = parts[1] === 'ug' ? 'UG' : 'PG';
    const year = parseInt(parts[parts.length - 1], 10);
    
    let program = '';
    if (parts[1] === 'ug') {
        if (parts[2] === 'btech') {
            program = 'BTech';
        } else if (parts[2] === 'bsc' && parts[3] === 'cs') {
            program = 'BSc Computer Science';
        }
    } else if (parts[1] === 'pg') {
        if (parts[2] === 'msc') {
            if (parts[3] === 'cs') {
                if (parts[4] === 'int') {
                    program = 'M.Sc CS Integrated';
                } else {
                    program = 'M.Sc Computer Science';
                }
            } else if (parts[3] === 'ds') {
                program = 'M.Sc Data Science';
            }
        } else if (parts[2] === 'mca') {
            program = 'MCA';
        } else if (parts[2] === 'mtech') {
            if (parts[3] === 'da') {
                program = 'M.Tech Data Analytics';
            } else if (parts[3] === 'nis') {
                program = 'M.Tech NIS';
            } else if (parts[3] === 'cse') {
                program = 'M.Tech CSE';
            }
        }
    }
    
    return { course, program, year };
};

