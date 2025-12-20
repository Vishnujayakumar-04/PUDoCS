const Student = require('../models/Student');
const Exam = require('../models/Exam');
const LetterFormat = require('../models/LetterFormat');
const Notice = require('../models/Notice');

// @desc    Get office dashboard
// @route   GET /api/office/dashboard
// @access  Private (Office)
const getDashboard = async (req, res) => {
    try {
        // Total students
        const totalStudents = await Student.countDocuments({ isActive: true });

        // Fee status summary
        const semesterFeePaid = await Student.countDocuments({
            isActive: true,
            'fees.semester.status': 'Paid'
        });
        const examFeePaid = await Student.countDocuments({
            isActive: true,
            'fees.exam.status': 'Paid'
        });

        // Exam eligibility count
        const students = await Student.find({ isActive: true });
        const examEligible = students.filter(s => s.isExamEligible).length;

        // Upcoming exams
        const upcomingExams = await Exam.find({
            date: { $gte: new Date() }
        }).limit(5).sort({ date: 1 });

        res.json({
            totalStudents,
            feeStatus: {
                semesterFeePaid,
                semesterFeeNotPaid: totalStudents - semesterFeePaid,
                examFeePaid,
                examFeeNotPaid: totalStudents - examFeePaid
            },
            examEligibility: {
                eligible: examEligible,
                notEligible: totalStudents - examEligible
            },
            upcomingExams
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students with fee status
// @route   GET /api/office/students
// @access  Private (Office)
const getStudents = async (req, res) => {
    try {
        const students = await Student.find({ isActive: true })
            .select('name registerNumber course program year fees')
            .sort({ registerNumber: 1 });

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student fees
// @route   PUT /api/office/fees/:studentId
// @access  Private (Office)
const updateFees = async (req, res) => {
    try {
        const { feeType, status, amount, paidDate, reference } = req.body;

        const student = await Student.findById(req.params.studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Update specific fee type
        if (feeType === 'semester') {
            student.fees.semester = { status, amount, paidDate, reference };
        } else if (feeType === 'exam') {
            student.fees.exam = { status, amount, paidDate, reference };
        } else if (feeType === 'hostel') {
            student.fees.hostel = { status, amount, paidDate, reference };
        }

        await student.save();

        res.json({
            message: 'Fee status updated successfully',
            student,
            isExamEligible: student.isExamEligible
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get exam eligibility report
// @route   GET /api/office/exam-eligibility
// @access  Private (Office)
const getExamEligibility = async (req, res) => {
    try {
        const students = await Student.find({ isActive: true })
            .select('name registerNumber course program year fees');

        const eligible = [];
        const notEligible = [];

        students.forEach(student => {
            const studentData = {
                _id: student._id,
                name: student.name,
                registerNumber: student.registerNumber,
                course: student.course,
                program: student.program,
                year: student.year,
                semesterFee: student.fees.semester.status,
                examFee: student.fees.exam.status
            };

            if (student.isExamEligible) {
                eligible.push(studentData);
            } else {
                notEligible.push({
                    ...studentData,
                    reason: student.fees.semester.status !== 'Paid'
                        ? 'Semester fee not paid'
                        : 'Exam fee not paid'
                });
            }
        });

        res.json({
            eligible,
            notEligible,
            summary: {
                totalStudents: students.length,
                eligibleCount: eligible.length,
                notEligibleCount: notEligible.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload semester results
// @route   POST /api/office/results
// @access  Private (Office)
const uploadResults = async (req, res) => {
    try {
        const { studentId, semester, subject, grade, credits, sgpa, cgpa } = req.body;

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.results.push({
            semester,
            subject,
            grade,
            credits,
            sgpa,
            cgpa,
            publishedDate: new Date()
        });

        await student.save();

        res.json({ message: 'Results uploaded successfully', student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload letter format template
// @route   POST /api/office/letter-formats
// @access  Private (Office)
const uploadLetterFormat = async (req, res) => {
    try {
        const letterFormat = await LetterFormat.create({
            ...req.body,
            uploadedBy: req.user._id
        });

        res.status(201).json(letterFormat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Post official notice
// @route   POST /api/office/notices
// @access  Private (Office)
const postNotice = async (req, res) => {
    try {
        const notice = await Notice.create({
            ...req.body,
            postedBy: {
                userId: req.user._id,
                role: 'Office',
                name: 'Department Office'
            },
            isApproved: true // Office notices are auto-approved
        });

        res.status(201).json(notice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve staff notice
// @route   PUT /api/office/notices/:id/approve
// @access  Private (Office)
const approveNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        notice.isApproved = true;
        notice.approvedBy = req.user._id;
        await notice.save();

        res.json({ message: 'Notice approved successfully', notice });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify and lock student records
// @route   PUT /api/office/students/:id/verify
// @access  Private (Office)
const verifyStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'Student record verified successfully', student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboard,
    getStudents,
    updateFees,
    getExamEligibility,
    uploadResults,
    uploadLetterFormat,
    postNotice,
    approveNotice,
    verifyStudent
};
