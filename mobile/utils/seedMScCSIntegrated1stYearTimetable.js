import { db } from '../services/firebaseConfig';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

// M.Sc CS Integrated 1st Year Timetable Data
const mscCSIntegrated1stYearTimetable = {
  "program": "M.Sc CS Integrated",
  "year": "I",
  "class": "I MSC CS",
  "room": "SH 310",
  "location": "II Floor",
  "schedule": [
    {
      "day": "Monday",
      "slots": [
        { "startTime": "09:30 AM", "endTime": "10:30 AM", "subject": "Advanced Database Systems", "subjectCode": "CSSC 422", "type": "Hardcore", "faculty": { "name": "Dr Sukhvinder Singh" }, "room": "SH 310" },
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "Advanced Database Systems", "subjectCode": "CSSC 422", "type": "Hardcore", "faculty": { "name": "Dr Sukhvinder Singh" }, "room": "SH 310" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Introduction to A.I. and Expert Systems (Level 1)", "subjectCode": "CSEL 581", "type": "Softcore", "faculty": { "name": "Dr V Uma" }, "room": "SH 310" },
        { "startTime": "01:30 PM", "endTime": "02:30 PM", "subject": "Practical III – Operating System Lab", "subjectCode": "CSSC 423", "type": "Hardcore", "faculty": { "name": "Dr R Sunitha" }, "room": "SH 310" },
        { "startTime": "02:30 PM", "endTime": "03:30 PM", "subject": "Practical III – Operating System Lab", "subjectCode": "CSSC 423", "type": "Hardcore", "faculty": { "name": "Dr R Sunitha" }, "room": "SH 310" },
        { "startTime": "03:30 PM", "endTime": "04:30 PM", "subject": "Practical III – Operating System Lab", "subjectCode": "CSSC 423", "type": "Hardcore", "faculty": { "name": "Dr R Sunitha" }, "room": "SH 310" }
      ]
    },
    {
      "day": "Tuesday",
      "slots": [
        { "startTime": "09:30 AM", "endTime": "10:30 AM", "subject": "Modern Operating Systems", "subjectCode": "CSSC 421", "type": "Hardcore", "faculty": { "name": "Dr R Sunitha" }, "room": "SH 310" },
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "Modern Operating Systems", "subjectCode": "CSSC 421", "type": "Hardcore", "faculty": { "name": "Dr R Sunitha" }, "room": "SH 310" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Optimization Techniques (Supportive Core – II)", "subjectCode": "CSSC 433", "type": "Hardcore", "faculty": { "name": "Dr R Subramanian" }, "room": "SH 310" }
      ]
    },
    {
      "day": "Wednesday",
      "slots": [
        { "startTime": "09:30 AM", "endTime": "10:30 AM", "subject": "Advanced Database Systems", "subjectCode": "CSSC 422", "type": "Hardcore", "faculty": { "name": "Dr Sukhvinder Singh" }, "room": "SH 310" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Introduction to A.I. and Expert Systems (Level 1)", "subjectCode": "CSEL 581", "type": "Softcore", "faculty": { "name": "Dr V Uma" }, "room": "SH 310" },
        { "startTime": "12:30 PM", "endTime": "01:30 PM", "subject": "Introduction to A.I. and Expert Systems (Level 1)", "subjectCode": "CSEL 581", "type": "Softcore", "faculty": { "name": "Dr V Uma" }, "room": "SH 310" },
        { "startTime": "02:30 PM", "endTime": "03:30 PM", "subject": "Social Network Analytics (Level 2)", "subjectCode": "CSEL 565", "type": "Softcore", "faculty": { "name": "Dr R Sunitha" }, "room": "SH 310" }
      ]
    },
    {
      "day": "Thursday",
      "slots": [
        { "startTime": "09:30 AM", "endTime": "10:30 AM", "subject": "Practical IV – Database System Lab", "subjectCode": "CSSC 424", "type": "Hardcore", "faculty": { "name": "Dr Sukhvinder Singh" }, "room": "SH 310" },
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "Practical IV – Database System Lab", "subjectCode": "CSSC 424", "type": "Hardcore", "faculty": { "name": "Dr Sukhvinder Singh" }, "room": "SH 310" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Practical IV – Database System Lab", "subjectCode": "CSSC 424", "type": "Hardcore", "faculty": { "name": "Dr Sukhvinder Singh" }, "room": "SH 310" },
        { "startTime": "02:30 PM", "endTime": "03:30 PM", "subject": "Social Network Analytics (Level 2)", "subjectCode": "CSEL 565", "type": "Softcore", "faculty": { "name": "Dr R Sunitha" }, "room": "SH 310" },
        { "startTime": "03:30 PM", "endTime": "04:30 PM", "subject": "Social Network Analytics (Level 2)", "subjectCode": "CSEL 565", "type": "Softcore", "faculty": { "name": "Dr R Sunitha" }, "room": "SH 310" }
      ]
    },
    {
      "day": "Friday",
      "slots": [
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "Modern Operating Systems", "subjectCode": "CSSC 421", "type": "Hardcore", "faculty": { "name": "Dr R Sunitha" }, "room": "SH 310" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Optimization Techniques (Supportive Core – II)", "subjectCode": "CSSC 433", "type": "Hardcore", "faculty": { "name": "Dr R Subramanian" }, "room": "SH 310" },
        { "startTime": "12:30 PM", "endTime": "01:30 PM", "subject": "Optimization Techniques (Supportive Core – II)", "subjectCode": "CSSC 433", "type": "Hardcore", "faculty": { "name": "Dr R Subramanian" }, "room": "SH 310" }
      ]
    }
  ],
  "subjects": [
    { "code": "CSEL 565", "name": "Social Network Analytics (Level 2)", "type": "Softcore", "hours": 3, "faculty": "Dr R Sunitha" },
    { "code": "CSEL 581", "name": "Introduction to A.I. and Expert Systems (Level 1)", "type": "Softcore", "hours": 3, "faculty": "Dr V Uma" },
    { "code": "CSSC 421", "name": "Modern Operating Systems", "type": "Hardcore", "hours": 3, "faculty": "Dr R Sunitha" },
    { "code": "CSSC 422", "name": "Advanced Database Systems", "type": "Hardcore", "hours": 3, "faculty": "Dr Sukhvinder Singh" },
    { "code": "CSSC 423", "name": "Practical III – Operating System Lab", "type": "Hardcore", "hours": 3, "faculty": "Dr R Sunitha" },
    { "code": "CSSC 424", "name": "Practical IV – Database System Lab", "type": "Hardcore", "hours": 3, "faculty": "Dr Sukhvinder Singh" },
    { "code": "CSSC 433", "name": "Optimization Techniques (Supportive Core – II)", "type": "Hardcore", "hours": 3, "faculty": "Dr R Subramanian" }
  ]
};

export const seedMScCSIntegrated1stYearTimetable = async () => {
    try {
        console.log('🌱 Seeding M.Sc CS Integrated 1st Year Timetable...');
        
        // Check if timetable already exists
        const q = query(
            collection(db, 'timetables'),
            where('program', '==', 'M.Sc CS Integrated'),
            where('year', '==', 'I')
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            console.log('⚠️ Timetable already exists. Updating...');
            const existingDoc = snapshot.docs[0];
            await setDoc(existingDoc.ref, {
                ...mscCSIntegrated1stYearTimetable,
                id: existingDoc.id,
                updatedAt: new Date().toISOString(),
            }, { merge: true });
            console.log('✅ M.Sc CS Integrated 1st Year Timetable updated successfully!');
            return { 
                success: true, 
                message: 'Timetable updated successfully',
                id: existingDoc.id 
            };
        }
        
        // Create new document
        const timetableRef = doc(collection(db, 'timetables'));
        await setDoc(timetableRef, {
            ...mscCSIntegrated1stYearTimetable,
            id: timetableRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        
        console.log('✅ M.Sc CS Integrated 1st Year Timetable seeded successfully!');
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

