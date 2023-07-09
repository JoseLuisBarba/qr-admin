const mongoose = require('mongoose');


const DeviceSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            unique : true,
            uppercase: true,
            required: true
        },
        serie: {
            type: String,
            uppercase: true,
            required: true
        },
        march: {
            type: String,
            uppercase: true,
            index: true,
            required: true
        },
        model: {
            type: String,
            uppercase: true,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        color: {
            type: String,
            uppercase: true,
            required: true
        },
        status: {
            type: String,
            default: 'available',
            enum: ['available', 'erased']
        },
        body: {
            type: String,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
            required: true
        },
        qrcode: {
            type: String
        },
        image: {
            type: String
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
        
    }
);


module.exports = mongoose.model('Device', DeviceSchema);