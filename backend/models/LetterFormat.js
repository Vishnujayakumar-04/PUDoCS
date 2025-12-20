const mongoose = require('mongoose');

const letterFormatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Leave Letter', 'Mess Reduction', 'NSP Scholarship', 'Hostel Form', 'Merit Scholarship', 'Bonafide Certificate', 'Other'],
        required: true
    },
    template: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    fields: [{
        fieldName: String,
        fieldType: String, // text, date, number
        placeholder: String,
        required: Boolean
    }],
    uploadedBy: {
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
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LetterFormat', letterFormatSchema);
