const Student = require('../models/Student');
const Timetable = require('../models/Timetable');
const Notice = require('../models/Notice');
const Exam = require('../models/Exam');
const Event = require('../models/Event');
const LetterFormat = require('../models/LetterFormat');
const Staff = require('../models/Staff');

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private (Student)
const getProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user.profileId);

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student timetable
// @route   GET /api/student/timetable
// @access  Private (Student)
const getTimetable = async (req, res) => {
    try {
        const student = await Student.findById(req.user.profileId);

        const timetable = await Timetable.findOne({
            category: student.course,
            program: student.program,
            year: student.year,
            section: student.section,
            isActive: true
        }).populate('schedule.slots.faculty', 'name designation');

        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }

        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get notices for student
// @route   GET /api/student/notices
// @access  Private (Student)
const getNotices = async (req, res) => {
    try {
        const student = await Student.findById(req.user.profileId);

        const notices = await Notice.find({
            isActive: true,
            isApproved: true,
            $or: [
                { 'targetAudience.course': 'All' },
                { 'targetAudience.course': student.course },
                {
                    'targetAudience.course': student.course,
                    'targetAudience.program': student.program
                },
                {
                    'targetAudience.course': student.course,
                    'targetAudience.program': student.program,
                    'targetAudience.year': student.year
                }
            ]
        }).sort({ createdAt: -1 });

        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get exams for student
// @route   GET /api/student/exams
// @access  Private (Student)
const getExams = async (req, res) => {
    try {
        const student = await Student.findById(req.user.profileId);

        const exams = await Exam.find({
            course: student.course,
            program: student.program,
            year: student.year,
            eligibleStudents: student._id
        })
            .populate('hallAllocations.classroom', 'name building')
            .sort({ date: 1 });

        // Find student's seat allocation in each exam
        const examsWithSeats = exams.map(exam => {
            let seatInfo = null;

            for (const hall of exam.hallAllocations) {
                const seat = hall.allocatedSeats.find(
                    s => s.student.toString() === student._id.toString()
                );

                if (seat) {
                    seatInfo = {
                        classroom: hall.classroom,
                        seatNumber: seat.seatNumber,
                        row: seat.row,
                        column: seat.column
                    };
                    break;
                }
            }

            return {
                ...exam.toObject(),
                mySeat: seatInfo
            };
        });

        res.json(examsWithSeats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get events
// @route   GET /api/student/events
// @access  Private (Student)
const getEvents = async (req, res) => {
    try {
        const events = await Event.find({ isActive: true }).sort({ date: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get letter formats
// @route   GET /api/student/letter-formats
// @access  Private (Student)
const getLetterFormats = async (req, res) => {
    try {
        const formats = await LetterFormat.find({ isActive: true }).sort({ category: 1 });
        res.json(formats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get results
// @route   GET /api/student/results
// @access  Private (Student)
const getResults = async (req, res) => {
    try {
        const student = await Student.findById(req.user.profileId);

        res.json({
            internals: student.internals,
            results: student.results
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get staff directory
// @route   GET /api/student/staff
// @access  Private (Student)
const getStaff = async (req, res) => {
    try {
        const staff = await Staff.find({ isActive: true }).select('-assignedClasses');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance
// @route   GET /api/student/attendance
// @access  Private (Student)
const getAttendance = async (req, res) => {
    try {
        const student = await Student.findById(req.user.profileId);
        res.json(student.attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProfile,
    getTimetable,
    getNotices,
    getExams,
    getEvents,
    getLetterFormats,
    getResults,
    getStaff,
    getAttendance
};
