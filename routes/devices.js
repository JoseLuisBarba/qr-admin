const express = require('express');
const router = express.Router();
const {ensureAuth} = require('../middleware/auth');
const Device = require('../models/Device');
const User = require('../models/User');
const TypeDevice = require('../models/TypeDevice');
const Image = require('../models/Image');
const urlsystem = require('../models/urlsystem');
const Brand = require('../models/Brand');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');
const Colors = require('../models/Colors');

// Destination directory and desired size
const uploadDirectory = path.join(__dirname, '../public/uploads/devices');
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



// @desc Show add page
// @route GET /devices/add 
router.get(
    '/add', 
    ensureAuth,
    async (req, res) => {

        try {
            const typedevices = await TypeDevice.find()
                .sort()
                .lean()
                .exec();

            const colors = await Colors.find()
                .sort()
                .lean()
                .exec();
            const brands = await Brand.find()
                .sort()
                .lean()
                .exec();
            



            res.render('devices/add',
                {
                    typedevices,
                    colors,
                    brands,

                }
            );
        } catch (err) {
            console.error(err);
            res.render('error/500');
        }
        
    }
);


// @desc Show all devices
// @route GET /devices
router.get(
    '/', 
    ensureAuth,
    async (req, res) => {
        try {
            const devices = await Device.find({user: req.user.id})
                .populate('user')
                .sort({ createdAt: 'desc'})
                .lean()
                .exec();
            
            
            const user = await User.findById(req.user.id)
                .lean()
                .exec();
            

            res.render('devices/index',
                {
                    devices,
                    user,
                }
            );
        } catch (err) {
            console.log(err);
            res.render('error/500');
        }
    }
);



// @desc Show single device
// @route GET /devices/:id 
router.get(
    '/:id', 
    ensureAuth,
    async (req, res) => {
        try {
            let device = await Device.findById(req.params.id)
                .populate('user')    
                .lean()
                .exec();
            const images = await Image.find({device: device._id})
                .populate('device')
                .lean()
                .exec();

            console.log(images);

            if (!device){
                return res.render('error/404');
            }
            res.render('devices/show',
                {
                    device,
                    images,
                }
            );
        } catch (err) {
            console.log(err);
            res.render('error/404');
        }
    }
);


// @desc Process imageupload form
// @route GET /devices/image/upload/:id 
router.get(
    '/image/upload/:id', 
    ensureAuth,
    async (req, res) => {
        try {
            let device = await Device.findById(req.params.id)
                .populate('user')    
                .lean()
                .exec();

            if (!device){
                return res.render('error/404');
            }
            res.render('devices/image',
                {
                    device,
                }
            );
        } catch (err) {
            console.log(err);
            res.render('error/404');
        }
    }
);

// @desc Process qr show
// @route GET /devices/image/myqr/:id 
router.get(
    '/image/myqr/:id', 
    ensureAuth,
    async (req, res) => {
        try {
            let device = await Device.findById(req.params.id)
                .populate('user')    
                .lean()
                .exec();

            if (!device){
                return res.render('error/404');
            }
            res.render('devices/qr',
                {
                    device,
                }
            );
        } catch (err) {
            console.log(err);
            res.render('error/404');
        }
    }
);



// @desc Process imageupload form
// @route POST /devices/:id 
router.post(
    '/:id', 
    ensureAuth,
    uploadImage,
    async (req, res) => {
        try {
            
            let device = await Device.findById(req.params.id)
                .populate('user')    
                .lean()
                .exec();

            if (!device){
                console.log(device);
                return res.render('error/404');
            }


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


            await Image.create({
                image: path.basename(resizedImagePath),
                device: device._id,
                body: req.body.body
            });


            const images = await Image.find({device: device._id})
                .populate('device')
                .lean()
                .exec();
            
            res.render('devices/show',
                {
                    device,
                    images,
                }
            );
        } catch (err) {
            console.error(err);
            res.render('error/500');
        }
    }
);



// @desc Process add form
// @route POST /devices 
router.post(
    '/', 
    ensureAuth,
    uploadImage,
    async (req, res) => {
        try {
            
            
            const user = await User.findOne(
                {
                    collegeID: req.body.collegeID,
                }
            )
            .lean()
            .exec();
            //console.log(user);

            req.body.user = user._id;
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
            
            req.body.image = path.basename(resizedImagePath);

            await Device.create(
                {
                    user:  user._id,
                    image: req.body.image,
                    serie: req.body.serie,
                    date: req.body.date,
                    color: req.body.color,
                    type: req.body.type,
                    march: req.body.march,
                    model: req.body.model,
                    body: req.body.body
                }
            );
            //console.log(req.body);
            res.redirect('/dashboard');
        } catch (err) {
            console.error(err);
            res.render('error/500');
        }
    }
);

// @desc Show edit page
// @route GET /devices/edit/:id 
router.get(
    '/edit/:id', 
    ensureAuth,
    async (req, res) => {

        try {
            const device = await Device.findOne(
                {
                    _id: req.params.id,
                }
            )
            .lean()
            .exec();
            

            const typedevices = await TypeDevice.find()
                .sort()
                .lean()
                .exec();
            

            const colors = await Colors.find()
                .sort()
                .lean()
                .exec();
                
            const brands = await Brand.find()
                .sort()
                .lean()
                .exec();
    
            if (!device) {
                return res.render('error/404');
            } else {
                res.render('devices/edit', 
                    {
                        device,
                        typedevices,
                        colors,
                        brands,
                    }
                );
            }
        } catch (err) {
            console.log(err);
            return res.render('error/500');
        }

        
    }
); // correguir

// @desc Update device
// @route PUT /devices/:id
router.put(
    '/:id', 
    ensureAuth,
    async (req, res) => {

        try {
            let device = await Device.findById(req.params.id).lean().exec();
            if (!device) {
                return res.render('error/404');
            } else {
                device = await Device.findOneAndUpdate(
                    {
                        _id: req.params.id,
                    },
                    req.body,
                    {
                        new: true,
                        runValidators: true,
                    }
                );
                res.redirect('/dashboard');
            }

        } catch (err) {
            console.log(err);
            return res.render('error/500');
        }
        
    }
); // correguir


// @desc Delete device
// @route DELETE /devices//:id
router.delete(
    '/:id', 
    ensureAuth,
    async (req, res) => {
        try {
            await Device.findByIdAndRemove(req.params.id).lean().exec();
            res.redirect('/dashboard');
        } catch (err) {
            console.log(err);
            return res.render('error/500');
        }
    }
);



// @desc User devices
// @route GET /devices/user/:userId
router.get(
    '/user/:userId', 
    ensureAuth,
    async (req, res) => {
        try {
            
            const devices = await Device.find(
                {
                    user: req.params.userId,
                }
            )
                .populate('user')
                .lean()
                .exec();

            const user = await User.findById(req.params.userId)
                .lean()
                .exec();

            res.render('devices/index',
                {
                    devices,
                    user,
                }
            )

        } catch (err) {
            console.log(err);
            res.render('error/500');

        }
    }
);



// @desc Process qr show
// @route PUT /devices/image/myqr/successful/:id 
router.put(
    '/image/myqr/successful/:id', 
    ensureAuth,
    async (req, res) => {
        try {
            let device = await Device.findById(req.params.id).lean().exec();
            let urlbase =  await urlsystem.findOne({name: 'qrdevice'}).lean().exec(); 
            console.log(urlbase);
            if (!device) {
                return res.render('error/404');
            }

            if (device.user != req.user.id) {
                res.redirect('error/404');
            } else {
                // const urlDevice = '//localhost:3000/qrdata/'+ device._id;
                const urlDevice = urlbase.url +  device._id;
                
                // Generate the JWT token with a duration of 5 minutes
                const token = jwt.sign({ deviceId: device._id }, 'secret', { expiresIn: '5m' });
                // Add the token to the device URL
                const urlDeviceWithToken = `${urlDevice}?token=${token}`;

                const QR = await qrcode.toDataURL(urlDeviceWithToken);
                
                device = await Device.findOneAndUpdate(
                    {
                        _id: req.params.id,
                    },
                    {
                        qrcode: QR,
                    },
                    {
                        new: true,
                        runValidators: true,
                    }
                );
                res.render('devices/qrsuccessful');
            }

        } catch (err) {
            console.log(err);
            return res.render('error/500');
        }
    }
);

module.exports = router;