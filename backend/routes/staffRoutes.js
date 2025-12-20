const express = require('express');
const router = express.Router();
const {
    getDashboard,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudents,
    markAttendance,
    manageTimetable,
    createExam,
    allocateSeats,
    lockSeats,
    uploadInternals,
    postNotice,
    createEvent
} = require('../controllers/staffController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// All routes require Staff role
router.use(protect);
router.use(requireRole('Staff'));

router.get('/dashboard', getDashboard);

// Student management
router.post('/students', addStudent);
router.get('/students', getStudents);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

// Attendance
router.post('/attendance', markAttendance);

// Timetable
router.post('/timetable', manageTimetable);

// Exam management
router.post('/exams', createExam);
router.post('/exams/:id/allocate-seats', allocateSeats);
router.put('/exams/:id/lock-seats', lockSeats);

// Internals
router.post('/internals', uploadInternals);

// Notices and Events
router.post('/notices', postNotice);
router.post('/events', createEvent);

module.exports = router;
