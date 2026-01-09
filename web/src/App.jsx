import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginScreen from './pages/LoginScreen';
import Dashboard from './pages/Dashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentTimetable from './pages/student/StudentTimetable';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentResults from './pages/student/StudentResults';
import StudentExams from './pages/student/StudentExams';
import StudentNotices from './pages/student/StudentNotices';
import StudentEvents from './pages/student/StudentEvents';
import StudentDocuments from './pages/student/StudentDocuments';
import StudentLetters from './pages/student/StudentLetters';
import StudentDirectory from './pages/student/StudentDirectory';
import StudentStaffDirectory from './pages/student/StudentStaffDirectory';
import StudentGallery from './pages/student/StudentGallery';
import StudentComplaint from './pages/student/StudentComplaint';
import StudentFees from './pages/student/StudentFees';
import StudentSyllabus from './pages/student/StudentSyllabus';
import StudentDashboard from './pages/student/StudentDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffProfile from './pages/staff/StaffProfile';
import StaffStudentManagement from './pages/staff/StaffStudentManagement';
// import StaffAttendance from './pages/staff/StaffAttendance';



function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/timetable" element={<StudentTimetable />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/results" element={<StudentResults />} />
          <Route path="/student/exams" element={<StudentExams />} />
          <Route path="/student/fees" element={<StudentFees />} />
          <Route path="/student/syllabus" element={<StudentSyllabus />} />
          <Route path="/student/notices" element={<StudentNotices />} />
          <Route path="/student/events" element={<StudentEvents />} />
          <Route path="/student/documents" element={<StudentDocuments />} />
          <Route path="/student/letters" element={<StudentLetters />} />
          <Route path="/student/directory" element={<StudentDirectory />} />
          <Route path="/student/staff-directory" element={<StudentStaffDirectory />} />
          <Route path="/student/gallery" element={<StudentGallery />} />
          <Route path="/student/complaint" element={<StudentComplaint />} />

          {/* Staff Routes */}
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/profile" element={<StaffProfile />} />
          <Route path="/staff/students" element={<StaffStudentManagement />} />
          {/* <Route path="/staff/attendance" element={<StaffAttendance />} /> */}


        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
