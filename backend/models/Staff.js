const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
    department: {
        type: String,
        default: 'Computer Science'
    },
    designation: {
        type: String,
        required: true
        // Professor, Associate Professor, Assistant Professor, etc.
    },
    phone: {
        type: String
    },
    assignedClasses: [{
        course: String,
        program: String,
        year: Number,
        section: String,
        subject: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Staff', staffSchema);
