/**
 * Script to seed M.Tech DS 1st Year Timetable to Firestore
 * Run this script once to populate the timetable in the database
 * 
 * Usage: node scripts/seedMTechDSTimetable.js
 * Or import and call: await seedMTechDSTimetable();
 */

import { db } from '../services/firebaseConfig.js';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

const mtechDSTimetable = {
  "program": "M.Tech DS",
  "year": "I",
  "class": "I MTECH DS",
  "room": "SH 310",
  "location": "Second Floor (East)",
  "schedule": [
    {
      "day": "Monday",
      "slots": [
        {
          "startTime": "09:30 AM",
          "endTime": "10:30 AM",
          "subject": "Machine Learning and Deep Learning",
          "subjectCode": "CSDS751",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr M SATHYA"
          },
          "room": "SH 310"
        },
        {
          "startTime": "10:30 AM",
          "endTime": "11:30 AM",
          "subject": "Machine Learning and Deep Learning",
          "subjectCode": "CSDS751",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr M SATHYA"
          },
          "room": "SH 310"
        },
        {
          "startTime": "11:30 AM",
          "endTime": "12:30 PM",
          "subject": "Big Data Analytics",
          "subjectCode": "CSDS752",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr. AMRITHA SARAVANAN"
          },
          "room": "SH 310"
        },
        {
          "startTime": "12:30 PM",
          "endTime": "01:30 PM",
          "subject": "Security for Data Science",
          "subjectCode": "CSDS753T",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr T CHITHRALEKHA"
          },
          "room": "SH 310"
        }
      ]
    },
    {
      "day": "Tuesday",
      "slots": [
        {
          "startTime": "09:30 AM",
          "endTime": "10:30 AM",
          "subject": "Laboratory - III (Machine Learning Lab)",
          "subjectCode": "CSDS754",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr M SATHYA"
          },
          "room": "SH 310"
        },
        {
          "startTime": "10:30 AM",
          "endTime": "11:30 AM",
          "subject": "Laboratory - III (Machine Learning Lab)",
          "subjectCode": "CSDS754",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr M SATHYA"
          },
          "room": "SH 310"
        },
        {
          "startTime": "11:30 AM",
          "endTime": "12:30 PM",
          "subject": "Laboratory - III (Machine Learning Lab)",
          "subjectCode": "CSDS754",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr M SATHYA"
          },
          "room": "SH 310"
        },
        {
          "startTime": "02:30 PM",
          "endTime": "03:30 PM",
          "subject": "Cloud Computing",
          "subjectCode": "CSDS772",
          "type": "Softcore",
          "faculty": {
            "name": "Dr SKV JAYAKUMAR"
          },
          "room": "SH 310"
        }
      ]
    },
    {
      "day": "Wednesday",
      "slots": [
        {
          "startTime": "10:30 AM",
          "endTime": "11:30 AM",
          "subject": "Computational Intelligence",
          "subjectCode": "CSDS777",
          "type": "Softcore",
          "faculty": {
            "name": "Dr K SURESH JOSEPH"
          },
          "room": "SH 310"
        },
        {
          "startTime": "11:30 AM",
          "endTime": "12:30 PM",
          "subject": "Machine Learning and Deep Learning",
          "subjectCode": "CSDS751",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr M SATHYA"
          },
          "room": "SH 310"
        },
        {
          "startTime": "01:30 PM",
          "endTime": "02:30 PM",
          "subject": "Laboratory - IV (Big Data Analytics Lab)",
          "subjectCode": "CSDS755",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr. JEYAKODI"
          },
          "room": "SH 310"
        },
        {
          "startTime": "02:30 PM",
          "endTime": "03:30 PM",
          "subject": "Laboratory - IV (Big Data Analytics Lab)",
          "subjectCode": "CSDS755",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr. JEYAKODI"
          },
          "room": "SH 310"
        },
        {
          "startTime": "03:30 PM",
          "endTime": "04:30 PM",
          "subject": "Laboratory - IV (Big Data Analytics Lab)",
          "subjectCode": "CSDS755",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr. JEYAKODI"
          },
          "room": "SH 310"
        }
      ]
    },
    {
      "day": "Thursday",
      "slots": [
        {
          "startTime": "09:30 AM",
          "endTime": "10:30 AM",
          "subject": "Cloud Computing",
          "subjectCode": "CSDS772",
          "type": "Softcore",
          "faculty": {
            "name": "Dr SKV JAYAKUMAR"
          },
          "room": "SH 310"
        },
        {
          "startTime": "10:30 AM",
          "endTime": "11:30 AM",
          "subject": "Cloud Computing",
          "subjectCode": "CSDS772",
          "type": "Softcore",
          "faculty": {
            "name": "Dr SKV JAYAKUMAR"
          },
          "room": "SH 310"
        },
        {
          "startTime": "11:30 AM",
          "endTime": "12:30 PM",
          "subject": "Big Data Analytics",
          "subjectCode": "CSDS752",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr. AMRITHA SARAVANAN"
          },
          "room": "SH 310"
        },
        {
          "startTime": "12:30 PM",
          "endTime": "01:30 PM",
          "subject": "Big Data Analytics",
          "subjectCode": "CSDS752",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr. AMRITHA SARAVANAN"
          },
          "room": "SH 310"
        },
        {
          "startTime": "03:30 PM",
          "endTime": "04:30 PM",
          "subject": "Security for DS Lab",
          "subjectCode": "CSDS753L",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr T CHITHRALEKHA"
          },
          "room": "SH 310"
        },
        {
          "startTime": "04:30 PM",
          "endTime": "05:30 PM",
          "subject": "Security for DS Lab",
          "subjectCode": "CSDS753L",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr T CHITHRALEKHA"
          },
          "room": "SH 310"
        }
      ]
    },
    {
      "day": "Friday",
      "slots": [
        {
          "startTime": "09:30 AM",
          "endTime": "10:30 AM",
          "subject": "Security for Data Science",
          "subjectCode": "CSDS753T",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr T CHITHRALEKHA"
          },
          "room": "SH 310"
        },
        {
          "startTime": "10:30 AM",
          "endTime": "11:30 AM",
          "subject": "Security for Data Science",
          "subjectCode": "CSDS753T",
          "type": "Hardcore",
          "faculty": {
            "name": "Dr T CHITHRALEKHA"
          },
          "room": "SH 310"
        },
        {
          "startTime": "11:30 AM",
          "endTime": "12:30 PM",
          "subject": "Computational Intelligence",
          "subjectCode": "CSDS777",
          "type": "Softcore",
          "faculty": {
            "name": "Dr K SURESH JOSEPH"
          },
          "room": "SH 310"
        },
        {
          "startTime": "12:30 PM",
          "endTime": "01:30 PM",
          "subject": "Computational Intelligence",
          "subjectCode": "CSDS777",
          "type": "Softcore",
          "faculty": {
            "name": "Dr K SURESH JOSEPH"
          },
          "room": "SH 310"
        }
      ]
    }
  ],
  "subjects": [
    {
      "code": "CSDS751",
      "name": "Machine Learning and Deep Learning",
      "type": "Hardcore",
      "hours": 3,
      "faculty": "Dr M SATHYA"
    },
    {
      "code": "CSDS752",
      "name": "Big Data Analytics",
      "type": "Hardcore",
      "hours": 3,
      "faculty": "Dr. AMRITHA SARAVANAN"
    },
    {
      "code": "CSDS753L",
      "name": "Security for DS Lab",
      "type": "Hardcore",
      "hours": 2,
      "faculty": "Dr T CHITHRALEKHA"
    },
    {
      "code": "CSDS753T",
      "name": "Security for Data Science",
      "type": "Hardcore",
      "hours": 3,
      "faculty": "Dr T CHITHRALEKHA"
    },
    {
      "code": "CSDS754",
      "name": "Laboratory - III (Machine Learning Lab)",
      "type": "Hardcore",
      "hours": 3,
      "faculty": "Dr M SATHYA"
    },
    {
      "code": "CSDS755",
      "name": "Laboratory - IV (Big Data Analytics Lab)",
      "type": "Hardcore",
      "hours": 3,
      "faculty": "Dr. JEYAKODI"
    },
    {
      "code": "CSDS772",
      "name": "Cloud Computing",
      "type": "Softcore",
      "hours": 3,
      "faculty": "Dr SKV JAYAKUMAR"
    },
    {
      "code": "CSDS777",
      "name": "Computational Intelligence",
      "type": "Softcore",
      "hours": 3,
      "faculty": "Dr K SURESH JOSEPH"
    }
  ]
};

export const seedMTechDSTimetable = async () => {
    try {
        console.log('🌱 Seeding M.Tech DS 1st Year Timetable...');
        
        // Check if timetable already exists
        const q = query(
            collection(db, 'timetables'),
            where('program', '==', 'M.Tech DS'),
            where('year', '==', 'I')
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            console.log('⚠️ Timetable already exists. Updating...');
            const existingDoc = snapshot.docs[0];
            await setDoc(existingDoc.ref, {
                ...mtechDSTimetable,
                id: existingDoc.id,
                updatedAt: new Date().toISOString(),
            }, { merge: true });
            console.log('✅ M.Tech DS Timetable updated successfully!');
            return { 
                success: true, 
                message: 'Timetable updated successfully',
                id: existingDoc.id 
            };
        }
        
        // Create new document
        const timetableRef = doc(collection(db, 'timetables'));
        await setDoc(timetableRef, {
            ...mtechDSTimetable,
            id: timetableRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        
        console.log('✅ M.Tech DS Timetable seeded successfully!');
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

// For direct execution
if (typeof window === 'undefined') {
    // Node.js environment
    seedMTechDSTimetable()
        .then(result => {
            console.log('Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

