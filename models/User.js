const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema(
    {
        googleId: {
            type: String,
            unique : true,
            required: true
        },
        collegeID:{
            type: String,
        }, 
        email:{
            type: String,
        }, 
        displayName: {
            type: String,
            uppercase: true,
            index: true,
            required: true
        },
        firstName: {
            type: String,
            uppercase: true,
            index: true,
            required: true
        },
        lastName: {
            type: String,
            uppercase: true,
            index: true,
            required: true
        },
        gender:{
            type: String,
        },
        filial:{
            type: String,
        },
        cademicProgram:{
            type: String,
        },
        birthdate:{
            type: String
        },
        
        phone: {
            type: String,
        },
        address: {
            type: String
        },
        image: {
            type: String
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
    }
);



module.exports = mongoose.model('User', UserSchema);