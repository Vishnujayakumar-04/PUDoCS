# M.Tech DS Student Login Verification

## What Each Student Should See After Login

When any M.Tech DS student logs in with their credentials, they should see:

### 1. Timetable: M.Tech DS 1st Year (8 subjects)
- **Location**: Student Details → Timetable
- **Shows**: Complete weekly schedule with all 8 subjects
- **Subjects**:
  1. CSDS751 - Machine Learning and Deep Learning
  2. CSDS752 - Big Data Analytics
  3. CSDS753L - Security for DS Lab
  4. CSDS753T - Security for Data Science
  5. CSDS754 - Laboratory - III (Machine Learning Lab)
  6. CSDS755 - Laboratory - IV (Big Data Analytics Lab)
  7. CSDS772 - Cloud Computing
  8. CSDS777 - Computational Intelligence

### 2. Attendance: All 8 subjects
- **Location**: Student Details → Attendance
- **Shows**: 
  - All 8 subjects listed
  - Attendance percentage for each subject
  - Overall attendance percentage
  - Eligibility status (75% required)
- **Default**: Shows all 8 subjects even if attendance data is 0%

### 3. Internal Marks: Table with all 8 subjects
- **Location**: Student Details → Exam Results → Internal Marks tab
- **Shows**: Table with columns:
  - S.No
  - Subject Code
  - Subject Name
  - Total Marks
  - Mark Secured
- **Default**: Shows all 8 subjects even if marks are not yet entered (shows "--")

### 4. Assignment Marks: Table with all 8 subjects
- **Location**: Student Details → Exam Results → Assignment Marks tab
- **Shows**: Table with columns:
  - S.No
  - Subject Code
  - Subject Name
  - Total Marks
  - Mark Secured
- **Default**: Shows all 8 subjects even if marks are not yet entered (shows "--")

### 5. Exam Schedule: Subject-specific schedules
- **Location**: Student Details → Exam Schedule
- **Shows**: 
  - Only exam schedules (with date, time, venue)
  - Filtered to show only the student's subjects
  - Not general announcements
- **Default**: Shows empty state if no schedules published yet

## Login Credentials

**Email Format**: `{registerNumber}@pondiuni.ac.in` (lowercase)
- Example: `25mtnispy0002@pondiuni.ac.in`

**Password**: `pass@123` (common for all students)

## Verification Steps

1. **Login Test**
   - Login with any M.Tech DS student email
   - Verify profile loads correctly
   - Check console logs for profile data

2. **Timetable Test**
   - Navigate to Student Details → Timetable
   - Verify all 8 subjects are displayed
   - Check that schedule shows Monday-Friday slots

3. **Attendance Test**
   - Navigate to Student Details → Attendance
   - Verify all 8 subjects are listed
   - Check that attendance percentage shows (even if 0%)

4. **Internal Marks Test**
   - Navigate to Student Details → Exam Results
   - Select "Internal Marks" tab
   - Verify table shows all 8 subjects
   - Check table headers are correct

5. **Assignment Marks Test**
   - In Exam Results screen
   - Select "Assignment Marks" tab
   - Verify table shows all 8 subjects
   - Check table headers are correct

6. **Exam Schedule Test**
   - Navigate to Student Details → Exam Schedule
   - Verify it shows exam schedules (or empty state if none)
   - Check that it doesn't show general announcements

## Console Logs to Check

When a student logs in, check console for:
- `📧 Extracted registerNumber from email: 25MTNISPY0002`
- `✅ Found profile by registerNumber in: students_pg_mtech_da_1`
- `📊 Student Profile loaded: {program: "M.Tech DS", year: "I", ...}`
- `📅 Program mapping: {original: "M.Tech DS", mapped: "M.Tech DS", year: "I"}`
- `📊 Default subjects: 8`
- `📊 Attendance data received: X subjects`
- `📊 Internal marks received: X`
- `📊 Assignment marks received: X`
- `📅 Exams data received: X`

## Troubleshooting

### Profile Not Found
- Check if student document exists in `students_pg_mtech_da_1` collection
- Verify document ID is the register number (e.g., `25MTNISPY0002`)
- Check email format matches: `25mtnispy0002@pondiuni.ac.in`

### Timetable Not Showing
- Verify timetable exists in `timetables` collection
- Check `program: "M.Tech DS"` and `year: "I"`
- Check console logs for program mapping

### Subjects Not Showing
- Verify `defaultSubjects.js` has M.Tech DS subjects
- Check profile has `program: "M.Tech DS"` and `year: "I"`
- Check console logs for default subjects count

### Marks Tables Empty
- This is normal if marks haven't been entered yet
- Tables should still show all 8 subjects with "--" for marks
- Verify table headers are visible

## Expected Behavior

✅ **Working Correctly**:
- All 8 subjects appear in Attendance
- All 8 subjects appear in Internal Marks table
- All 8 subjects appear in Assignment Marks table
- Timetable shows complete schedule
- Exam Schedule shows only schedules (not announcements)

❌ **Not Working**:
- No subjects showing
- Wrong subjects showing
- Timetable not loading
- Profile not found errors

