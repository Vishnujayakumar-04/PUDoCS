const express = require('express');
const router = express.Router();
const {
    getProfile,
    getTimetable,
    getNotices,
    getExams,
    getEvents,
    getLetterFormats,
    getResults,
    getStaff,
    getAttendance
} = require('../controllers/studentController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// All routes require Student role
router.use(protect);
router.use(requireRole('Student'));

router.get('/profile', getProfile);
router.get('/timetable', getTimetable);
router.get('/notices', getNotices);
router.get('/exams', getExams);
router.get('/events', getEvents);
router.get('/letter-formats', getLetterFormats);
router.get('/results', getResults);
router.get('/staff', getStaff);
router.get('/attendance', getAttendance);

module.exports = router;
