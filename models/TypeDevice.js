const mongoose = require('mongoose');

const TypeDeviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            uppercase: true,
            unique : true,
            dropDups : true,
            required: true
            
        },
        image: {
            type: String,
            required: true,
        },
       
    }
);








module.exports = mongoose.model('TypeDevice', TypeDeviceSchema);