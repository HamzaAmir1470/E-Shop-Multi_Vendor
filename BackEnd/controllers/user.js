const express = require('express');
const path = require('path');
const router = express.Router();
const User = require('../model/user');
const {upload} = require('../multer');
const ErrorHandler = require('../utils/ErrorHandler');

router.post("/create-user", upload.single('file'), async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const userEmail = await User.findOne({ email });

        if (userEmail) {
            return next(new ErrorHandler("User already exists", 400));
        }

        if (!req.file) {
            return next(new ErrorHandler("Please upload an avatar", 400));
        }

        const filename = req.file.filename;
        const fileUrl = filename; 
        const user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: filename,
                url: fileUrl,       
            },
        });
        console.log(user);

        res.status(201).json({
            success: true,
            user,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
module.exports = router;