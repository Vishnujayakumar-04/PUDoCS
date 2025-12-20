const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Academic', 'Exam', 'Event', 'Administrative', 'General'],
        default: 'General'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    postedBy: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['Staff', 'Office']
        },
        name: String
    },
    targetAudience: {
        course: String, // UG, PG, or 'All'
        program: String,
        year: Number
    },
    attachments: [{
        filename: String,
        url: String
    }],
    isApproved: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notice', noticeSchema);
