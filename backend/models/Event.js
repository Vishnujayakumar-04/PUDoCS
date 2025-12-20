const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Cultural', 'Technical', 'Sports', 'Workshop', 'Seminar', 'Hackathon', 'Festival', 'Other'],
        required: true
    },
    eventType: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Completed'],
        default: 'Upcoming'
    },
    date: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    time: {
        type: String
    },
    venue: {
        type: String,
        required: true
    },
    organizer: {
        type: String
    },
    photos: [{
        url: String,
        caption: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    registrationRequired: {
        type: Boolean,
        default: false
    },
    registrationLink: {
        type: String
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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

module.exports = mongoose.model('Event', eventSchema);
