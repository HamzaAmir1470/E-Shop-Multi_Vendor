const express = require('express');
const path = require('path');
const router = express.Router();
const Shop = require('../model/shop');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendMail = require('../utils/sendMail');
const sendToken = require('../utils/jwtToken');
const { isAuthenticated, isSeller, isAdmin } = require('../middlewares/auth');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const upload = require('../multer');
const sendShopToken = require('../utils/sendShopToken');
const cloudinary = require('../config/cloudinary');

// create activation token
const createActivationToken = (seller) => {
    return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
        expiresIn: '15h',
    });
};

const createResetPasswordToken = () => {
    return crypto.randomBytes(20).toString("hex");
};

// --- CREATE SHOP REGISTRATION ---
router.post('/create-shop', upload.single('file'), async (req, res, next) => {
    try {
        const { name, email, password, phoneNumber, address, description, zipCode } = req.body;

        const sellerEmail = await Shop.findOne({ email });
        if (sellerEmail) {
            return next(new ErrorHandler("Shop already exists with this email", 400));
        }

        if (!req.file) {
            return next(new ErrorHandler("Please upload a shop avatar", 400));
        }

        // Convert memory buffer to Base64 URI string for Cloudinary
        const fileBase64 = req.file.buffer.toString('base64');
        const fileDataUrl = `data:${req.file.mimetype};base64,${fileBase64}`;

        const cloudinaryResponse = await cloudinary.uploader.upload(fileDataUrl, {
            folder: 'shops',
        });

        // Store flat fields to optimize JWT URL lengths
        const sellerData = {
            name,
            email,
            password,
            phoneNumber,
            address,
            description,
            zipCode,
            avatarId: cloudinaryResponse.public_id,
            avatarUrl: cloudinaryResponse.secure_url,
        };

        const activationToken = createActivationToken(sellerData);

        // Dev URI context string. Update this to your deployed domain for production releases
        const activationUrl = `https://sultanf.vercel.app/seller/activation/${activationToken}`;

        try {
            await sendMail({
                email: sellerData.email,
                subject: "Activate your shop account",
                message: `Hello ${sellerData.name},\n\nPlease click here to activate your shop: ${activationUrl}`,
            });

            res.status(201).json({
                success: true,
                alert: `Please check your email: ${sellerData.email} to activate your account!`,
            });

        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// --- ACTIVATE SHOP ACCOUNT ---
router.post(
    "/activation",
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
            zipCode,
            address,
            phoneNumber,
            description,
            avatarId,
            avatarUrl
        } = decoded;

        let seller = await Shop.findOne({ email });

        if (seller) {
            // ✅ Fixed helper function reference invocation to sendShopToken
            return sendShopToken(seller, 200, res);
        }

        // Map fields back into structural Object documents
        seller = await Shop.create({
            name,
            email,
            password,
            zipCode,
            address,
            phoneNumber,
            description,
            avatar: {
                public_id: avatarId,
                url: avatarUrl
            },
        });

        sendMail({
            email: seller.email,
            subject: "Shop Account Activated Successfully",
            message: `Hello ${seller.name},\n\nYour shop account has been activated successfully 🎉\n\nYou can now log in and start selling on our platform.\n\nRegards,\nTeam`,
        }).catch(err =>
            console.error("Activation email failed:", err.message)
        );

        sendShopToken(seller, 201, res);
    })
);

// --- LOGIN SHOP ---
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

// --- FORGOT PASSWORD ---
router.post("/forgot-password", catchAsyncErrors(async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(new ErrorHandler("Please provide your email address", 400));
        }

        const seller = await Shop.findOne({ email });

        if (!seller) {
            return next(new ErrorHandler("Seller not found", 404));
        }

        const resetToken = createResetPasswordToken();
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        seller.resetPasswordToken = hashedToken;
        seller.resetPasswordTime = Date.now() + 15 * 60 * 1000;

        await seller.save({ validateBeforeSave: false });

        const resetUrl = `https://sultanf.vercel.app/seller/reset-password/${resetToken}`;

        await sendMail({
            email: seller.email,
            subject: "Reset your shop password",
            message: `Hello ${seller.name},\n\nYou requested a password reset for your shop account. Please click the link below to set a new password:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
        });

        res.status(200).json({
            success: true,
            message: "Password reset link sent to your email address",
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

// --- RESET PASSWORD ---
router.put("/reset-password/:token", catchAsyncErrors(async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return next(new ErrorHandler("Please provide password and confirm password", 400));
        }

        if (password !== confirmPassword) {
            return next(new ErrorHandler("Passwords do not match", 400));
        }

        const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

        const seller = await Shop.findOne({
            resetPasswordToken,
            resetPasswordTime: { $gt: Date.now() },
        }).select("+password");

        if (!seller) {
            return next(new ErrorHandler("Password reset token is invalid or has expired", 400));
        }

        seller.password = password;
        seller.resetPasswordToken = undefined;
        seller.resetPasswordTime = undefined;

        await seller.save();

        sendShopToken(seller, 200, res);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

// --- GET SELLER PROFILE ---
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

// --- LOGOUT SHOP ---
router.get("/logout", isSeller, catchAsyncErrors(async (req, res, next) => {
    try {
        res.cookie("seller_token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: true,
            sameSite: "None",
        });
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

// --- GET PUBLIC SHOP INFO ---
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

// --- UPDATE SHOP AVATAR ---
router.put(
    "/update-shop-avatar",
    isSeller,
    upload.single("image"), // Keeps field mapping naming consistent
    catchAsyncErrors(async (req, res, next) => {
        try {
            const seller = await Shop.findById(req.seller._id);

            if (!seller) {
                return next(new ErrorHandler("Seller not found", 404));
            }

            if (!req.file) {
                return next(new ErrorHandler("Please upload an avatar image", 400));
            }

            // ✅ Cleaned up Cloudinary integrations (removes local file system path errors)
            if (seller.avatar && seller.avatar.public_id) {
                await cloudinary.uploader.destroy(seller.avatar.public_id);
            }

            const fileBase64 = req.file.buffer.toString('base64');
            const fileDataUrl = `data:${req.file.mimetype};base64,${fileBase64}`;

            const cloudinaryResponse = await cloudinary.uploader.upload(fileDataUrl, {
                folder: 'shops',
            });

            const shop = await Shop.findByIdAndUpdate(
                req.seller._id,
                {
                    avatar: {
                        public_id: cloudinaryResponse.public_id,
                        url: cloudinaryResponse.secure_url
                    }
                },
                { new: true }
            );

            res.status(200).json({
                success: true,
                seller: shop,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

// --- UPDATE SHOP INFORMATION ---
router.put(
    "/update-shop-info",
    isSeller,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const { name, description, address, phoneNumber, zipCode } = req.body;

            const shop = await Shop.findByIdAndUpdate(
                req.seller._id,
                { name, description, address, phoneNumber, zipCode },
                { new: true }
            );

            res.status(200).json({
                success: true,
                shop,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

// --- GET ALL SHOPS (ADMIN) ---
router.get(
    "/admin-all-sellers",
    isAuthenticated,
    isAdmin("admin"),
    catchAsyncErrors(async (req, res, next) => {
        try {
            const sellers = await Shop.find().sort({
                createdAt: -1
            });

            res.status(200).json({
                success: true,
                sellers,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

// --- DELETE SHOP (ADMIN) ---
router.delete(
    "/admin-delete-seller/:id",
    isAuthenticated,
    isAdmin("admin"),
    catchAsyncErrors(async (req, res, next) => {
        try {
            const shop = await Shop.findById(req.params.id);
            if (!shop) {
                return next(new ErrorHandler("Shop not found", 404));
            }

            // Delete image content from Cloudinary buckets if it exists
            if (shop.avatar && shop.avatar.public_id) {
                await cloudinary.uploader.destroy(shop.avatar.public_id);
            }

            await shop.deleteOne();
            res.status(200).json({
                success: true,
                message: "Shop deleted successfully!",
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

// --- UPDATE PAYMENT METHOD ---
router.put(
    "/update-payment-methods",
    isSeller,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const { withdrawMethod } = req.body;

            const shop = await Shop.findByIdAndUpdate(
                req.seller._id,
                { withdrawMethod },
                { new: true }
            );

            res.status(200).json({
                success: true,
                shop,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

// --- DELETE PAYMENT METHOD ---
router.delete(
    "/delete-withdraw-method",
    isSeller,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const shop = await Shop.findById(req.seller._id);
            if (!shop) {
                return next(new ErrorHandler("Shop not found", 404));
            }
            shop.withdrawMethod = null;
            await shop.save();
            res.status(200).json({
                success: true,
                shop,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

module.exports = router;