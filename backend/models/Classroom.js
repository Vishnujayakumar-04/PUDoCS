const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    building: {
        type: String,
        required: true
    },
    floor: {
        type: Number
    },
    capacity: {
        type: Number,
        required: true
    },
    seatLayout: {
        rows: {
            type: Number,
            required: true
        },
        columns: {
            type: Number,
            required: true
        }
    },
    facilities: [{
        type: String
        // Projector, AC, Smart Board, etc.
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

module.exports = mongoose.model('Classroom', classroomSchema);
