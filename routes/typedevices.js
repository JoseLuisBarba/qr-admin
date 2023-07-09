const express = require('express');
const router = express.Router();
const {ensureAuth} = require('../middleware/auth');
const TypeDevice = require('../models/TypeDevice');
const urlsystem = require('../models/urlsystem');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');





// ** holding pictures

// Destination directory and desired size
const uploadDirectory = path.join(__dirname, '../public/uploads/typedevices');
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


// @desc Show add typedevice
// @route GET /typedevices/add 
router.get(
    '/add', 
    ensureAuth,
    async (req, res) => {
        try {
            res.render('typedevices/add');
        } catch (err) {
            console.error(err);
            res.render('error/500');
        }
        
    }
);


// @desc Process add typedevice
// @route POST /typedevices/add 
router.post(
    '/add', 
    ensureAuth,
    uploadImage,
    async (req, res) => {
        try {
            
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
    
            req.body.image = '/uploads/typedevices/' + path.basename(resizedImagePath);
            
            await TypeDevice.create(
                req.body
            );
            res.redirect('/alltypedevices');
        } catch (err) {
            console.error(err);
            res.render('error/500');
        }
    }
);


// @desc Show edit typedevices
// @route GET /typedevices/edit/:id
router.get(
    '/edit/:id', 
    ensureAuth,
    async (req, res) => {

        try {

            const typedevice = await TypeDevice.findById(
                req.params.id
            )
            .lean()
            .exec();
    
            if (!typedevice) {
                return res.render('error/404');
            } else {
                res.render('typedevices/edit', 
                    {
                        typedevice,        
                    }
                );
            }
        } catch (err) {
            console.log(err);
            return res.render('error/500');
        }

        
    }
); 



// @desc Update typedevices
// @route POST /typedevices/:id
router.post(
    '/:id', 
    ensureAuth,
    uploadImage,
    async (req, res) => {

        try {

            

            let myTypeDevice = await TypeDevice.findById(req.params.id)
                .lean()
                .exec();



            if (!myTypeDevice) {
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
                    req.body.image = '/uploads/typedevices/' + path.basename(resizedImagePath);

                } else {
                    req.body.image = myTypeDevice.image;
                }



                await TypeDevice.findOneAndUpdate(
                    {
                        _id: myTypeDevice._id,
                    },
                    req.body,
                    {
                        new: true,
                        runValidators: true,
                    }
                );
                res.redirect('/alltypedevices');
            }

        } catch (err) {
            console.log(err);
            return res.render('error/500');
        }
        
    }
); 



// @desc Delete typedevice
// @route DELETE /typedevices/dalete/:id
router.delete(
    '/delete/:id', 
    ensureAuth, 
    async (req, res) => {
        try {

            await TypeDevice.findByIdAndRemove(req.params.id)
                .lean()
                .exec();
            res.redirect('/alltypedevices');
        } catch (err) {
            console.log(err);
            return res.render('error/500');
        }
    }
);



module.exports = router;