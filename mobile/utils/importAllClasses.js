/**
 * Import functions for all PG classes
 * Uses the generic addStudentsByClass utility
 * 
 * PG Programs (10 classes in order):
 * 1. M.Sc CS - 2nd Year
 * 2. M.Sc Data Analytics - 1st Year
 * 3. M.Sc CS Integrated - 5th Year
 * 4. M.Sc CS Integrated - 6th Year
 * 5. MCA - 2nd Year
 * 6. MCA - 1st Year
 * 7. M.Tech DS & AI - 1st Year
 * 8. M.Tech NIS - 2nd Year
 * 9. M.Tech CSE - 1st Year
 * 10. M.Tech CSE - 2nd Year
 */

import { addStudentsByClass } from './addStudentsByClass';
import { MSC_CS_2ND_YEAR_STUDENTS } from './mscCSStudentList';
import { MSC_DA_1ST_YEAR_STUDENTS } from './mscDS1stYearStudentList';
import { MSC_CS_INTEGRATED_5TH_YEAR_STUDENTS } from './mscCSIntegrated5thYearStudentList';
import { MSC_CS_INTEGRATED_6TH_YEAR_STUDENTS } from './mscCSIntegratedStudentList';
import { MCA_2ND_YEAR_STUDENTS } from './mca2ndYearStudentList';
import { MCA_1ST_YEAR_STUDENTS } from './mca1stYearStudentList';
import { M_TECH_DS_1ST_YEAR_STUDENTS } from './mtechDSStudentList';
import { M_TECH_NIS_2ND_YEAR_STUDENTS } from './mtechNISStudentList';
import { M_TECH_CSE_1ST_YEAR_STUDENTS } from './mtechCSE1stYearStudentList';
import { M_TECH_CSE_2ND_YEAR_STUDENTS } from './mtechCSEStudentList';

/**
 * 1. Import M.Sc CS 2nd Year
 */
export const importMscCS2ndYear = async () => {
    return await addStudentsByClass(
        MSC_CS_2ND_YEAR_STUDENTS,
        'PG',
        'M.Sc CS',
        2
    );
};

/**
 * 2. Import M.Sc Data Analytics 1st Year
 */
export const importMscDA1stYear = async () => {
    return await addStudentsByClass(
        MSC_DA_1ST_YEAR_STUDENTS,
        'PG',
        'M.Sc Data Analytics',
        1
    );
};

/**
 * 3. Import M.Sc CS Integrated 5th Year
 */
export const importMscCSIntegrated5thYear = async () => {
    return await addStudentsByClass(
        MSC_CS_INTEGRATED_5TH_YEAR_STUDENTS,
        'PG',
        'M.Sc CS Integrated',
        5
    );
};

/**
 * 4. Import M.Sc CS Integrated 6th Year
 */
export const importMscCSIntegrated6thYear = async () => {
    return await addStudentsByClass(
        MSC_CS_INTEGRATED_6TH_YEAR_STUDENTS,
        'PG',
        'M.Sc CS Integrated',
        6
    );
};

/**
 * 5. Import MCA 2nd Year
 */
export const importMCA2ndYear = async () => {
    return await addStudentsByClass(
        MCA_2ND_YEAR_STUDENTS,
        'PG',
        'MCA',
        2
    );
};

/**
 * 6. Import MCA 1st Year
 */
export const importMCA1stYear = async () => {
    return await addStudentsByClass(
        MCA_1ST_YEAR_STUDENTS,
        'PG',
        'MCA',
        1
    );
};

/**
 * 7. Import M.Tech Data Analytics 1st Year
 */
export const importMtechDS1stYear = async () => {
    return await addStudentsByClass(
        M_TECH_DS_1ST_YEAR_STUDENTS,
        'PG',
        'M.Tech Data Analytics',
        1
    );
};

/**
 * 8. Import M.Tech NIS 2nd Year
 */
export const importMtechNIS2ndYear = async () => {
    return await addStudentsByClass(
        M_TECH_NIS_2ND_YEAR_STUDENTS,
        'PG',
        'M.Tech NIS',
        2
    );
};

/**
 * 9. Import M.Tech CSE 1st Year
 */
export const importMtechCSE1stYear = async () => {
    return await addStudentsByClass(
        M_TECH_CSE_1ST_YEAR_STUDENTS,
        'PG',
        'M.Tech CSE',
        1
    );
};

/**
 * 10. Import M.Tech CSE 2nd Year
 */
export const importMtechCSE2ndYear = async () => {
    return await addStudentsByClass(
        M_TECH_CSE_2ND_YEAR_STUDENTS,
        'PG',
        'M.Tech CSE',
        2
    );
};
