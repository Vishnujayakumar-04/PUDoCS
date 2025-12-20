# PUDoCS - End-to-End Testing Guide

## 🎯 Testing Objectives

This guide will help you thoroughly test all three user roles and critical features of the PUDoCS mobile application.

---

## 📋 Pre-Testing Setup

### 1. Backend Setup
```bash
cd d:\SideProjects\PUDoCS\backend
npm run dev
```
✅ Verify server is running on `http://localhost:5000`

### 2. Mobile App Setup
```bash
cd d:\SideProjects\PUDoCS\mobile
npx expo start
```
✅ Launch on emulator or physical device

### 3. Create Test Users

Use Postman or curl to create test accounts:

**Student Account:**
```json
POST http://localhost:5000/api/auth/register
{
  "email": "student@pu.edu",
  "password": "test123",
  "role": "Student",
  "profileData": {
    "name": "Test Student",
    "registerNumber": "CS2021001",
    "email": "student@pu.edu",
    "course": "UG",
    "program": "B.Tech",
    "year": 3,
    "section": "A"
  }
}
```

**Staff Account:**
```json
POST http://localhost:5000/api/auth/register
{
  "email": "staff@pu.edu",
  "password": "test123",
  "role": "Staff",
  "profileData": {
    "name": "Dr. Test Staff",
    "email": "staff@pu.edu",
    "designation": "Assistant Professor",
    "department": "Computer Science"
  }
}
```

**Office Account:**
```json
POST http://localhost:5000/api/auth/register
{
  "email": "office@pu.edu",
  "password": "test123",
  "role": "Office",
  "profileData": {}
}
```

### 4. Create Sample Data

**Classroom (for seat allocation):**
```json
POST http://localhost:5000/api/classrooms
{
  "name": "CS-101",
  "building": "Main Block",
  "capacity": 60,
  "seatLayout": { "rows": 10, "columns": 6 }
}
```

---

## 🧪 Test Cases

### Phase 1: Student Module Testing

#### Test 1.1: Login & Dashboard
- [ ] Open app → Welcome screen displays
- [ ] Tap "Get Started" → Role selection screen
- [ ] Select "Student" role
- [ ] Enter credentials: `student@pu.edu` / `test123`
- [ ] **Expected**: Redirect to Student Dashboard
- [ ] **Verify**: Marquee scrolling with notices
- [ ] **Verify**: Feature grid with 8 items
- [ ] **Verify**: Bottom navigation visible

#### Test 1.2: Profile Screen
- [ ] Navigate to Profile tab
- [ ] **Verify**: Student name and register number displayed
- [ ] **Verify**: Academic info (Course, Program, Year, Section)
- [ ] **Verify**: Attendance percentage (if data exists)
- [ ] **Verify**: Fee status badges (Semester, Exam, Hostel)
- [ ] **Verify**: Exam eligibility indicator

#### Test 1.3: Timetable Screen
- [ ] Navigate to Timetable tab
- [ ] **Verify**: Day selector (Mon-Sat)
- [ ] Tap different days
- [ ] **Verify**: Time slots update
- [ ] **Verify**: Subject, faculty, room displayed
- [ ] **Verify**: Type badges (Lecture/Lab/Tutorial)

#### Test 1.4: Notices Screen
- [ ] Tap "Notices" from dashboard
- [ ] **Verify**: Notices list displayed
- [ ] **Verify**: Priority badges (Urgent/High/Medium/Low)
- [ ] **Verify**: Category badges
- [ ] **Verify**: Posted by and date information

#### Test 1.5: Exams Screen
- [ ] Navigate to Exams tab
- [ ] **Verify**: Exam list displayed
- [ ] **Verify**: Exam details (name, subject, date, time)
- [ ] **Verify**: Seat allocation section (if allocated)
- [ ] **Verify**: Hall, building, seat number

#### Test 1.6: Read-Only Verification
- [ ] **Verify**: NO edit/delete buttons anywhere
- [ ] **Verify**: NO create/add options
- [ ] **Verify**: All screens are view-only

---

### Phase 2: Staff Module Testing

#### Test 2.1: Login & Dashboard
- [ ] Logout from student account
- [ ] Login as Staff: `staff@pu.edu` / `test123`
- [ ] **Expected**: Redirect to Staff Dashboard
- [ ] **Verify**: Quick actions grid (6 items)
- [ ] **Verify**: Assigned classes section
- [ ] **Verify**: Upcoming exams section

#### Test 2.2: Student Management
- [ ] Navigate to Students tab
- [ ] **Verify**: Student list displayed
- [ ] Tap "+ Add Student"
- [ ] Fill form with test data:
  - Name: "New Student"
  - Register Number: "CS2021999"
  - Email: "newstudent@pu.edu"
  - Course: UG, Program: B.Tech, Year: 3, Section: A
- [ ] Tap "Save"
- [ ] **Expected**: Success message
- [ ] **Verify**: New student appears in list
- [ ] Tap "Edit" on a student
- [ ] Modify name
- [ ] Tap "Save"
- [ ] **Verify**: Changes reflected
- [ ] Tap "Delete" on a student
- [ ] Confirm deletion
- [ ] **Verify**: Student removed from list

#### Test 2.3: Attendance Marking
- [ ] Navigate to Dashboard → Attendance
- [ ] Select class (UG, Year 3)
- [ ] **Verify**: Student list loads
- [ ] **Verify**: Summary shows Total/Present/Absent
- [ ] Tap on students to toggle Present/Absent
- [ ] **Verify**: Cards change color (green/gray)
- [ ] **Verify**: Summary updates in real-time
- [ ] Tap "Submit Attendance"
- [ ] **Expected**: Success message

#### Test 2.4: Exam Creation
- [ ] Navigate to Exams tab
- [ ] Tap "+ Create Exam"
- [ ] Fill exam details:
  - Name: "Internal Exam 1"
  - Subject: "Data Structures"
  - Type: Internal
  - Date: Future date
  - Start Time: 10:00, End Time: 12:00
  - Duration: 120
  - Course: UG, Program: B.Tech, Year: 3, Semester: 5
- [ ] Tap "Create Exam"
- [ ] **Expected**: Success message

#### Test 2.5: Seat Allocation (CRITICAL TEST)
- [ ] From exam list, tap "Allocate Seats"
- [ ] Confirm allocation
- [ ] **Expected**: Success with statistics
- [ ] **Verify**: Total students count
- [ ] **Verify**: Halls used count
- [ ] Navigate to seat allocation view
- [ ] **Verify**: Visual seat map displayed
- [ ] **Verify**: Screen/Board indicator
- [ ] **Verify**: Row labels (A, B, C...)
- [ ] **Verify**: Seat numbers (A1, A2, B1...)
- [ ] **Verify**: Green seats (available)
- [ ] **Verify**: Red seats (allocated)
- [ ] **Verify**: Capacity statistics
- [ ] Tap "Lock Seat Allocation"
- [ ] Confirm lock
- [ ] **Expected**: Seats locked, cannot modify

#### Test 2.6: Timetable Creation
- [ ] Navigate to Dashboard → Timetable
- [ ] Tap "+ Create Timetable"
- [ ] Fill class details
- [ ] Add time slot:
  - Start: 09:00, End: 10:00
  - Subject: "Data Structures"
  - Type: Lecture
  - Faculty: "Dr. Smith"
  - Room: "CS-101"
- [ ] Tap "+ Add Slot" to add more
- [ ] Tap "Create"
- [ ] **Expected**: Success message

#### Test 2.7: Internal Marks Upload
- [ ] Navigate to Dashboard → Internals
- [ ] Select class (UG, Year 3)
- [ ] Tap "⚙️ Configure"
- [ ] Enter:
  - Subject: "Data Structures"
  - Exam: "Internal 1"
  - Max Marks: 50
- [ ] Tap "Save"
- [ ] **Verify**: Student list appears with marks input
- [ ] Enter marks for each student
- [ ] Tap "Submit Internal Marks"
- [ ] **Expected**: Success message

#### Test 2.8: Notices & Events
- [ ] Navigate to Notices tab
- [ ] Tap "Post Notice"
- [ ] Fill notice form:
  - Title: "Test Notice"
  - Content: "This is a test notice"
  - Category: Academic
  - Priority: High
- [ ] Tap "Post Notice"
- [ ] **Expected**: Success + "Pending office approval" message
- [ ] Go back, tap "Create Event"
- [ ] Fill event form:
  - Name: "Tech Fest"
  - Description: "Annual technical festival"
  - Category: Technical
  - Date: Future date
  - Venue: "Main Auditorium"
- [ ] Tap "Create Event"
- [ ] **Expected**: Success message

---

### Phase 3: Office Module Testing

#### Test 3.1: Login & Dashboard
- [ ] Logout from staff account
- [ ] Login as Office: `office@pu.edu` / `test123`
- [ ] **Expected**: Redirect to Office Dashboard
- [ ] **Verify**: Statistics cards (Total Students, Eligible, Not Eligible, Upcoming Exams)
- [ ] **Verify**: Fee status summary
- [ ] **Verify**: Quick actions grid

#### Test 3.2: Fee Management (CRITICAL TEST)
- [ ] Navigate to Fees tab
- [ ] **Verify**: Student list with fee status
- [ ] Select a student
- [ ] Tap "Update Fee Status"
- [ ] Select:
  - Fee Type: Semester Fee
  - Status: Paid
  - Amount: 50000
  - Date: Current date
  - Reference: "TXN123"
- [ ] Tap "Update"
- [ ] **Expected**: Success message
- [ ] **Verify**: Fee badge changes to green "Paid"
- [ ] Repeat for Exam Fee
- [ ] **Verify**: Both fees marked as Paid

#### Test 3.3: Exam Eligibility (CRITICAL TEST)
- [ ] Navigate to Eligibility tab
- [ ] **Verify**: Summary shows Total/Eligible/Not Eligible counts
- [ ] **Verify**: "Eligible Students" section shows students with both fees paid
- [ ] **Verify**: Green checkmark badge
- [ ] **Verify**: "Not Eligible Students" section shows students with unpaid fees
- [ ] **Verify**: Red X badge
- [ ] **Verify**: Reason displayed (e.g., "Semester fee not paid")
- [ ] **Verify**: Fee status shown for each student

#### Test 3.4: Results Upload
- [ ] Navigate to Results tab
- [ ] Tap "📊 Upload Results"
- [ ] Enter student register number
- [ ] Select semester
- [ ] Add subjects with grades:
  - Subject 1: "Data Structures", Code: "CS301", Credits: 3, Grade: A
  - Subject 2: "DBMS", Code: "CS302", Credits: 3, Grade: A+
- [ ] Tap "+ Add Subject" to add more
- [ ] Enter SGPA: 8.5, CGPA: 8.3
- [ ] Tap "Upload"
- [ ] **Expected**: Success message

#### Test 3.5: Official Notices
- [ ] Navigate to Notices tab (5th tab)
- [ ] Tap "Post Official Notice"
- [ ] Fill form:
  - Title: "Official Circular"
  - Content: "Important announcement"
  - Category: Administrative
  - Priority: Urgent
- [ ] Tap "Post Notice"
- [ ] **Expected**: Success + "Auto-approved" indication

---

### Phase 4: Cross-Role Integration Testing

#### Test 4.1: Fee → Exam Eligibility Flow
- [ ] Login as Office
- [ ] Mark student's semester fee as "Not Paid"
- [ ] Navigate to Eligibility
- [ ] **Verify**: Student appears in "Not Eligible" list
- [ ] Update semester fee to "Paid"
- [ ] Refresh eligibility
- [ ] **Verify**: Student moves to "Eligible" list (if exam fee also paid)

#### Test 4.2: Staff Notice → Office Approval Flow
- [ ] Login as Staff
- [ ] Post a notice
- [ ] Login as Office
- [ ] **Verify**: Notice appears in pending approvals (if implemented)
- [ ] Approve notice
- [ ] Login as Student
- [ ] **Verify**: Approved notice visible in student's notices

#### Test 4.3: Exam Creation → Student View Flow
- [ ] Login as Staff
- [ ] Create exam with seat allocation
- [ ] Login as Student
- [ ] Navigate to Exams tab
- [ ] **Verify**: New exam appears
- [ ] **Verify**: Seat allocation details visible
- [ ] **Verify**: Hall, building, seat number displayed

#### Test 4.4: Attendance → Student Profile Flow
- [ ] Login as Staff
- [ ] Mark attendance for a class
- [ ] Login as Student (from that class)
- [ ] Navigate to Profile
- [ ] **Verify**: Attendance percentage updated

---

## 🔍 Critical Feature Validation

### ✅ Automated Seat Allocation Algorithm
- [ ] Create exam with 30 students
- [ ] Create classroom with capacity 60 (10x6 layout)
- [ ] Allocate seats
- [ ] **Verify**: All students get unique seats
- [ ] **Verify**: Seats are sequential (A1, A2, A3...)
- [ ] **Verify**: No double-booking
- [ ] **Verify**: Capacity not exceeded

### ✅ Fee-Based Exam Eligibility
- [ ] Student with both fees paid → Eligible
- [ ] Student with semester fee unpaid → Not Eligible
- [ ] Student with exam fee unpaid → Not Eligible
- [ ] Student with both fees unpaid → Not Eligible
- [ ] **Verify**: Eligibility updates immediately after fee status change

### ✅ Role-Based Access Control
- [ ] Student cannot access Staff/Office features
- [ ] Staff cannot access Office features
- [ ] Office has full administrative access
- [ ] Unauthorized API calls return 403 error

---

## 📊 Test Results Template

| Test Case | Status | Notes |
|-----------|--------|-------|
| Student Login | ✅/❌ | |
| Student Dashboard | ✅/❌ | |
| Student Profile | ✅/❌ | |
| Student Timetable | ✅/❌ | |
| Student Exams | ✅/❌ | |
| Staff Login | ✅/❌ | |
| Student Management | ✅/❌ | |
| Attendance Marking | ✅/❌ | |
| Exam Creation | ✅/❌ | |
| **Seat Allocation** | ✅/❌ | **CRITICAL** |
| Timetable Creation | ✅/❌ | |
| Internals Upload | ✅/❌ | |
| Staff Notices | ✅/❌ | |
| Office Login | ✅/❌ | |
| **Fee Management** | ✅/❌ | **CRITICAL** |
| **Exam Eligibility** | ✅/❌ | **CRITICAL** |
| Results Upload | ✅/❌ | |
| Official Notices | ✅/❌ | |
| Fee → Eligibility Flow | ✅/❌ | **CRITICAL** |
| Seat Allocation Algorithm | ✅/❌ | **CRITICAL** |

---

## 🐛 Bug Reporting Template

```markdown
**Bug Title**: [Brief description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:

**Actual Behavior**:

**Screenshots**: [If applicable]

**Environment**:
- Device: 
- OS: 
- App Version: 
```

---

## ✅ Testing Completion Checklist

- [ ] All Student module screens tested
- [ ] All Staff module screens tested
- [ ] All Office module screens tested
- [ ] Cross-role integration flows verified
- [ ] Seat allocation algorithm validated
- [ ] Fee eligibility logic confirmed
- [ ] Role-based access control verified
- [ ] No critical bugs found
- [ ] Performance is acceptable
- [ ] UI is responsive and professional

---

**Ready for Demo!** 🎉

Once all tests pass, the application is ready for:
1. Academic evaluation
2. Deployment to production
3. User acceptance testing
4. Final presentation/viva
