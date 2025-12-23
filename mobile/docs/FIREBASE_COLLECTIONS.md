# Firebase Firestore Collections Structure

This document outlines the expected Firestore collection structures based on the service implementations.

## Collections

### `users`
User authentication and role information.

**Document Structure:**
```javascript
{
  uid: string,              // Firebase Auth UID
  email: string,            // User email
  role: string,             // "Student" | "Staff" | "Office"
  isActive: boolean,        // Account status
  createdAt: string         // ISO timestamp
}
```

**Queries:**
- Get user by ID: `doc(db, "users", userId)`

---

### `students`
Student profile and academic information.

**Document Structure:**
```javascript
{
  id: string,               // Document ID
  name: string,             // Student full name
  registerNumber: string,   // Registration number (e.g., "24MSCSPY0054")
  email: string,            // Student email
  course: string,           // Course name (e.g., "M.Sc. Computer Science")
  program: string,          // Program name
  year: string,             // Academic year (e.g., "I", "II")
  section: string,          // Section (e.g., "Batch II")
  academicYear: string,     // Academic year for filtering
  isActive: boolean,        // Student status
  
  // Fees
  fees: {
    semester: boolean,      // Semester fee paid
    exam: boolean,         // Exam fee paid
    hostel: boolean        // Hostel fee paid (optional)
  },
  
  // Attendance (array of attendance records)
  attendance: [
    {
      date: string,         // ISO date string
      subject: string,     // Subject name
      status: string       // "Present" | "Absent"
    }
  ],
  
  // Internals (array of internal marks)
  internals: [
    {
      subject: string,
      marks: number,
      maxMarks: number
    }
  ],
  
  // Results (array of semester results)
  results: [
    {
      semester: number,
      gpa: number,
      subjects: [...]
    }
  ],
  
  createdAt: string         // ISO timestamp
}
```

**Queries:**
- Get student by ID: `doc(db, "students", studentId)`
- Get students by program: `query(collection(db, "students"), where("program", "==", program), where("academicYear", "==", year))`
- Get all students: `collection(db, "students")`

---

### `timetables`
Class timetables organized by program and year.

**Document Structure:**
```javascript
{
  id: string,               // Document ID
  program: string,         // Program name (e.g., "M.Sc. Computer Science")
  year: string,            // Year (e.g., "I", "II")
  
  // Schedule array
  schedule: [
    {
      day: string,          // "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday"
      slots: [
        {
          startTime: string,    // "09:30 AM"
          endTime: string,      // "10:30 AM"
          subject: string,      // Subject name
          type: string,         // "Lecture" | "Lab" | "Softcore"
          faculty: {
            name: string       // Faculty name
          },
          room: string          // Room/Lab number
        }
      ]
    }
  ],
  
  createdAt: string,        // ISO timestamp
  updatedAt: string         // ISO timestamp
}
```

**Queries:**
- Get timetable: `query(collection(db, "timetables"), where("program", "==", program), where("year", "==", year))`

---

### `exams`
Examination schedules and seat allocations.

**Document Structure:**
```javascript
{
  id: string,               // Document ID
  name: string,             // Exam name
  subject: string,          // Subject name
  type: string,             // Exam type
  date: string,             // Exam date (ISO or formatted string)
  startTime: string,        // Start time
  endTime: string,          // End time
  course: string,           // Course code (e.g., "CSSC 422")
  venue: string,            // Venue name
  
  // Eligible students (populated when exam is created)
  eligibleStudents: [
    {
      id: string,           // Student document ID
      name: string,         // Student name
      registerNumber: string // Registration number
    }
  ],
  
  // Hall allocations (populated after seat allocation)
  hallAllocations: [
    {
      hallId: string,       // Classroom document ID
      hallName: string,     // Classroom name
      students: [
        {
          studentId: string,
          studentName: string,
          registerNumber: string,
          seatNumber: number,  // Seat number (1-based)
          row: number,         // Row number
          column: number       // Column number
        }
      ]
    }
  ],
  
  isSeatsAllocated: boolean,  // Whether seats have been allocated
  isSeatsLocked: boolean,     // Whether allocation is locked
  createdAt: string,          // ISO timestamp
  updatedAt: string           // ISO timestamp
}
```

**Queries:**
- Get all exams: `query(collection(db, "exams"), orderBy("date", "asc"))`
- Get exam by ID: `doc(db, "exams", examId)`

---

### `classrooms`
Examination halls and their capacity information.

**Document Structure:**
```javascript
{
  id: string,               // Document ID
  name: string,             // Classroom name (e.g., "Examination Hall A")
  building: string,         // Building name
  capacity: number,         // Total seat capacity
  seatLayout: {
    rows: number,           // Number of rows
    columns: number        // Number of columns per row
  },
  isAvailable: boolean,    // Availability status
  createdAt: string        // ISO timestamp
}
```

**Queries:**
- Get all classrooms: `collection(db, "classrooms")`

---

### `notices`
Announcements and notices.

**Document Structure:**
```javascript
{
  id: string,               // Document ID
  category: string,         // "Academic" | "Exam" | "Event" | "Fees"
  title: string,            // Notice title
  content: string,          // Notice content/description
  date: string,             // Display date (e.g., "2 hours ago")
  isPriority: boolean,      // Priority flag
  isApproved: boolean,      // Approval status (for staff notices)
  postedBy: string,         // Posted by (user ID or name)
  createdAt: string,       // ISO timestamp (for ordering)
  updatedAt: string         // ISO timestamp
}
```

**Queries:**
- Get notices: `query(collection(db, "notices"), orderBy("createdAt", "desc"), limit(count))`

---

### `events`
Department events and activities.

**Document Structure:**
```javascript
{
  id: string,               // Document ID
  name: string,             // Event name
  date: string,             // Event date (formatted or ISO)
  location: string,         // Event location
  description: string,      // Event description (optional)
  images: [string],         // Array of image URLs (optional)
  createdAt: string         // ISO timestamp
}
```

**Queries:**
- Get events: `query(collection(db, "events"), orderBy("date", "asc"))`

---

## Indexes Required

Firestore may require composite indexes for certain queries:

1. **Students by Program and Year:**
   - Collection: `students`
   - Fields: `program` (Ascending), `academicYear` (Ascending)

2. **Timetables by Program and Year:**
   - Collection: `timetables`
   - Fields: `program` (Ascending), `year` (Ascending)

3. **Students by Course, Year, and Active Status:**
   - Collection: `students`
   - Fields: `course` (Ascending), `year` (Ascending), `isActive` (Ascending)

---

## Security Rules

Ensure Firestore security rules are configured in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only server/admin can write
    }
    
    // Students can read their own profile
    match /students/{studentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Staff';
    }
    
    // Timetables are read-only for students
    match /timetables/{timetableId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Staff';
    }
    
    // Exams are read-only for students
    match /exams/{examId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Staff';
    }
    
    // Notices are readable by all authenticated users
    match /notices/{noticeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Staff' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Office');
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Office';
    }
    
    // Events are readable by all authenticated users
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Staff';
    }
    
    // Classrooms are readable by all authenticated users
    match /classrooms/{classroomId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Office';
    }
  }
}
```

---

## Data Seeding Recommendations

To populate Firestore with initial data, consider creating a seeding script that:

1. Creates sample students with proper fee structures
2. Creates timetables for all programs and years
3. Creates sample exams
4. Creates classrooms with capacity information
5. Creates sample notices and events

This ensures the app works correctly even when Firestore is empty (fallback mock data is used in services).

