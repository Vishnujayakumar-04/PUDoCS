const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    examType: {
        type: String,
        enum: ['Internal', 'Semester', 'Supplementary'],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    course: {
        type: String,
        enum: ['UG', 'PG'],
        required: true
    },
    program: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    eligibleStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    hallAllocations: [{
        classroom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Classroom',
            required: true
        },
        allocatedSeats: [{
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student'
            },
            seatNumber: String,
            row: Number,
            column: Number
        }],
        capacity: Number,
        occupied: Number
    }],
    isSeatsAllocated: {
        type: Boolean,
        default: false
    },
    isSeatsLocked: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Exam', examSchema);
