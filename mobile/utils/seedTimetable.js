/**
 * Utility to seed Timetables to Firestore and Local Storage
 * Run this for each class timetable separately
 */

import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../services/firebaseConfig';

/**
 * Save timetable to both Firestore and Local Storage
 * @param {Object} timetableData - Timetable data object
 * @returns {Promise<Object>} Saved timetable with ID
 */
export const saveTimetable = async (timetableData) => {
    try {
        const { program, year } = timetableData;
        
        if (!program || !year) {
            throw new Error('Program and year are required');
        }

        // Normalize year to number format (convert "I" to 1, "II" to 2, etc.)
        const normalizedYear = typeof year === 'string' ? 
            (year === 'I' ? 1 : year === 'II' ? 2 : year === 'III' ? 3 : year === 'IV' ? 4 : parseInt(year, 10)) : 
            year;
        
        // Update timetable data with normalized year
        const normalizedData = {
            ...timetableData,
            year: normalizedYear
        };

        // Check if timetable already exists in Firestore - try both formats
        const queries = [
            query(
                collection(db, 'timetables'),
                where('program', '==', program),
                where('year', '==', normalizedYear)
            ),
            query(
                collection(db, 'timetables'),
                where('program', '==', program),
                where('year', '==', year) // Try original format too
            )
        ];

        let docId;
        let savedData;
        let existingDoc = null;

        // Check both queries to find existing timetable
        for (const q of queries) {
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                existingDoc = snapshot.docs[0];
                break;
            }
        }

        if (existingDoc) {
            // Update existing timetable
            docId = existingDoc.id;
            const docRef = doc(db, 'timetables', docId);
            savedData = {
                ...normalizedData,
                updatedAt: new Date().toISOString(),
            };
            await updateDoc(docRef, savedData);
            console.log(`✅ Timetable updated in database: ${program} - Year ${normalizedYear}`);
        } else {
            // Create new timetable
            savedData = {
                ...normalizedData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const docRef = await addDoc(collection(db, 'timetables'), savedData);
            docId = docRef.id;
            console.log(`✅ Timetable created in database: ${program} - Year ${normalizedYear}`);
        }

        // Save to local storage with normalized year
        const storageKey = `timetable_${program}_${normalizedYear}`;
        await AsyncStorage.setItem(storageKey, JSON.stringify(savedData));
        console.log(`✅ Timetable saved to local storage: ${program} - Year ${normalizedYear}`);

        return { id: docId, ...savedData };
    } catch (error) {
        console.error('❌ Error saving timetable:', error);
        throw error;
    }
};

/**
 * Get timetable from local storage (for quick access)
 * @param {string} program - Program name
 * @param {string|number} year - Year
 * @returns {Promise<Object|null>} Timetable data or null
 */
export const getTimetableFromStorage = async (program, year) => {
    try {
        const storageKey = `timetable_${program}_${year}`;
        const data = await AsyncStorage.getItem(storageKey);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting timetable from storage:', error);
        return null;
    }
};

/**
 * Clear all timetables from local storage
 */
export const clearAllTimetablesFromStorage = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const timetableKeys = keys.filter(key => key.startsWith('timetable_'));
        await AsyncStorage.multiRemove(timetableKeys);
        console.log('✅ All timetables cleared from local storage');
    } catch (error) {
        console.error('Error clearing timetables from storage:', error);
    }
};

/**
 * Clear specific timetable from local storage
 * @param {string} program - Program name
 * @param {string|number} year - Year
 */
export const clearTimetableFromStorage = async (program, year) => {
    try {
        const storageKey = `timetable_${program}_${year}`;
        await AsyncStorage.removeItem(storageKey);
        console.log(`✅ Timetable cleared from local storage: ${program} - Year ${year}`);
    } catch (error) {
        console.error('Error clearing timetable from storage:', error);
    }
};

export default {
    saveTimetable,
    getTimetableFromStorage,
    clearAllTimetablesFromStorage,
    clearTimetableFromStorage,
};
