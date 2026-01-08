import { db } from '../services/firebaseConfig';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

// M.Tech CSE 2nd Year Timetable Data
const mtechCSE2ndYearTimetable = {
  "program": "M.Tech CSE",
  "year": "II",
  "class": "II MTECH CSE",
  "room": "Second Floor Lab – 2",
  "location": "Second Floor",
  "schedule": [
    {
      "day": "Monday",
      "slots": [
        { "startTime": "09:30 AM", "endTime": "10:30 AM", "subject": "Project Work Phase – 2", "subjectCode": "CSCE 721", "type": "Project", "faculty": { "name": "Project Guide" }, "room": "Second Floor Lab – 2" },
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "Project Work Phase – 2", "subjectCode": "CSCE 721", "type": "Project", "faculty": { "name": "Project Guide" }, "room": "Second Floor Lab – 2" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Project Work Phase – 2", "subjectCode": "CSCE 721", "type": "Project", "faculty": { "name": "Project Guide" }, "room": "Second Floor Lab – 2" },
        { "startTime": "12:30 PM", "endTime": "01:30 PM", "subject": "Project Work Phase – 2", "subjectCode": "CSCE 721", "type": "Project", "faculty": { "name": "Project Guide" }, "room": "Second Floor Lab – 2" },
        { "startTime": "01:30 PM", "endTime": "02:30 PM", "subject": "Project Work Phase – 2", "subjectCode": "CSCE 721", "type": "Project", "faculty": { "name": "Project Guide" }, "room": "Second Floor Lab – 2" },
        { "startTime": "02:30 PM", "endTime": "03:30 PM", "subject": "Project Work Phase – 2", "subjectCode": "CSCE 721", "type": "Project", "faculty": { "name": "Project Guide" }, "room": "Second Floor Lab – 2" }
      ]
    }
  ],
  "subjects": [
    { "code": "CSCE 721", "name": "Project Work Phase – 2", "type": "Project", "hours": 6, "faculty": "Project Guide" }
  ]
};

export const seedMTechCSE2ndYearTimetable = async () => {
    try {
        console.log('🌱 Seeding M.Tech CSE 2nd Year Timetable...');
        
        // Check if timetable already exists
        const q = query(
            collection(db, 'timetables'),
            where('program', '==', 'M.Tech CSE'),
            where('year', '==', 'II')
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            console.log('⚠️ Timetable already exists. Updating...');
            const existingDoc = snapshot.docs[0];
            await setDoc(existingDoc.ref, {
                ...mtechCSE2ndYearTimetable,
                id: existingDoc.id,
                updatedAt: new Date().toISOString(),
            }, { merge: true });
            console.log('✅ M.Tech CSE 2nd Year Timetable updated successfully!');
            return { 
                success: true, 
                message: 'Timetable updated successfully',
                id: existingDoc.id 
            };
        }
        
        // Create new document
        const timetableRef = doc(collection(db, 'timetables'));
        await setDoc(timetableRef, {
            ...mtechCSE2ndYearTimetable,
            id: timetableRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        
        console.log('✅ M.Tech CSE 2nd Year Timetable seeded successfully!');
        console.log('📋 Document ID:', timetableRef.id);
        
        return { 
            success: true, 
            message: 'Timetable seeded successfully',
            id: timetableRef.id 
        };
    } catch (error) {
        console.error('❌ Error seeding timetable:', error);
        return { success: false, error: error.message };
    }
};

