import { db } from '../services/firebaseConfig';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

// M.Sc Data Analytics 1st Year Timetable Data
const mscDATimetable = {
  "program": "M.Sc Data Analytics",
  "year": "I",
  "class": "I MSC DA",
  "room": "SH 308",
  "location": "II Floor",
  "schedule": [
    {
      "day": "Monday",
      "slots": [
        { "startTime": "09:30 AM", "endTime": "10:30 AM", "subject": "Advanced Database Systems", "subjectCode": "CSDA651T", "type": "Hardcore", "faculty": { "name": "Dr. Sukhvinder Singh" }, "room": "SH 308" },
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "Advanced Database Systems", "subjectCode": "CSDA651T", "type": "Hardcore", "faculty": { "name": "Dr. Sukhvinder Singh" }, "room": "SH 308" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Web Analytics", "subjectCode": "CSDA652", "type": "Hardcore", "faculty": { "name": "Dr. KS Kuppusamy" }, "room": "SH 308" },
        { "startTime": "02:30 PM", "endTime": "03:30 PM", "subject": "Social Network Analytics", "subjectCode": "CSDA671", "type": "Softcore", "faculty": { "name": "Dr. S Siva Sathya" }, "room": "SH 308" },
        { "startTime": "03:30 PM", "endTime": "04:30 PM", "subject": "Social Network Analytics", "subjectCode": "CSDA671", "type": "Softcore", "faculty": { "name": "Dr. S Siva Sathya" }, "room": "SH 308" }
      ]
    },
    {
      "day": "Tuesday",
      "slots": [
        { "startTime": "09:30 AM", "endTime": "10:30 AM", "subject": "Accessibility Analytics", "subjectCode": "CSDA674", "type": "Softcore", "faculty": { "name": "Mr. Seenivasan R P" }, "room": "SH 308" },
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "Data Visualisation", "subjectCode": "CSDA653", "type": "Hardcore", "faculty": { "name": "Dr. Jeyakodi" }, "room": "SH 308" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Data Visualisation", "subjectCode": "CSDA653", "type": "Hardcore", "faculty": { "name": "Dr. Jeyakodi" }, "room": "SH 308" },
        { "startTime": "02:30 PM", "endTime": "03:30 PM", "subject": "Web Analytics", "subjectCode": "CSDA652", "type": "Hardcore", "faculty": { "name": "Dr. KS Kuppusamy" }, "room": "SH 308" },
        { "startTime": "03:30 PM", "endTime": "04:30 PM", "subject": "Web Analytics", "subjectCode": "CSDA652", "type": "Hardcore", "faculty": { "name": "Dr. KS Kuppusamy" }, "room": "SH 308" }
      ]
    },
    {
      "day": "Wednesday",
      "slots": [
        { "startTime": "09:30 AM", "endTime": "10:30 AM", "subject": "Advanced Database Systems", "subjectCode": "CSDA651T", "type": "Hardcore", "faculty": { "name": "Dr. Sukhvinder Singh" }, "room": "SH 308" },
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "Lab 3 – Web Analytics Lab", "subjectCode": "CSDA654", "type": "Hardcore", "faculty": { "name": "Dr. KS Kuppusamy" }, "room": "SH 308" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Lab 3 – Web Analytics Lab", "subjectCode": "CSDA654", "type": "Hardcore", "faculty": { "name": "Dr. KS Kuppusamy" }, "room": "SH 308" },
        { "startTime": "12:30 PM", "endTime": "01:30 PM", "subject": "Lab 3 – Web Analytics Lab", "subjectCode": "CSDA654", "type": "Hardcore", "faculty": { "name": "Dr. KS Kuppusamy" }, "room": "SH 308" },
        { "startTime": "02:30 PM", "endTime": "03:30 PM", "subject": "Accessibility Analytics", "subjectCode": "CSDA674", "type": "Softcore", "faculty": { "name": "Mr. Seenivasan R P" }, "room": "SH 308" },
        { "startTime": "03:30 PM", "endTime": "04:30 PM", "subject": "Accessibility Analytics", "subjectCode": "CSDA674", "type": "Softcore", "faculty": { "name": "Mr. Seenivasan R P" }, "room": "SH 308" }
      ]
    },
    {
      "day": "Thursday",
      "slots": [
        { "startTime": "09:30 AM", "endTime": "10:30 AM", "subject": "ADBMS Lab", "subjectCode": "CSDA651L", "type": "Hardcore", "faculty": { "name": "Dr. Sukhvinder Singh" }, "room": "SH 308" },
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "ADBMS Lab", "subjectCode": "CSDA651L", "type": "Hardcore", "faculty": { "name": "Dr. Sukhvinder Singh" }, "room": "SH 308" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Social Network Analytics", "subjectCode": "CSDA671", "type": "Softcore", "faculty": { "name": "Dr. S Siva Sathya" }, "room": "SH 308" }
      ]
    },
    {
      "day": "Friday",
      "slots": [
        { "startTime": "09:30 AM", "endTime": "10:30 AM", "subject": "Lab – 4 Data Visualisation Lab", "subjectCode": "CSDA655", "type": "Hardcore", "faculty": { "name": "Dr. Jeyakodi" }, "room": "SH 308" },
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "Lab – 4 Data Visualisation Lab", "subjectCode": "CSDA655", "type": "Hardcore", "faculty": { "name": "Dr. Jeyakodi" }, "room": "SH 308" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Lab – 4 Data Visualisation Lab", "subjectCode": "CSDA655", "type": "Hardcore", "faculty": { "name": "Dr. Jeyakodi" }, "room": "SH 308" },
        { "startTime": "01:30 PM", "endTime": "02:30 PM", "subject": "Data Visualisation", "subjectCode": "CSDA653", "type": "Hardcore", "faculty": { "name": "Dr. Jeyakodi" }, "room": "SH 308" }
      ]
    }
  ],
  "subjects": [
    { "code": "CSDA651L", "name": "ADBMS Lab", "type": "Hardcore", "hours": 2, "faculty": "Dr. Sukhvinder Singh" },
    { "code": "CSDA651T", "name": "Advanced Database Systems", "type": "Hardcore", "hours": 3, "faculty": "Dr. Sukhvinder Singh" },
    { "code": "CSDA652", "name": "Web Analytics", "type": "Hardcore", "hours": 3, "faculty": "Dr. KS Kuppusamy" },
    { "code": "CSDA653", "name": "Data Visualisation", "type": "Hardcore", "hours": 3, "faculty": "Dr. Jeyakodi" },
    { "code": "CSDA654", "name": "Lab 3 – Web Analytics Lab", "type": "Hardcore", "hours": 3, "faculty": "Dr. KS Kuppusamy" },
    { "code": "CSDA655", "name": "Lab – 4 Data Visualisation Lab", "type": "Hardcore", "hours": 3, "faculty": "Dr. Jeyakodi" },
    { "code": "CSDA671", "name": "Social Network Analytics", "type": "Softcore", "hours": 3, "faculty": "Dr. S Siva Sathya" },
    { "code": "CSDA674", "name": "Accessibility Analytics", "type": "Softcore", "hours": 3, "faculty": "Mr. Seenivasan R P" }
  ]
};

export const seedMScDATimetable = async () => {
    try {
        console.log('🌱 Seeding M.Sc Data Analytics 1st Year Timetable...');
        
        // Check if timetable already exists
        const q = query(
            collection(db, 'timetables'),
            where('program', '==', 'M.Sc Data Analytics'),
            where('year', '==', 'I')
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            console.log('⚠️ Timetable already exists. Updating...');
            const existingDoc = snapshot.docs[0];
            await setDoc(existingDoc.ref, {
                ...mscDATimetable,
                id: existingDoc.id,
                updatedAt: new Date().toISOString(),
            }, { merge: true });
            console.log('✅ M.Sc Data Analytics Timetable updated successfully!');
            return { 
                success: true, 
                message: 'Timetable updated successfully',
                id: existingDoc.id 
            };
        }
        
        // Create new document
        const timetableRef = doc(collection(db, 'timetables'));
        await setDoc(timetableRef, {
            ...mscDATimetable,
            id: timetableRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        
        console.log('✅ M.Sc Data Analytics Timetable seeded successfully!');
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

