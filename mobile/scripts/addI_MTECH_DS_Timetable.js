/**
 * Script to add I MTECH DS Timetable to both Database and Local Storage
 * 
 * Usage: Import and call this function from your app or run directly
 */

import { saveTimetable } from '../utils/seedTimetable';
import timetableData from '../data/timetables/I_MTECH_DS_Timetable.json';

/**
 * Add I MTECH DS timetable to database and local storage
 */
export const addI_MTECH_DS_Timetable = async () => {
    try {
        console.log('📅 Adding I MTECH DS Timetable...');
        console.log(`   Program: ${timetableData.program}`);
        console.log(`   Year: ${timetableData.year}`);
        console.log(`   Room: ${timetableData.room}`);
        console.log(`   Subjects: ${timetableData.subjects.length}`);
        
        const result = await saveTimetable(timetableData);
        
        console.log('\n✅ I MTECH DS Timetable saved successfully!');
        console.log(`   - Database ID: ${result.id}`);
        console.log('   - Database: ✅ Saved');
        console.log('   - Local Storage: ✅ Saved');
        console.log(`   - Storage Key: timetable_${timetableData.program}_${timetableData.year}`);
        
        return result;
    } catch (error) {
        console.error('❌ Error adding I MTECH DS Timetable:', error);
        throw error;
    }
};

export default addI_MTECH_DS_Timetable;

