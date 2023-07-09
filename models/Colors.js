const mongoose = require('mongoose');


const ColorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            uppercase: true,
            unique : true,
            dropDups : true,
            required: true
        },
        rgb:{
            type: String,
        },
       
    }
);



module.exports = mongoose.model('Color', ColorSchema);