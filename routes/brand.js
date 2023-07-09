const express = require('express');
const router = express.Router();
const {ensureAuth} = require('../middleware/auth');
const TypeDevice = require('../models/TypeDevice');
const urlsystem = require('../models/urlsystem');
const Brand =  require('../models/Brand');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');





// ** holding pictures

// Destination directory and desired size
const uploadDirectory = path.join(__dirname, '../public/uploads/brands');
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


// @desc Show add brand
// @route GET /brands/add 
router.get(
    '/add', 
    ensureAuth,
    async (req, res) => {
        try {
            res.render('brands/add');
        } catch (err) {
            console.error(err);
            res.render('error/500');
        }
        
    }
);


// @desc Process add brand
// @route POST /brands/add 
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
    
            req.body.image = '/uploads/brands/' + path.basename(resizedImagePath);
            
            await Brand.create(
                req.body
            );
            res.redirect('/allbrands');
        } catch (err) {
            console.error(err);
            res.render('error/500');
        }
    }
);


// @desc Show edit brand
// @route GET /brands/edit/:id
router.get(
    '/edit/:id', 
    ensureAuth,
    async (req, res) => {

        try {

            const brand = await Brand.findById(
                req.params.id
            )
            .lean()
            .exec();
    
            if (!brand) {
                return res.render('error/404');
            } else {
                res.render('brands/edit', 
                    {
                        brand,        
                    }
                );
            }
        } catch (err) {
            console.log(err);
            return res.render('error/500');
        } 
    }
); 



// @desc Update brand
// @route POST /brands/:id
router.post(
    '/:id', 
    ensureAuth,
    uploadImage,
    async (req, res) => {

        try {

            

            let myBrand = await Brand.findById(req.params.id)
                .lean()
                .exec();



            if (!myBrand) {
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
                    req.body.image = '/uploads/brands/' + path.basename(resizedImagePath);

                } else {
                    req.body.image = myBrand.image;
                }



                await Brand.findOneAndUpdate(
                    {
                        _id: myBrand._id,
                    },
                    req.body,
                    {
                        new: true,
                        runValidators: true,
                    }
                );
                res.redirect('/allBrands');
            }

        } catch (err) {
            console.log(err);
            return res.render('error/500');
        }
        
    }
); 



// @desc Delete brand
// @route DELETE /brands/dalete/:id
router.delete(
    '/delete/:id', 
    ensureAuth, 
    async (req, res) => {
        try {

            await Brand.findByIdAndRemove(req.params.id)
                .lean()
                .exec();
            res.redirect('/allBrands');
        } catch (err) {
            console.log(err);
            return res.render('error/500');
        }
    }
);



module.exports = router;