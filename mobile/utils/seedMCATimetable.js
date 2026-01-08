import { db } from '../services/firebaseConfig';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

// MCA 1st Year Timetable Data
const mcaTimetable = {
  "program": "MCA",
  "year": "I",
  "class": "I MCA",
  "room": "SH 318",
  "location": "II Floor",
  "schedule": [
    {
      "day": "Monday",
      "slots": [
        { "startTime": "09:30 AM", "endTime": "10:30 AM", "subject": "Computer Networks Lab", "subjectCode": "CSCA 424", "type": "Hardcore", "faculty": { "name": "Dr T Chithralekha" }, "room": "SH 318" },
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "Computer Networks Lab", "subjectCode": "CSCA 424", "type": "Hardcore", "faculty": { "name": "Dr T Chithralekha" }, "room": "SH 318" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Computer Networks Lab", "subjectCode": "CSCA 424", "type": "Hardcore", "faculty": { "name": "Dr T Chithralekha" }, "room": "SH 318" }
      ]
    },
    {
      "day": "Tuesday",
      "slots": [
        { "startTime": "09:30 AM", "endTime": "10:30 AM", "subject": "Operating Systems", "subjectCode": "CSCA 422", "type": "Hardcore", "faculty": { "name": "Dr. Rajpriya Darshini" }, "room": "SH 318" },
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "Computer Networks", "subjectCode": "CSCA 421", "type": "Hardcore", "faculty": { "name": "Dr T Chithralekha" }, "room": "SH 318" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Computer Networks", "subjectCode": "CSCA 421", "type": "Hardcore", "faculty": { "name": "Dr T Chithralekha" }, "room": "SH 318" },
        { "startTime": "01:30 PM", "endTime": "02:30 PM", "subject": "Operating Systems Lab", "subjectCode": "CSCA 425", "type": "Hardcore", "faculty": { "name": "Mr Seenivasan R P" }, "room": "SH 318" },
        { "startTime": "02:30 PM", "endTime": "03:30 PM", "subject": "Operating Systems Lab", "subjectCode": "CSCA 425", "type": "Hardcore", "faculty": { "name": "Mr Seenivasan R P" }, "room": "SH 318" },
        { "startTime": "03:30 PM", "endTime": "04:30 PM", "subject": "Operating Systems Lab", "subjectCode": "CSCA 425", "type": "Hardcore", "faculty": { "name": "Mr Seenivasan R P" }, "room": "SH 318" }
      ]
    },
    {
      "day": "Wednesday",
      "slots": [
        { "startTime": "09:30 AM", "endTime": "10:30 AM", "subject": "Communication Skills", "subjectCode": "CSCA 423", "type": "Hardcore", "faculty": { "name": "Dr G Krishnapriya" }, "room": "SH 318" },
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "Operating Systems", "subjectCode": "CSCA 422", "type": "Hardcore", "faculty": { "name": "Dr. Rajpriya Darshini" }, "room": "SH 318" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Operating Systems", "subjectCode": "CSCA 422", "type": "Hardcore", "faculty": { "name": "Dr. Rajpriya Darshini" }, "room": "SH 318" },
        { "startTime": "02:30 PM", "endTime": "03:30 PM", "subject": "Ethical Hacking (Level 3)", "subjectCode": "CSEL 448", "type": "Softcore", "faculty": { "name": "Dr Sukhvinder Singh" }, "room": "SH 318" },
        { "startTime": "03:30 PM", "endTime": "04:30 PM", "subject": "Ethical Hacking (Level 3)", "subjectCode": "CSEL 448", "type": "Softcore", "faculty": { "name": "Dr Sukhvinder Singh" }, "room": "SH 318" }
      ]
    },
    {
      "day": "Thursday",
      "slots": [
        { "startTime": "09:30 AM", "endTime": "10:30 AM", "subject": "Introduction to A.I. and Expert Systems (Level 1)", "subjectCode": "CSEL 581", "type": "Softcore", "faculty": { "name": "Dr SL Jayalakshmi" }, "room": "SH 318" },
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "Introduction to A.I. and Expert Systems (Level 1)", "subjectCode": "CSEL 581", "type": "Softcore", "faculty": { "name": "Dr SL Jayalakshmi" }, "room": "SH 318" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Computer Networks", "subjectCode": "CSCA 421", "type": "Hardcore", "faculty": { "name": "Dr T Chithralekha" }, "room": "SH 318" }
      ]
    },
    {
      "day": "Friday",
      "slots": [
        { "startTime": "10:30 AM", "endTime": "11:30 AM", "subject": "Ethical Hacking (Level 3)", "subjectCode": "CSEL 448", "type": "Softcore", "faculty": { "name": "Dr Sukhvinder Singh" }, "room": "SH 318" },
        { "startTime": "11:30 AM", "endTime": "12:30 PM", "subject": "Introduction to A.I. and Expert Systems (Level 1)", "subjectCode": "CSEL 581", "type": "Softcore", "faculty": { "name": "Dr SL Jayalakshmi" }, "room": "SH 318" },
        { "startTime": "02:30 PM", "endTime": "03:30 PM", "subject": "Communication Skills", "subjectCode": "CSCA 423", "type": "Hardcore", "faculty": { "name": "Dr G Krishnapriya" }, "room": "SH 318" },
        { "startTime": "03:30 PM", "endTime": "04:30 PM", "subject": "Communication Skills", "subjectCode": "CSCA 423", "type": "Hardcore", "faculty": { "name": "Dr G Krishnapriya" }, "room": "SH 318" }
      ]
    }
  ],
  "subjects": [
    { "code": "CSCA 421", "name": "Computer Networks", "type": "Hardcore", "hours": 3, "faculty": "Dr T Chithralekha" },
    { "code": "CSCA 422", "name": "Operating Systems", "type": "Hardcore", "hours": 3, "faculty": "Dr. Rajpriya Darshini" },
    { "code": "CSCA 423", "name": "Communication Skills", "type": "Hardcore", "hours": 3, "faculty": "Dr G Krishnapriya" },
    { "code": "CSCA 424", "name": "Computer Networks Lab", "type": "Hardcore", "hours": 3, "faculty": "Dr T Chithralekha" },
    { "code": "CSCA 425", "name": "Operating Systems Lab", "type": "Hardcore", "hours": 3, "faculty": "Mr Seenivasan R P" },
    { "code": "CSEL 448", "name": "Ethical Hacking (Level 3)", "type": "Softcore", "hours": 3, "faculty": "Dr Sukhvinder Singh" },
    { "code": "CSEL 581", "name": "Introduction to A.I. and Expert Systems (Level 1)", "type": "Softcore", "hours": 3, "faculty": "Dr SL Jayalakshmi" }
  ]
};

export const seedMCATimetable = async () => {
    try {
        console.log('🌱 Seeding MCA 1st Year Timetable...');
        
        // Check if timetable already exists
        const q = query(
            collection(db, 'timetables'),
            where('program', '==', 'MCA'),
            where('year', '==', 'I')
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            console.log('⚠️ Timetable already exists. Updating...');
            const existingDoc = snapshot.docs[0];
            await setDoc(existingDoc.ref, {
                ...mcaTimetable,
                id: existingDoc.id,
                updatedAt: new Date().toISOString(),
            }, { merge: true });
            console.log('✅ MCA Timetable updated successfully!');
            return { 
                success: true, 
                message: 'Timetable updated successfully',
                id: existingDoc.id 
            };
        }
        
        // Create new document
        const timetableRef = doc(collection(db, 'timetables'));
        await setDoc(timetableRef, {
            ...mcaTimetable,
            id: timetableRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        
        console.log('✅ MCA Timetable seeded successfully!');
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

