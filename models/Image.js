const mongoose = require('mongoose');


const ImageSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            unique : true,
            required: true
        },
        device: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Device',
            index: true,
            required: true
        },
        body: {
            type: String,
           
        },
       
    }
);


module.exports = mongoose.model('Image', ImageSchema);