import { db } from '../services/firebaseConfig';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

// M.Sc CS 2nd Year Lab Timetable Data
const mscCS2ndYearLabTimetable = {
  "program": "M.Sc CS",
  "year": "II",
  "class": "II MSC",
  "room": "First Floor Lab",
  "location": "First Floor",
  "schedule": [
    {
      "day": "Monday",
      "slots": [
        { "startTime": "09:30 AM", "endTime": "10:30 AM", "subject": "Project Work", "subjectCode": "CSSC 522 B1", "type": "Project", "faculty": { "name": "PR_SUPERVISOR" }, "room": "First Floor Lab" },
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "Project Work", "subjectCode": "CSSC 522 B1", "type": "Project", "faculty": { "name": "PR_SUPERVISOR" }, "room": "First Floor Lab" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Project Work", "subjectCode": "CSSC 522 B1", "type": "Project", "faculty": { "name": "PR_SUPERVISOR" }, "room": "First Floor Lab" },
        { "startTime": "12:30 PM", "endTime": "01:30 PM", "subject": "Project Work", "subjectCode": "CSSC 522 B1", "type": "Project", "faculty": { "name": "PR_SUPERVISOR" }, "room": "First Floor Lab" }
      ]
    },
    {
      "day": "Thursday",
      "slots": [
        { "startTime": "09:30 AM", "endTime": "10:30 AM", "subject": "Project Work", "subjectCode": "CSSC 522 B2", "type": "Project", "faculty": { "name": "PR_SUPERVISOR" }, "room": "First Floor Lab" },
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "Project Work", "subjectCode": "CSSC 522 B2", "type": "Project", "faculty": { "name": "PR_SUPERVISOR" }, "room": "First Floor Lab" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Project Work", "subjectCode": "CSSC 522 B2", "type": "Project", "faculty": { "name": "PR_SUPERVISOR" }, "room": "First Floor Lab" },
        { "startTime": "12:30 PM", "endTime": "01:30 PM", "subject": "Project Work", "subjectCode": "CSSC 522 B2", "type": "Project", "faculty": { "name": "PR_SUPERVISOR" }, "room": "First Floor Lab" }
      ]
    }
  ],
  "subjects": [
    { "code": "CSSC 522 B1", "name": "Project Work", "type": "Project", "hours": 4, "faculty": "PR_SUPERVISOR" },
    { "code": "CSSC 522 B2", "name": "Project Work", "type": "Project", "hours": 4, "faculty": "PR_SUPERVISOR" }
  ]
};

export const seedMScCS2ndYearLabTimetable = async () => {
    try {
        console.log('🌱 Seeding M.Sc CS 2nd Year Lab Timetable...');
        
        // Check if any timetable exists for M.Sc CS 2nd Year
        const q = query(
            collection(db, 'timetables'),
            where('program', '==', 'M.Sc CS'),
            where('year', '==', 'II')
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            console.log('⚠️ Timetable already exists. Merging lab schedule...');
            const existingDoc = snapshot.docs[0];
            const existingData = existingDoc.data();
            
            // Merge lab schedule days into existing schedule
            const existingSchedule = existingData.schedule || [];
            const labSchedule = mscCS2ndYearLabTimetable.schedule;
            
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
            mscCS2ndYearLabTimetable.subjects.forEach(subject => {
                if (!mergedSubjects.find(s => s.code === subject.code)) {
                    mergedSubjects.push(subject);
                }
            });
            
            await setDoc(existingDoc.ref, {
                ...existingData,
                schedule: mergedSchedule,
                subjects: mergedSubjects,
                // Update room info if lab is different
                room: existingData.room || mscCS2ndYearLabTimetable.room,
                location: existingData.location || mscCS2ndYearLabTimetable.location,
                updatedAt: new Date().toISOString(),
            }, { merge: true });
            console.log('✅ M.Sc CS 2nd Year Lab Timetable merged successfully!');
            return { 
                success: true, 
                message: 'Lab Timetable merged successfully',
                id: existingDoc.id 
            };
        }
        
        // Create new document with lab timetable
        const timetableRef = doc(collection(db, 'timetables'));
        await setDoc(timetableRef, {
            ...mscCS2ndYearLabTimetable,
            id: timetableRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        
        console.log('✅ M.Sc CS 2nd Year Lab Timetable seeded successfully!');
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

