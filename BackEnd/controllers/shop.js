const express = require('express');
const path = require('path');
const router = express.Router();
const Shop = require('../model/shop');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');
const sendToken = require('../utils/jwtToken');
const { isAuthenticated, isSeller } = require('../middlewares/auth');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { upload } = require('../multer');
const sendShopToken = require('../utils/sendShopToken');


router.post('/create-shop', upload.single('file'), async (req, res, next) => {
    try {
        const { email } = req.body;
        const sellerEmail = await Shop.findOne({ email });
        if (sellerEmail) {
            if (req.file) {
                const filename = req.file.filename;
                const filePath = `uploads/${filename}`;

                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error("Error deleting file:", err);
                    }
                });
            }

            return next(new ErrorHandler("User already exists", 400));
        }


        if (!req.file) {
            return next(new ErrorHandler("Please upload an avatar", 400));
        }
        const filename = req.file.filename;
        const fileUrl = path.join(filename);

        const seller = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            avatar: fileUrl,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            description: req.body.description,
            zipCode: req.body.zipCode,
        };

        const activationToken = createActivationToken(seller);
        const activationUrl = `http://localhost:5173/seller/activation/${activationToken}`;
        try {
            await sendMail({
                email: seller.email,
                subject: "Activate your shop account",
                message: `Hello ${seller.name}, please click here to activate your shop: ${activationUrl}`,
            });

            res.status(201).json({
                success: true,
                alert: `Please check your email: ${seller.email} to activate your account!`,
            });

        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// create activation token
const createActivationToken = (seller) => {
    return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
        expiresIn: '15hrs',
    });
};

// activate shop account
router.post(
    "/shop/activation",
    catchAsyncErrors(async (req, res, next) => {
        const { activation_token } = req.body;

        if (!activation_token) {
            return next(new ErrorHandler("Activation token missing", 400));
        }

        let decoded;
        try {
            decoded = jwt.verify(
                activation_token,
                process.env.ACTIVATION_SECRET
            );
        } catch (err) {
            return next(new ErrorHandler("Invalid or expired token", 400));
        }

        const {
            name,
            email,
            password,
            avatar,
            zipCode,
            address,
            phoneNumber,
        } = decoded;

        let seller = await Shop.findOne({ email });

        if (seller) {
            return sendToken(seller, 200, res);
        }

        seller = await Shop.create({
            name,
            email,
            password,
            zipCode,
            address,
            phoneNumber,
            avatar,
        });

        sendMail({
            email: seller.email,
            subject: "Shop Account Activated Successfully",
            message: `Hello ${seller.name},

            Your shop account has been activated successfully 🎉

            You can now log in and start selling on our platform.
            If you did not perform this action, please contact support immediately.

            Regards,
            Team`,
        }).catch(err =>
            console.error("Activation email failed:", err.message)
        );

        sendShopToken(seller, 201, res);
    })
);

// Login Shop
router.post("/login-shop", catchAsyncErrors(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("Please provide email and password", 400));
        }
        const user = await Shop.findOne({ email }).select("+password");

        if (!user) {
            return next(new ErrorHandler("User not found, please sign up", 400));
        }
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return next(new ErrorHandler("Invalid email or password", 400));
        }
        sendShopToken(user, 201, res);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

// Load Shop User 
router.get("/getSeller", isSeller, catchAsyncErrors(async (req, res, next) => {
    try {
        const seller = await Shop.findById(req.seller._id);
        if (!seller) {
            return next(new ErrorHandler("Seller not found", 404));
        }
        res.status(200).json({
            success: true,
            seller,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

// Logout Shop User
router.get("/logout", isSeller, catchAsyncErrors(async (req, res, next) => {
    try {
        res.cookie("seller_token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        });
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

router.get("/get-shop-info/:id", catchAsyncErrors(async (req, res, next) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) {
            return next(new ErrorHandler("Shop not found", 404));
        }

        res.status(200).json({
            success: true,
            shop,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

module.exports = router;