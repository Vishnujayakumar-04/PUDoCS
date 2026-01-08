# How to Seed M.Tech DS Timetable to Firestore

## Option 1: Using React Native/Expo (Recommended)

You can call the seeding function from anywhere in your app, for example in a development screen or admin panel:

```javascript
import { seedMTechDSTimetable } from './utils/seedMTechDSTimetable';

// Call this function once
const result = await seedMTechDSTimetable();
console.log(result);
```

## Option 2: Using Firebase Console

1. Go to Firebase Console → Firestore Database
2. Create a new collection called `timetables`
3. Add a new document
4. Copy the data from `data/timetables/M_Tech_DS_1st_Year_Timetable.json`
5. Paste it into the document fields
6. Set the document ID to any unique value

## Option 3: Using Firebase Admin SDK (Node.js)

If you have a Node.js backend:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const timetableData = require('./data/timetables/M_Tech_DS_1st_Year_Timetable.json');

async function seedTimetable() {
  const docRef = db.collection('timetables').doc();
  await docRef.set({
    ...timetableData,
    id: docRef.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  console.log('Timetable seeded!');
}

seedTimetable();
```

## Quick Test

After seeding, M.Tech DS students should be able to:
1. See their timetable automatically when they open the Timetable screen
2. See all 8 subjects in Attendance (even with 0% attendance initially)
3. See all 8 subjects in Internal Marks and Assignment Marks tables

## Verification

Check Firestore:
- Collection: `timetables`
- Document should have:
  - `program: "M.Tech DS"`
  - `year: "I"`
  - `schedule`: Array with 5 days (Monday-Friday)
  - `subjects`: Array with 8 subjects

