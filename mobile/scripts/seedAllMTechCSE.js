/**
 * Seed M.Tech CSE Students and Timetable
 * Run this to seed both students and timetable
 */

const { seedMTechCSEStudents } = require('../utils/seedMTechCSEStudents');
const { seedMTechCSETimetable } = require('../utils/seedMTechCSETimetable');

async function seedAll() {
    console.log('🌱 Seeding M.Tech CSE 1st Year...\n');
    
    // Seed timetable first
    console.log('1️⃣ Seeding Timetable...');
    const timetableResult = await seedMTechCSETimetable();
    if (timetableResult.success) {
        console.log(`✅ Timetable: ${timetableResult.message}\n`);
    } else {
        console.log(`❌ Timetable Error: ${timetableResult.error}\n`);
    }
    
    // Seed students
    console.log('2️⃣ Seeding Students...');
    const studentsResult = await seedMTechCSEStudents();
    if (studentsResult.success) {
        console.log(`✅ Students: ${studentsResult.created} created, ${studentsResult.updated} updated\n`);
    } else {
        console.log(`❌ Students Error: ${studentsResult.error}\n`);
    }
    
    console.log('🎉 M.Tech CSE seeding completed!');
}

seedAll().catch(console.error);

