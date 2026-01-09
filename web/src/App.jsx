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
import StaffAttendance from './pages/staff/StaffAttendance';
import StaffGallery from './pages/staff/StaffGallery';
import StaffTimetable from './pages/staff/StaffTimetable';
import StaffExams from './pages/staff/StaffExams';
import StaffInternals from './pages/staff/StaffInternals';
import StaffNotices from './pages/staff/StaffNotices';
import StaffEvents from './pages/staff/StaffEvents';

import OfficeDashboard from './pages/office/OfficeDashboard';
import OfficeFeeManagement from './pages/office/OfficeFeeManagement';
import OfficeNoticeManagement from './pages/office/OfficeNoticeManagement';
import OfficeEventManagement from './pages/office/OfficeEventManagement';
import OfficeAdmissions from './pages/office/OfficeAdmissions';
import OfficeTimetable from './pages/office/OfficeTimetable';
import OfficeLetters from './pages/office/OfficeLetters';
import OfficeSettings from './pages/office/OfficeSettings';



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
          <Route path="/staff/attendance" element={<StaffAttendance />} />
          <Route path="/staff/gallery" element={<StaffGallery />} />
          <Route path="/staff/timetable" element={<StaffTimetable />} />
          <Route path="/staff/exams" element={<StaffExams />} />
          <Route path="/staff/internals" element={<StaffInternals />} />
          <Route path="/staff/notices" element={<StaffNotices />} />
          <Route path="/staff/events" element={<StaffEvents />} />

          {/* Office Routes */}
          <Route path="/office/dashboard" element={<OfficeDashboard />} />
          <Route path="/office/fees" element={<OfficeFeeManagement />} />
          <Route path="/office/notices" element={<OfficeNoticeManagement />} />
          <Route path="/office/events" element={<OfficeEventManagement />} />
          <Route path="/office/admissions" element={<OfficeAdmissions />} />
          <Route path="/office/timetable" element={<OfficeTimetable />} />
          <Route path="/office/letters" element={<OfficeLetters />} />
          <Route path="/office/settings" element={<OfficeSettings />} />


        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
