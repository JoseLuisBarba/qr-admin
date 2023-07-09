const mongoose = require('mongoose');

const urlsystemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique : true,
        },
        
        url: {
            type: String,
            unique : true,
        },
       
    }
);



module.exports = mongoose.model('urlsystem', urlsystemSchema);