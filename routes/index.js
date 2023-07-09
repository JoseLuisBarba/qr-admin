const express = require('express');
const router = express.Router();
const {ensureAuth, ensureGuest} = require('../middleware/auth');
const Device = require('../models/Device');
const User = require('../models/User');
const Image = require('../models/Image');
const Color = require('../models/Colors');
const Brand = require('../models/Brand');
const TypeDevice = require('../models/TypeDevice');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');



// @desc Login/Landing page
// @route GET / 
router.get(
    '/', 
    ensureGuest,
    (req, res) => {
        res.render('login',
            {
                layout: 'login',
            }
        );
    }
);

// @desc Dashboard
// @route GET /dashboard 
router.get(
    '/dashboard', 
    ensureAuth,
    async (req, res) => {

        try {
            const devices = await Device.aggregate([
                {
                  $lookup: {
                    from: 'users', 
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                  }
                },
                {
                  $unwind: '$userDetails'
                },
                {
                  $sort: {
                    'userDetails.displayName': 1
                  }
                }
              ])
                .exec();
            const user = await User.findById(req.user.id).lean().exec();

            //console.log(req.user.image);
            res.render('dashboard',{
                name: req.user.firstName,
                photo: req.user.image,
                user,
                devices
            });
        } catch (err) {
            console.error(err);
            res.render('error/500');
        }
    }
);




// @desc downloadexceldevices
// @route GET /downloadexceldevices
router.get(
    '/downloadexceldevices', 
    ensureAuth, 
    async (req, res) => {
        try {
        const devices = await Device.aggregate([
            {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails',
            },
            },
            {
            $unwind: '$userDetails',
            },
            {
            $sort: {
                'userDetails.displayName': 1,
            },
            },
        ]).exec();
    
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Devices');
    
        // estilos de encabezado
        const headerStyle = {
            font: { bold: true },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCCCC' } },
            alignment: { horizontal: 'center' },
        };
    
        // agregar encabezado al archivo Excel
        worksheet.columns = [
            { header: 'Device Serie', key: 'deviceSerie', width: 20, style: headerStyle },
            { header: 'User CollegeID', key: 'userCollegeID', width: 20, style: headerStyle },
            { header: 'User Display Name', key: 'userDisplayName', width: 20, style: headerStyle },
            { header: 'User Email', key: 'userEmail', width: 20, style: headerStyle },
            { header: 'User Phone', key: 'userPhone', width: 20, style: headerStyle },
            { header: 'Device Type', key: 'deviceType', width: 20, style: headerStyle },
            { header: 'Device March', key: 'deviceMarch', width: 20, style: headerStyle },
            { header: 'Device Model', key: 'deviceModel', width: 20, style: headerStyle },
            { header: 'Device createdAt', key: 'deviceCreatedAt', width: 20, style: headerStyle },
            { header: 'Device Color', key: 'deviceColor', width: 20, style: headerStyle },
        ];
    
        //agregar datos al archivo Excel
        devices.forEach((device) => {
            worksheet.addRow({
                deviceSerie: device.serie,
                userCollegeID: device.userDetails.collegeID,
                userDisplayName: device.userDetails.displayName,
                userEmail: device.userDetails.email,
                userPhone: device.userDetails.phone,
                deviceType: device.type,
                deviceMarch: device.march,
                deviceModel: device.model,
                deviceCreatedAt: device.createdAt,
                deviceColor: device.color,
            // Agrega más campos según los datos que desees incluir en el archivo Excel
            });
        });
    
        // ajustar el ancho de las columnas automáticamente
        worksheet.columns.forEach((column) => {
            column.width = Math.max(column.width, 25);
        });
    
        // configurar la respuesta HTTP para descargar el archivo Excel
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=devices.xlsx');
    
        // Enviar el archivo Excel al cliente
        await workbook.xlsx.write(res);
        
        console.log('Excel file sent successfully.');
        //res.redirect('/dashboard');
        } catch (err) {
        console.error(err);
        res.render('error/500');
        }
  });


















// @desc Allusers
// @route GET /allusers
router.get(
    '/allusers', 
    ensureAuth,
    async (req, res) => {

        try {

            const users = await User.find()
                .sort({ createdAt: 1})
                .lean()
                .exec();
            const user = await User.findById(req.user.id)
                .lean()
                .exec();

            //console.log(req.user.image);
            res.render('allusers',{
                //name: req.user.firstName,
                //photo: req.user.image,
                users,
                user,
                //devices
            });
        } catch (err) {
            console.error(err);
            res.render('error/500');
        }
    }
);




// @desc Allcolors
// @route GET /allcolors
router.get(
    '/allcolors', 
    ensureAuth,
    async (req, res) => {

        try {

    
            
            const colors = await Color.find()
                .sort({name: 1})
                .lean()
                .exec();


            const user = await User.findById(req.user.id)
                .lean()
                .exec();


            

            //console.log(req.user.image);
            res.render('allcolors',{
                //name: req.user.firstName,
                //photo: req.user.image,
                colors,
                user,
                //devices
            });
        } catch (err) {
            console.error(err);
            res.render('error/500');
        }
    }
);


// @desc Alltypedevices
// @route GET /alltypedevices
router.get(
    '/alltypedevices', 
    ensureAuth,
    async (req, res) => {

        try {
            
            const typedevices = await TypeDevice.find()
                .sort({name: 1})
                .lean()
                .exec();

            console.log(typedevices);
            
            const user = await User.findById(req.user.id)
                .lean()
                .exec();
            
            res.render('alltypedevices',{
                typedevices,
                user,
            });
        } catch (err) {
            console.error(err);
            res.render('error/500');
        }
    }
);


// @desc Allbrands
// @route GET /allbrands
router.get(
    '/allbrands', 
    ensureAuth,
    async (req, res) => {

        try {
            
            const brands = await Brand.find()
                .sort({name: 1})
                .lean()
                .exec();

            //console.log(typedevices);
            
            const user = await User.findById(req.user.id)
                .lean()
                .exec();
            
            res.render('allbrands',{
                brands,
                user,
            });
        } catch (err) {
            console.error(err);
            res.render('error/500');
        }
    }
);






// @desc Show qrdata
// @route GET /qrdata/:id
router.get(
    '/qrdata/:id', 
    async (req, res) => {
        
        try {

            const token = req.query.token;

            // Check if token exists
            if (!token) {
                return res.status(401).send('Token no proporcionado');
            }

            // Verify and decode the token
            const decoded = jwt.verify(token, 'secret');

            // Check if the token has expired
            if (Date.now() >= decoded.exp * 1000) {
                return res.status(401).send('Token expirado');
            }

            // Check if the device ID matches the token
            if (req.params.id !== decoded.deviceId) {
                return res.status(401).send('Token inválido');
            }

            // Get and render the page content

            let device = await Device.findById(req.params.id)
                .populate('user')    
                .lean()
                .exec();
            const images = await Image.find({device: device._id})
                .populate('device')
                .lean()
                .exec();

            if (!device){
                return res.render('error/404');
            }
            res.render('devices/qrdata',
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


// @desc Show dashboard page
// @route GET /mydashboard
router.get(
    '/mydashboard', 
    ensureAuth, 
    async (req, res) => {
        try {
            const devices = await Device.aggregate(
                [
                    {
                        $group: {
                            _id: { $month: '$createdAt' },
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $sort: { _id: 1 },
                    },
                ]
            );
            
            const users = await User.aggregate(
                [
                    {
                        $group:{
                            _id: {$month: '$createdAt'},
                            count: {$sum: 1},
                        }
                    },
                    {
                        $sort: { 
                            _id: 1,
                        }
                    }
                ]

            );


            const brandCounts = await Device.aggregate(
                [
                    {
                        $group: {
                            _id: "$march",
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { 
                            _id: 1,
                        }
                    }
                ]
            );
            

            const totalDispositivos = await Device.countDocuments();
            const totalUsers = await User.countDocuments();

            console.log(brandCounts);


            //console.log(devices);
            res.render('mydashboard', 
                { 
                    devices: JSON.stringify(devices),
                    users: JSON.stringify(users),
                    brandCounts: JSON.stringify(brandCounts),
                    totalDispositivos,
                    totalUsers,
                }
            );




        } catch (err) {
            console.error(err);
            res.render('error/500');
        }
  });








module.exports = router;