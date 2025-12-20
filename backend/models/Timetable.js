const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    category: {
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
    section: {
        type: String,
        default: 'A'
    },
    schedule: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            required: true
        },
        slots: [{
            startTime: String,
            endTime: String,
            subject: String,
            faculty: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Staff'
            },
            room: String,
            type: {
                type: String,
                enum: ['Lecture', 'Lab', 'Tutorial'],
                default: 'Lecture'
            }
        }]
    }],
    semester: {
        type: Number,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
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

module.exports = mongoose.model('Timetable', timetableSchema);
