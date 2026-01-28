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
import StaffMyClass from './pages/staff/StaffMyClass';

import OfficeDashboard from './pages/office/OfficeDashboard';
import OfficeFeeManagement from './pages/office/OfficeFeeManagement';
import OfficeNoticeManagement from './pages/office/OfficeNoticeManagement';
import OfficeEventManagement from './pages/office/OfficeEventManagement';
import OfficeAdmissions from './pages/office/OfficeAdmissions';
import OfficeTimetable from './pages/office/OfficeTimetable';
import OfficeLetters from './pages/office/OfficeLetters';
import OfficeSettings from './pages/office/OfficeSettings';
import OfficeStaffManagement from './pages/office/OfficeStaffManagement';

import ParentDashboard from './pages/parent/ParentDashboard';
import CRDashboard from './pages/CRDashboard';
import SystemSetup from './pages/SystemSetup';
import ParentAttendance from './pages/parent/ParentAttendance';
import ParentResults from './pages/parent/ParentResults';
import ParentFees from './pages/parent/ParentFees';
import ParentTimetable from './pages/parent/ParentTimetable';
import ParentNotices from './pages/parent/ParentNotices';



import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/setup" element={<SystemSetup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Student Routes */}
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="timetable" element={<StudentTimetable />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="results" element={<StudentResults />} />
                <Route path="exams" element={<StudentExams />} />
                <Route path="fees" element={<StudentFees />} />
                <Route path="syllabus" element={<StudentSyllabus />} />
                <Route path="notices" element={<StudentNotices />} />
                <Route path="events" element={<StudentEvents />} />
                <Route path="documents" element={<StudentDocuments />} />
                <Route path="letters" element={<StudentLetters />} />
                <Route path="directory" element={<StudentDirectory />} />
                <Route path="staff-directory" element={<StudentStaffDirectory />} />
                <Route path="gallery" element={<StudentGallery />} />
                <Route path="complaint" element={<StudentComplaint />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Staff Routes */}
          <Route path="/staff/*" element={
            <ProtectedRoute allowedRoles={['Staff', 'Faculty']}>
              <Routes>
                <Route path="dashboard" element={<StaffDashboard />} />
                <Route path="profile" element={<StaffProfile />} />
                <Route path="attendance" element={<StaffAttendance />} />
                <Route path="gallery" element={<StaffGallery />} />
                <Route path="timetable" element={<StaffTimetable />} />
                <Route path="exams" element={<StaffExams />} />
                <Route path="internals" element={<StaffInternals />} />
                <Route path="notices" element={<StaffNotices />} />
                <Route path="events" element={<StaffEvents />} />
                <Route path="students" element={<StudentDirectory />} />
                <Route path="my-class" element={<StaffMyClass />} />
                <Route path="staff-directory" element={<StudentStaffDirectory />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Office Routes */}
          <Route path="/office/*" element={
            <ProtectedRoute allowedRoles={['Office', 'Admin']}>
              <Routes>
                <Route path="dashboard" element={<OfficeDashboard />} />
                <Route path="fees" element={<OfficeFeeManagement />} />
                <Route path="notices" element={<OfficeNoticeManagement />} />
                <Route path="events" element={<OfficeEventManagement />} />
                <Route path="admissions" element={<OfficeAdmissions />} />
                <Route path="timetable" element={<OfficeTimetable />} />
                <Route path="letters" element={<OfficeLetters />} />
                <Route path="settings" element={<OfficeSettings />} />
                <Route path="staff" element={<OfficeStaffManagement />} />
                <Route path="students" element={<StudentDirectory />} />
                <Route path="staff-directory" element={<StudentStaffDirectory />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Parent Routes */}
          <Route path="/parent/*" element={
            <ProtectedRoute allowedRoles={['Parent']}>
              <Routes>
                <Route path="dashboard" element={<ParentDashboard />} />
                <Route path="attendance" element={<ParentAttendance />} />
                <Route path="results" element={<ParentResults />} />
                <Route path="fees" element={<ParentFees />} />
                <Route path="timetable" element={<ParentTimetable />} />
                <Route path="notices" element={<ParentNotices />} />
              </Routes>
            </ProtectedRoute>
          } />
          {/* CR Routes */}
          <Route path="/cr/*" element={
            <ProtectedRoute allowedRoles={['cr']}>
              <Routes>
                <Route path="dashboard" element={<CRDashboard />} />
              </Routes>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
