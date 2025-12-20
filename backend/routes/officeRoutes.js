const express = require('express');
const router = express.Router();
const {
    getDashboard,
    getStudents,
    updateFees,
    getExamEligibility,
    uploadResults,
    uploadLetterFormat,
    postNotice,
    approveNotice,
    verifyStudent
} = require('../controllers/officeController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// All routes require Office role
router.use(protect);
router.use(requireRole('Office'));

router.get('/dashboard', getDashboard);

// Student management
router.get('/students', getStudents);
router.put('/students/:id/verify', verifyStudent);

// Fee management
router.put('/fees/:studentId', updateFees);
router.get('/exam-eligibility', getExamEligibility);

// Results
router.post('/results', uploadResults);

// Letter formats
router.post('/letter-formats', uploadLetterFormat);

// Notices
router.post('/notices', postNotice);
router.put('/notices/:id/approve', approveNotice);

module.exports = router;
