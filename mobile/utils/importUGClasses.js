/**
 * Import functions for all UG classes
 * Uses the generic addStudentsByClass utility
 * 
 * UG Programs (11 classes):
 * BTech IT:
 * 1. BTech IT - 1st Year
 * 2. BTech IT - 2nd Year
 * 3. BTech IT - 3rd Year
 * 4. BTech IT - 4th Year
 * BTech CSE:
 * 5. BTech CSE - 1st Year
 * 6. BTech CSE - 2nd Year
 * 7. BTech CSE - 3rd Year
 * 8. BTech CSE - 4th Year
 * BSc CS:
 * 9. BSc CS - 1st Year
 * 10. BSc CS - 2nd Year
 * 11. BSc CS - 3rd Year
 */

import { addStudentsByClass } from './addStudentsByClass';
import { BTECH_IT_1ST_YEAR_STUDENTS } from './btechIT1stYearStudentList';
import { BTECH_IT_2ND_YEAR_STUDENTS } from './btechIT2ndYearStudentList';
import { BTECH_IT_3RD_YEAR_STUDENTS } from './btechIT3rdYearStudentList';
import { BTECH_IT_4TH_YEAR_STUDENTS } from './btechIT4thYearStudentList';
import { BTECH_CSE_1ST_YEAR_STUDENTS } from './btechCSE1stYearStudentList';
import { BTECH_CSE_2ND_YEAR_STUDENTS } from './btechCSE2ndYearStudentList';
import { BTECH_CSE_3RD_YEAR_STUDENTS } from './btechCSE3rdYearStudentList';
import { BTECH_CSE_4TH_YEAR_STUDENTS } from './btechCSE4thYearStudentList';
import { BSC_CS_1ST_YEAR_STUDENTS } from './bscCS1stYearStudentList';
import { BSC_CS_2ND_YEAR_STUDENTS } from './bscCS2ndYearStudentList';
import { BSC_CS_3RD_YEAR_STUDENTS } from './bscCS3rdYearStudentList';

/**
 * 1. Import BTech IT 1st Year
 */
export const importBTechIT1stYear = async () => {
    return await addStudentsByClass(
        BTECH_IT_1ST_YEAR_STUDENTS,
        'UG',
        'BTech IT',
        1
    );
};

/**
 * 2. Import BTech IT 2nd Year
 */
export const importBTechIT2ndYear = async () => {
    return await addStudentsByClass(
        BTECH_IT_2ND_YEAR_STUDENTS,
        'UG',
        'BTech IT',
        2
    );
};

/**
 * 3. Import BTech IT 3rd Year
 */
export const importBTechIT3rdYear = async () => {
    return await addStudentsByClass(
        BTECH_IT_3RD_YEAR_STUDENTS,
        'UG',
        'BTech IT',
        3
    );
};

/**
 * 4. Import BTech IT 4th Year
 */
export const importBTechIT4thYear = async () => {
    return await addStudentsByClass(
        BTECH_IT_4TH_YEAR_STUDENTS,
        'UG',
        'BTech IT',
        4
    );
};

/**
 * 5. Import BTech CSE 1st Year
 */
export const importBTechCSE1stYear = async () => {
    return await addStudentsByClass(
        BTECH_CSE_1ST_YEAR_STUDENTS,
        'UG',
        'BTech CSE',
        1
    );
};

/**
 * 6. Import BTech CSE 2nd Year
 */
export const importBTechCSE2ndYear = async () => {
    return await addStudentsByClass(
        BTECH_CSE_2ND_YEAR_STUDENTS,
        'UG',
        'BTech CSE',
        2
    );
};

/**
 * 7. Import BTech CSE 3rd Year
 */
export const importBTechCSE3rdYear = async () => {
    return await addStudentsByClass(
        BTECH_CSE_3RD_YEAR_STUDENTS,
        'UG',
        'BTech CSE',
        3
    );
};

/**
 * 8. Import BTech CSE 4th Year
 */
export const importBTechCSE4thYear = async () => {
    return await addStudentsByClass(
        BTECH_CSE_4TH_YEAR_STUDENTS,
        'UG',
        'BTech CSE',
        4
    );
};

/**
 * 9. Import BSc CS 1st Year
 */
export const importBScCS1stYear = async () => {
    return await addStudentsByClass(
        BSC_CS_1ST_YEAR_STUDENTS,
        'UG',
        'BSc Computer Science',
        1
    );
};

/**
 * 10. Import BSc CS 2nd Year
 */
export const importBScCS2ndYear = async () => {
    return await addStudentsByClass(
        BSC_CS_2ND_YEAR_STUDENTS,
        'UG',
        'BSc Computer Science',
        2
    );
};

/**
 * 11. Import BSc CS 3rd Year
 */
export const importBScCS3rdYear = async () => {
    return await addStudentsByClass(
        BSC_CS_3RD_YEAR_STUDENTS,
        'UG',
        'BSc Computer Science',
        3
    );
};
