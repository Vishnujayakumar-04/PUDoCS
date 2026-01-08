import { db } from '../services/firebaseConfig';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

// MCA 2nd Year Lab Timetable Data
const mca2ndYearLabTimetable = {
  "program": "MCA",
  "year": "II",
  "class": "II MCA",
  "room": "First Floor Lab",
  "location": "First Floor",
  "schedule": [
    {
      "day": "Tuesday",
      "slots": [
        { "startTime": "01:30 PM", "endTime": "02:30 PM", "subject": "Project Work", "subjectCode": "CSCA 521", "type": "Project", "faculty": { "name": "GUIDE" }, "room": "First Floor Lab" },
        { "startTime": "02:30 PM", "endTime": "03:30 PM", "subject": "Project Work", "subjectCode": "CSCA 521", "type": "Project", "faculty": { "name": "GUIDE" }, "room": "First Floor Lab" },
        { "startTime": "03:30 PM", "endTime": "04:30 PM", "subject": "Project Work", "subjectCode": "CSCA 521", "type": "Project", "faculty": { "name": "GUIDE" }, "room": "First Floor Lab" },
        { "startTime": "04:30 PM", "endTime": "05:30 PM", "subject": "Project Work", "subjectCode": "CSCA 521", "type": "Project", "faculty": { "name": "GUIDE" }, "room": "First Floor Lab" }
      ]
    }
  ],
  "subjects": [
    { "code": "CSCA 521", "name": "Project Work", "type": "Project", "hours": 4, "faculty": "GUIDE" }
  ]
};

export const seedMCA2ndYearLabTimetable = async () => {
    try {
        console.log('🌱 Seeding MCA 2nd Year Lab Timetable...');
        
        // Check if any timetable exists for MCA 2nd Year
        const q = query(
            collection(db, 'timetables'),
            where('program', '==', 'MCA'),
            where('year', '==', 'II')
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            console.log('⚠️ Timetable already exists. Merging lab schedule...');
            const existingDoc = snapshot.docs[0];
            const existingData = existingDoc.data();
            
            // Merge lab schedule days into existing schedule
            const existingSchedule = existingData.schedule || [];
            const labSchedule = mca2ndYearLabTimetable.schedule;
            
            // Combine schedules, avoiding duplicate days
            const mergedSchedule = [...existingSchedule];
            labSchedule.forEach(labDay => {
                const existingDayIndex = mergedSchedule.findIndex(d => d.day === labDay.day);
                if (existingDayIndex >= 0) {
                    // Merge slots for the same day
                    mergedSchedule[existingDayIndex].slots = [
                        ...mergedSchedule[existingDayIndex].slots,
                        ...labDay.slots
                    ];
                } else {
                    // Add new day
                    mergedSchedule.push(labDay);
                }
            });
            
            // Merge subjects
            const existingSubjects = existingData.subjects || [];
            const mergedSubjects = [...existingSubjects];
            mca2ndYearLabTimetable.subjects.forEach(subject => {
                if (!mergedSubjects.find(s => s.code === subject.code)) {
                    mergedSubjects.push(subject);
                }
            });
            
            await setDoc(existingDoc.ref, {
                ...existingData,
                schedule: mergedSchedule,
                subjects: mergedSubjects,
                // Update room info if lab is different
                room: existingData.room || mca2ndYearLabTimetable.room,
                location: existingData.location || mca2ndYearLabTimetable.location,
                updatedAt: new Date().toISOString(),
            }, { merge: true });
            console.log('✅ MCA 2nd Year Lab Timetable merged successfully!');
            return { 
                success: true, 
                message: 'Lab Timetable merged successfully',
                id: existingDoc.id 
            };
        }
        
        // Create new document with lab timetable
        const timetableRef = doc(collection(db, 'timetables'));
        await setDoc(timetableRef, {
            ...mca2ndYearLabTimetable,
            id: timetableRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        
        console.log('✅ MCA 2nd Year Lab Timetable seeded successfully!');
        console.log('📋 Document ID:', timetableRef.id);
        
        return { 
            success: true, 
            message: 'Lab Timetable seeded successfully',
            id: timetableRef.id 
        };
    } catch (error) {
        console.error('❌ Error seeding lab timetable:', error);
        return { success: false, error: error.message };
    }
};

