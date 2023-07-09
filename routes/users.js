const express = require('express');
const router = express.Router();
const {ensureAuth} = require('../middleware/auth');
const User = require('../models/User');
const Device = require('../models/Device');
const Image = require('../models/Image');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

// Destination directory and desired size
const uploadDirectory = path.join(__dirname, '../public/uploads/users');
const targetSize = 520;


// middlewares of multer and sharp
const storage = multer.diskStorage({ //correct test
    destination: uploadDirectory,
    filename:  (req, file, cb) => {
        const fileName =  uuidv4() + path.extname(file.originalname);
        cb(null, fileName);
        req.body.image = fileName;
    }
});

const uploadImage = multer({ //correct test
    storage,
    fileFilter: function (req, file, cb){
        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);
        var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb("Error: File upload only supports the following filetypes - " + filetypes);
    },
    limits: {fileSize: 3000000}
}).single('image');









// @desc Show user
// @route GET /users
router.get(
    '/', 
    ensureAuth,
    async (req, res) => {
        try {
            
            //console.log(req.user.id);
            const user = await User.findById(req.user.id)
            .lean()
            .exec();

            const numberDevices  = await Device.countDocuments({user: req.user.id}).exec() | 0;



            res.render('users/profile',
                {
                    user,
                    numberDevices
                }
            );
        } catch (err) {
            console.log(err);
            res.render('error/500');
        }
    }
);


// @desc Show user
// @route GET /users/:id
router.get(
    '/:id', 
    ensureAuth,
    async (req, res) => {
        try {
            
            //console.log(req.user.id);
            const user = await User.findById(req.params.id)
            .lean()
            .exec();

            const numberDevices  = await Device.countDocuments({user: req.params.id}).exec() | 0;

            res.render('users/profile',
                {
                    user,
                    numberDevices
                }
            );
        } catch (err) {
            console.log(err);
            res.render('error/500');
        }
    }
);



// @desc Show edit page
// @route GET /users/edit/:id 
router.get(
    '/edit/:id', 
    ensureAuth,
    async (req, res) => {

        try {
            
            const user = await User.findById(req.params.id)
                .lean()
                .exec();
            
            if (!user) {
                return res.render('error/404');
            } else {
                res.render('users/edit', 
                    {
                        user,
                    }
                );
            }
        } catch (err) {
            console.log(err);
            return res.render('error/500');
        }

        
    }
);



// @desc Update user
// @route POST /users/:id 
router.post(
    '/:id', 
    ensureAuth,
    uploadImage,
    async (req, res) => {

        try {
            
            let user = await User.findById(req.params.id)
                .lean()
                .exec();
            if (!user) {

                return res.render('error/404');
            } else {
                if (req.file) {
                    // Original image path
                    const imagePath = path.join(uploadDirectory, req.body.image);
                    // Generate a unique filename for the resized image
                    const resizedFileName = `resized_${uuidv4()}.jpg`;
                    // Resized image path
                    const resizedImagePath = path.join(uploadDirectory, resizedFileName);
                    // Resize image to 300x300
                    await sharp(imagePath)
                        .resize(targetSize,targetSize)
                        .toFile(resizedImagePath); // Overwrites the original image with the new size
                    req.body.image = '/uploads/users/' + path.basename(resizedImagePath);

                } else {
                    req.body.image = user.image;
                }

                user = await User.findOneAndUpdate(
                    {
                        _id: req.params.id,
                    },
                    req.body,
                    {
                        new: true,
                        runValidators: true,
                    }
                );
                res.redirect('/allusers');
            }

        } catch (err) {
            console.log(err);
            return res.render('error/500');
        }
        
    }
);



// @desc Delete user
// @route DELETE /users/delete/:id
router.delete(
    '/delete/:id', 
    ensureAuth, 
    async (req, res) => {
        try {
            //await Device.deleteMany({ user: req.params.id });
            const devices = await Device.find({ user: req.params.id });
            for (const device of devices) {
                await Image.deleteMany({ device: device._id }).lean().exec();
            }
            await Device.deleteMany({ user: req.params.id });
            await User.findByIdAndRemove(req.params.id).lean().exec();
            //await Device.findByIdAndRemove(req.params.id).lean().exec();
            res.redirect('/allusers');
        } catch (err) {
            console.log(err);
            return res.render('error/500');
        }
    }
);



module.exports = router;
