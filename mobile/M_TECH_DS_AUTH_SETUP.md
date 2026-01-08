# M.Tech DS Students - Authentication Setup Guide

## Overview
This guide explains how to set up Firebase Auth accounts for all 22 M.Tech DS students.

## Student Credentials

### Email Format
- **Format**: `{registerNumber}@pondiuni.ac.in` (lowercase)
- **Example**: `25mtnispy0002@pondiuni.ac.in`

### Common Password
- **Password**: `pass@123`
- **Note**: Students can change this password once after first login

## Student List with Emails

1. Durgadevi – `25mtnispy0002@pondiuni.ac.in`
2. Vijayadamodaran N – `25mtnispy0003@pondiuni.ac.in`
3. Rachakonda Sagar – `25mtnispy0004@pondiuni.ac.in`
4. Ayesetty Jaswanth Sai Raj – `25mtnispy0005@pondiuni.ac.in`
5. Davinsi Ragamalika M – `25mtnispy0006@pondiuni.ac.in`
6. Naveenraj N – `25mtnispy0007@pondiuni.ac.in`
7. Gokulakannan C – `25mtnispy0008@pondiuni.ac.in`
8. Santhosh V – `25mtnispy0009@pondiuni.ac.in`
9. Anandhakumar P – `25mtnispy0010@pondiuni.ac.in`
10. Monika K – `25mtnispy0011@pondiuni.ac.in`
11. Preethi Ravi – `25mtnispy0012@pondiuni.ac.in`
12. Asvina S – `25mtnispy0013@pondiuni.ac.in`
13. Lagudu Yernaidu – `25mtnispy0014@pondiuni.ac.in`
14. Akash J – `25mtnispy0015@pondiuni.ac.in`
15. Harish S – `25mtnispy0017@pondiuni.ac.in`
16. Eashwar R – `25mtnispy0018@pondiuni.ac.in`
17. Harshath K – `25mtnispy0019@pondiuni.ac.in`
18. Kishore Chakkaravarthi M N – `25mtnispy0020@pondiuni.ac.in`
19. Arun – `25mtnispy0023@pondiuni.ac.in`
20. Agilan A – `25mtnispy0024@pondiuni.ac.in`
21. Praveena – `25mtnispy0025@pondiuni.ac.in`
22. Sivaprrasath S J – `25mtnispy0026@pondiuni.ac.in`

## Setup Methods

### Method 1: Firebase Console (Recommended for Initial Setup)

1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. For each student:
   - Email: `25mtnispy0002@pondiuni.ac.in` (lowercase)
   - Password: `pass@123`
   - Click "Add user"
4. Repeat for all 22 students

### Method 2: Using Firebase Admin SDK (Server-Side)

If you have a backend server with Firebase Admin SDK:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const students = [
  { email: '25mtnispy0002@pondiuni.ac.in', password: 'pass@123' },
  // ... all 22 students
];

async function createAccounts() {
  for (const student of students) {
    try {
      await admin.auth().createUser({
        email: student.email,
        password: student.password,
        emailVerified: false
      });
      console.log(`✅ Created: ${student.email}`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`ℹ️ Already exists: ${student.email}`);
      } else {
        console.error(`❌ Error: ${student.email}`, error);
      }
    }
  }
}

createAccounts();
```

### Method 3: Manual Registration (One-Time)

Students can register themselves:
1. Open the app
2. Go to Registration screen
3. Enter their email: `25mtnispy0002@pondiuni.ac.in`
4. Enter password: `pass@123`
5. Select role: "Student"
6. Complete registration

### Method 4: Import CSV (Firebase Console)

1. Prepare a CSV file with emails:
```csv
email,password
25mtnispy0002@pondiuni.ac.in,pass@123
25mtnispy0003@pondiuni.ac.in,pass@123
...
```

2. Go to Firebase Console → Authentication → Users
3. Click "Import users"
4. Upload CSV file
5. Map columns: email → email, password → password
6. Click "Import"

## After Creating Auth Accounts

Once Firebase Auth accounts are created, the system will:
1. **Auto-create user documents** in `users` collection on first login
2. **Link to student profile** in `students_pg_mtech_da_1` collection
3. **Enable login** with email and password

## User Document Structure

When a student logs in, a document is created in `users` collection:
```javascript
{
  uid: "firebase-auth-uid",
  email: "25mtnispy0002@pondiuni.ac.in",
  role: "Student",
  registerNumber: "25MTNISPY0002",
  name: "Durgadevi",
  isActive: true,
  createdAt: "2025-01-27T...",
  updatedAt: "2025-01-27T..."
}
```

## Password Change Policy

- Students can change password **once** after first login
- After that, they need to contact office for password reset
- This is enforced in the `changePassword` function

## Verification Checklist

After setup, verify:
- [ ] All 22 Firebase Auth accounts created
- [ ] All 22 student profiles in `students_pg_mtech_da_1` collection
- [ ] All students can log in with `pass@123`
- [ ] Each student sees their own timetable
- [ ] Each student sees their own attendance (8 subjects)
- [ ] Each student sees their own marks tables

## Troubleshooting

### Student can't log in
1. Check if Firebase Auth account exists
2. Verify email format (lowercase)
3. Check password is correct (`pass@123`)
4. Check if account is disabled in Firebase Console

### Student profile not found
1. Verify student document exists in `students_pg_mtech_da_1`
2. Check registerNumber matches email prefix
3. Verify email in student document matches Auth email

### Student sees wrong data
1. Check student's `program` field is "M.Tech DS"
2. Check student's `year` field is "I"
3. Verify timetable exists for "M.Tech DS" year "I"

