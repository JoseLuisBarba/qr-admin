const express = require('express');
const router = express.Router();
const {ensureAuth} = require('../middleware/auth');
const Device = require('../models/Device');
const User = require('../models/User');
const TypeDevice = require('../models/TypeDevice');
const Image = require('../models/Image');
const urlsystem = require('../models/urlsystem');
const Color = require('../models/Colors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');



// @desc Show add color
// @route GET /colors/add 
router.get(
    '/add', 
    ensureAuth,
    async (req, res) => {
        try {
            res.render('colors/add');
        } catch (err) {
            console.error(err);
            res.render('error/500');
        }
        
    }
);


// @desc Process add color
// @route POST /colors/add 
router.post(
    '/add', 
    ensureAuth,
    async (req, res) => {
        try {
            await Color.create(
                req.body
            );
            //console.log(req.body);
            res.redirect('/allcolors');
        } catch (err) {
            console.error(err);
            res.render('error/500');
        }
    }
);


// @desc Show edit color
// @route GET /colors/edit/:id
router.get(
    '/edit/:id', 
    ensureAuth,
    async (req, res) => {

        try {

            const color = await Color.findById(
                req.params.id
            )
            .lean()
            .exec();
    
            if (!color) {
                return res.render('error/404');
            } else {
                res.render('colors/edit', 
                    {
                        color,        
                    }
                );
            }
        } catch (err) {
            console.log(err);
            return res.render('error/500');
        }

        
    }
); 


// @desc Update color
// @route POST /colors/:id
router.post(
    '/:id', 
    ensureAuth,
    async (req, res) => {

        try {

            let myColor = await Color.findById(req.params.id)
                .lean()
                .exec();
            if (!myColor) {
                return res.render('error/404');
            } else {

                let color = await Color.findOneAndUpdate(
                    {
                        _id: myColor._id,
                    },
                    req.body,
                    {
                        new: true,
                        runValidators: true,
                    }
                );
                res.redirect('/allcolors');
            }

        } catch (err) {
            console.log(err);
            return res.render('error/500');
        }
        
    }
); 


// @desc Delete colors
// @route DELETE /colors/dalete/:id
router.delete(
    '/delete/:id', 
    ensureAuth, 
    async (req, res) => {
        try {

            await Color.findByIdAndRemove(req.params.id).lean().exec();
            //await User.findByIdAndRemove(req.params.id).lean().exec();
            //await Device.findByIdAndRemove(req.params.id).lean().exec();
            res.redirect('/allcolors');
        } catch (err) {
            console.log(err);
            return res.render('error/500');
        }
    }
);

module.exports = router;