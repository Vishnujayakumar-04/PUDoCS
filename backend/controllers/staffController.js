const Student = require('../models/Student');
const Timetable = require('../models/Timetable');
const Exam = require('../models/Exam');
const Classroom = require('../models/Classroom');
const Notice = require('../models/Notice');
const Event = require('../models/Event');

// @desc    Get staff dashboard data
// @route   GET /api/staff/dashboard
// @access  Private (Staff)
const getDashboard = async (req, res) => {
    try {
        const staff = await req.user.populate('profileId');

        // Get upcoming exams
        const upcomingExams = await Exam.find({
            createdBy: req.user.profileId,
            date: { $gte: new Date() }
        }).limit(5).sort({ date: 1 });

        // Get recent notices
        const recentNotices = await Notice.find({
            'postedBy.userId': req.user._id
        }).limit(5).sort({ createdAt: -1 });

        res.json({
            assignedClasses: staff.profileId.assignedClasses,
            upcomingExams,
            recentNotices
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new student
// @route   POST /api/staff/students
// @access  Private (Staff)
const addStudent = async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student
// @route   PUT /api/staff/students/:id
// @access  Private (Staff)
const updateStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete student
// @route   DELETE /api/staff/students/:id
// @access  Private (Staff)
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'Student deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get students by class
// @route   GET /api/staff/students
// @access  Private (Staff)
const getStudents = async (req, res) => {
    try {
        const { course, program, year, section } = req.query;

        const query = { isActive: true };
        if (course) query.course = course;
        if (program) query.program = program;
        if (year) query.year = year;
        if (section) query.section = section;

        const students = await Student.find(query).sort({ registerNumber: 1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark attendance
// @route   POST /api/staff/attendance
// @access  Private (Staff)
const markAttendance = async (req, res) => {
    try {
        const { studentIds, date, subject, status } = req.body;

        const updates = studentIds.map(async (studentId) => {
            return Student.findByIdAndUpdate(
                studentId,
                {
                    $push: {
                        attendance: { date, subject, status }
                    }
                },
                { new: true }
            );
        });

        await Promise.all(updates);

        res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create/Update timetable
// @route   POST /api/staff/timetable
// @access  Private (Staff)
const manageTimetable = async (req, res) => {
    try {
        const { category, program, year, section, schedule, semester, academicYear } = req.body;

        let timetable = await Timetable.findOne({
            category,
            program,
            year,
            section,
            semester,
            academicYear
        });

        if (timetable) {
            timetable.schedule = schedule;
            timetable.updatedAt = Date.now();
            await timetable.save();
        } else {
            timetable = await Timetable.create(req.body);
        }

        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create exam
// @route   POST /api/staff/exams
// @access  Private (Staff)
const createExam = async (req, res) => {
    try {
        const examData = {
            ...req.body,
            createdBy: req.user.profileId
        };

        // Get eligible students based on course, program, year
        const students = await Student.find({
            course: req.body.course,
            program: req.body.program,
            year: req.body.year,
            isActive: true
        });

        // Filter students who are exam eligible (fees paid)
        const eligibleStudents = students.filter(student => student.isExamEligible);

        examData.eligibleStudents = eligibleStudents.map(s => s._id);

        const exam = await Exam.create(examData);
        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auto-allocate exam seats (CRITICAL FEATURE)
// @route   POST /api/staff/exams/:id/allocate-seats
// @access  Private (Staff)
const allocateSeats = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id).populate('eligibleStudents');

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (exam.isSeatsLocked) {
            return res.status(400).json({ message: 'Seats are already locked' });
        }

        const eligibleStudents = exam.eligibleStudents;
        const totalStudents = eligibleStudents.length;

        if (totalStudents === 0) {
            return res.status(400).json({ message: 'No eligible students for this exam' });
        }

        // Get available classrooms sorted by capacity
        const classrooms = await Classroom.find({ isActive: true }).sort({ capacity: -1 });

        if (classrooms.length === 0) {
            return res.status(400).json({ message: 'No classrooms available' });
        }

        // Seat allocation algorithm
        const hallAllocations = [];
        let studentIndex = 0;

        for (const classroom of classrooms) {
            if (studentIndex >= totalStudents) break;

            const { rows, columns } = classroom.seatLayout;
            const classroomCapacity = rows * columns;
            const allocatedSeats = [];

            // Allocate seats in this classroom
            for (let row = 1; row <= rows && studentIndex < totalStudents; row++) {
                for (let col = 1; col <= columns && studentIndex < totalStudents; col++) {
                    const student = eligibleStudents[studentIndex];
                    const seatNumber = `${String.fromCharCode(64 + row)}${col}`;

                    allocatedSeats.push({
                        student: student._id,
                        seatNumber,
                        row,
                        column: col
                    });

                    studentIndex++;
                }
            }

            hallAllocations.push({
                classroom: classroom._id,
                allocatedSeats,
                capacity: classroomCapacity,
                occupied: allocatedSeats.length
            });
        }

        // Check if all students were allocated
        if (studentIndex < totalStudents) {
            return res.status(400).json({
                message: `Insufficient classroom capacity. ${totalStudents - studentIndex} students could not be allocated.`
            });
        }

        // Update exam with allocations
        exam.hallAllocations = hallAllocations;
        exam.isSeatsAllocated = true;
        exam.updatedAt = Date.now();
        await exam.save();

        await exam.populate('hallAllocations.classroom');
        await exam.populate('hallAllocations.allocatedSeats.student', 'name registerNumber');

        res.json({
            message: 'Seats allocated successfully',
            exam,
            stats: {
                totalStudents,
                hallsUsed: hallAllocations.length,
                allocations: hallAllocations.map(h => ({
                    classroom: h.classroom,
                    occupied: h.occupied,
                    capacity: h.capacity
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lock seat allocation
// @route   PUT /api/staff/exams/:id/lock-seats
// @access  Private (Staff)
const lockSeats = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (!exam.isSeatsAllocated) {
            return res.status(400).json({ message: 'Seats must be allocated before locking' });
        }

        exam.isSeatsLocked = true;
        exam.updatedAt = Date.now();
        await exam.save();

        res.json({ message: 'Seats locked successfully', exam });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload internal marks
// @route   POST /api/staff/internals
// @access  Private (Staff)
const uploadInternals = async (req, res) => {
    try {
        const { studentId, subject, exam, marks, maxMarks } = req.body;

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.internals.push({
            subject,
            exam,
            marks,
            maxMarks,
            date: new Date()
        });

        await student.save();

        res.json({ message: 'Internal marks uploaded successfully', student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Post notice
// @route   POST /api/staff/notices
// @access  Private (Staff)
const postNotice = async (req, res) => {
    try {
        const staff = await req.user.populate('profileId');

        const notice = await Notice.create({
            ...req.body,
            postedBy: {
                userId: req.user._id,
                role: 'Staff',
                name: staff.profileId.name
            }
        });

        res.status(201).json(notice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create event
// @route   POST /api/staff/events
// @access  Private (Staff)
const createEvent = async (req, res) => {
    try {
        const event = await Event.create({
            ...req.body,
            postedBy: req.user._id
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};
