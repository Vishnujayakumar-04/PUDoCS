const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    registerNumber: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    photo: {
        type: String,
        default: ''
    },
    course: {
        type: String,
        enum: ['UG', 'PG'],
        required: true
    },
    program: {
        type: String,
        required: true,
        // UG: B.Tech, B.Sc CS
        // PG: M.Sc CS, M.Sc Data Science, MCA, M.Tech Data Analytics, M.Tech NIS, M.Tech CSE
    },
    year: {
        type: Number,
        required: true
    },
    section: {
        type: String,
        default: 'A'
    },
    attendance: [{
        date: Date,
        subject: String,
        status: {
            type: String,
            enum: ['Present', 'Absent']
        }
    }],
    internals: [{
        subject: String,
        exam: String,
        marks: Number,
        maxMarks: Number,
        date: Date
    }],
    results: [{
        semester: Number,
        subject: String,
        grade: String,
        credits: Number,
        sgpa: Number,
        cgpa: Number,
        publishedDate: Date
    }],
    fees: {
        semester: {
            status: {
                type: String,
                enum: ['Paid', 'Not Paid'],
                default: 'Not Paid'
            },
            amount: Number,
            paidDate: Date,
            reference: String
        },
        exam: {
            status: {
                type: String,
                enum: ['Paid', 'Not Paid'],
                default: 'Not Paid'
            },
            amount: Number,
            paidDate: Date,
            reference: String
        },
        hostel: {
            status: {
                type: String,
                enum: ['Paid', 'Not Paid', 'N/A'],
                default: 'N/A'
            },
            amount: Number,
            paidDate: Date,
            reference: String
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for exam eligibility
studentSchema.virtual('isExamEligible').get(function () {
    return this.fees.semester.status === 'Paid' && this.fees.exam.status === 'Paid';
});

// Ensure virtuals are included in JSON
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);
