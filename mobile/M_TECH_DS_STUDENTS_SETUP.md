# M.Tech DS Students Setup

## Overview
This document explains the setup for M.Tech Data Science 1st Year students.

## Student List
All 22 students have been configured:

1. Durgadevi – 25MTNISPY0002
2. Vijayadamodaran N – 25MTNISPY0003
3. Rachakonda Sagar – 25MTNISPY0004
4. Ayesetty Jaswanth Sai Raj – 25MTNISPY0005
5. Davinsi Ragamalika M – 25MTNISPY0006 ✅ (Already done)
6. Naveenraj N – 25MTNISPY0007
7. Gokulakannan C – 25MTNISPY0008
8. Santhosh V – 25MTNISPY0009
9. Anandhakumar P – 25MTNISPY0010
10. Monika K – 25MTNISPY0011
11. Preethi Ravi – 25MTNISPY0012
12. Asvina S – 25MTNISPY0013
13. Lagudu Yernaidu – 25MTNISPY0014
14. Akash J – 25MTNISPY0015
15. Harish S – 25MTNISPY0017
16. Eashwar R – 25MTNISPY0018
17. Harshath K – 25MTNISPY0019
18. Kishore Chakkaravarthi M N – 25MTNISPY0020
19. Arun – 25MTNISPY0023
20. Agilan A – 25MTNISPY0024
21. Praveena – 25MTNISPY0025
22. Sivaprrasath S J – 25MTNISPY0026

## Firestore Collection
- **Collection Name**: `students_pg_mtech_da_1`
- **Document ID**: Register Number (e.g., `25MTNISPY0002`)

## Student Profile Structure
Each student document contains:
```javascript
{
  registerNumber: "25MTNISPY0002",
  name: "Durgadevi",
  email: "25mtnispy0002@pondiuni.ac.in",
  program: "M.Tech DS",
  year: "I",
  course: "PG",
  photoUrl: null,  // Students will add their own photo
  photo: null,     // Students will add their own photo
  phone: "",
  gender: "",
  fatherName: "",
  fatherMobile: "",
  motherName: "",
  motherMobile: "",
  caste: "",
  houseAddress: "",
  createdAt: "2025-01-27T...",
  updatedAt: "2025-01-27T..."
}
```

## Login Credentials
- **Email Format**: `{registerNumber}@pondiuni.ac.in` (lowercase)
- **Example**: `25mtnispy0002@pondiuni.ac.in`
- **Password**: Set by admin during account creation

## What Students Can See
Once logged in, each student will see:
1. **Timetable**: M.Tech DS 1st Year timetable (8 subjects)
2. **Attendance**: All 8 subjects with attendance tracking
3. **Internal Marks**: Table with all 8 subjects (marks added by staff)
4. **Assignment Marks**: Table with all 8 subjects (marks added by staff)
5. **Exam Schedule**: Their subject-specific exam schedules

## Profile Photos
- **Initial State**: Photos are empty/null
- **Students can add**: Their own photo through the Profile screen
- **Storage**: Photos are stored in Firebase Storage
- **Path**: `studentPhotos/{registerNumber}/profile.jpg`

## Automatic Seeding
The app automatically seeds:
1. **Timetable**: M.Tech DS 1st Year timetable on app start
2. **Students**: All 22 student profiles on app start

## Manual Seeding (if needed)
If you need to manually seed students:

```javascript
import { seedMTechDSStudents } from './utils/seedMTechDSStudents';

const result = await seedMTechDSStudents();
console.log(result);
```

## Default Subjects (8 Subjects)
1. CSDS751 - Machine Learning and Deep Learning
2. CSDS752 - Big Data Analytics
3. CSDS753L - Security for DS Lab
4. CSDS753T - Security for Data Science
5. CSDS754 - Laboratory - III (Machine Learning Lab)
6. CSDS755 - Laboratory - IV (Big Data Analytics Lab)
7. CSDS772 - Cloud Computing
8. CSDS777 - Computational Intelligence

## Notes
- All students are in the same collection: `students_pg_mtech_da_1`
- Each student's document ID is their register number
- Photos are optional and can be added later by students
- The system automatically finds students by email or register number

