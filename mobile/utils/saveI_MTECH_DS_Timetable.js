/**
 * Quick script to save I MTECH DS Timetable
 * Run this once to save the timetable to database and local storage
 */

import { saveTimetable } from './seedTimetable';
import timetableData from '../data/timetables/I_MTECH_DS_Timetable.json';

/**
 * Save I MTECH DS timetable
 * Call this function once to save the timetable
 */
export const saveI_MTECH_DS_Timetable = async () => {
    try {
        console.log('🚀 Saving I MTECH DS Timetable...');
        console.log(`   Program: ${timetableData.program}`);
        console.log(`   Year: ${timetableData.year}`);
        console.log(`   Class: ${timetableData.class}`);
        console.log(`   Room: ${timetableData.room}`);
        console.log(`   Subjects: ${timetableData.subjects?.length || 0}`);
        
        const result = await saveTimetable(timetableData);
        
        console.log('\n✅ SUCCESS! I MTECH DS Timetable saved:');
        console.log(`   - Database ID: ${result.id}`);
        console.log(`   - Database: ✅ Saved`);
        console.log(`   - Local Storage: ✅ Saved`);
        console.log(`   - Storage Key: timetable_${timetableData.program}_${timetableData.year}`);
        console.log('\n📱 The timetable will now appear in the app!');
        
        return result;
    } catch (error) {
        console.error('\n❌ ERROR saving I MTECH DS Timetable:');
        console.error(error);
        throw error;
    }
};

// Export default for easy import
export default saveI_MTECH_DS_Timetable;

