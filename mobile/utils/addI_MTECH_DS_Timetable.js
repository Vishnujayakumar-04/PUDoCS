/**
 * Script to add I MTECH DS Timetable to both Database and Local Storage
 * Run this once to save the timetable
 */

import { saveTimetable } from './seedTimetable';
import timetableData from '../data/timetables/I_MTECH_DS_Timetable.json';

/**
 * Add I MTECH DS timetable to database and local storage
 */
export const addI_MTECH_DS_Timetable = async () => {
    try {
        console.log('📅 Adding I MTECH DS Timetable...');
        const result = await saveTimetable(timetableData);
        console.log('✅ I MTECH DS Timetable saved successfully!');
        console.log('   - Database: ✅ Saved');
        console.log('   - Local Storage: ✅ Saved');
        return result;
    } catch (error) {
        console.error('❌ Error adding I MTECH DS Timetable:', error);
        throw error;
    }
};

// Run if called directly
if (require.main === module) {
    addI_MTECH_DS_Timetable()
        .then(() => {
            console.log('✅ Timetable addition completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Failed to add timetable:', error);
            process.exit(1);
        });
}

export default addI_MTECH_DS_Timetable;

