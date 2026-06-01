const express = require('express');
const path = require('path');
const router = express.Router();
const User = require('../model/user');
const { upload } = require('../multer');
const ErrorHandler = require('../utils/ErrorHandler');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendMail = require('../utils/sendMail');
const sendToken = require('../utils/jwtToken');
const { isAuthenticated } = require('../middlewares/auth');

router.post("/create-user", upload.single('file'), async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const userEmail = await User.findOne({ email });

        if (userEmail) {
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
        const fileUrl = filename;
        const user = {
            name,
            email,
            password,
            avatar: {
                public_id: filename,
                url: fileUrl,
            },
        };
        const activationToken = createActivationToken(user);
        const activationUrl = `http://localhost:5173/activation/${activationToken}`;
        try {
            await sendMail({
                email: user.email,
                subject: "Activate your account",
                message: `Hello ${user.name}, please click here to activate: ${activationUrl}`,
            });

            res.status(201).json({
                success: true,
                alert: `Please check your email: ${user.email} to activate your account!`,
            });

        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// create activation token
const createActivationToken = (user) => {
    return jwt.sign(user, process.env.ACTIVATION_SECRET, {
        expiresIn: "60m",
    });
};

const createResetPasswordToken = () => {
    return crypto.randomBytes(20).toString("hex");
};

// activate user account
router.post("/activation", catchAsyncErrors(async (req, res, next) => {
    try {
        const { activation_token } = req.body;
        const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
        if (!newUser) {
            return next(new ErrorHandler("Invalid token", 400));
        }
        const { name, email, password, avatar } = newUser;

        let user = await User.findOne({ email });

        if (user) {
            return next(new ErrorHandler("User already exists", 400));
        }

        user = await User.create({
            name,
            email,
            password,
            avatar,
        });

        sendToken(user, 201, res);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

// Login User
router.post("/login-user", catchAsyncErrors(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler("Please provide email and password", 400));
        }
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return next(new ErrorHandler("User not found, please sign up", 400));
        }
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return next(new ErrorHandler("Invalid email or password", 400));
        }
        sendToken(user, 201, res);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

// Forgot password
router.post("/forgot-password", catchAsyncErrors(async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(new ErrorHandler("Please provide your email address", 400));
        }

        const user = await User.findOne({ email });

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        const resetToken = createResetPasswordToken();
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordTime = Date.now() + 15 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        await sendMail({
            email: user.email,
            subject: "Reset your password",
            message: `Hello ${user.name},\n\nYou requested a password reset. Please click the link below to set a new password:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
        });

        res.status(200).json({
            success: true,
            message: "Password reset link sent to your email address",
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

// Reset password
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

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordTime: { $gt: Date.now() },
        }).select("+password");

        if (!user) {
            return next(new ErrorHandler("Password reset token is invalid or has expired", 400));
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordTime = undefined;

        await user.save();

        sendToken(user, 200, res);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

// Load User 
router.get("/getuser", isAuthenticated, catchAsyncErrors(async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

// Logout User
router.get("/logout", isAuthenticated, catchAsyncErrors(async (req, res, next) => {
    try {
        res.cookie("token", null, {
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

// update user info
router.put(
    "/update-user-info",
    isAuthenticated,
    catchAsyncErrors(async (req, res, next) => {

        try {
            const { name, email, phoneNumber, password } = req.body;

            const user = await User.findById(req.user._id).select("+password");

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // If password provided, verify it
            if (password) {
                const isPasswordValid = await user.comparePassword(password);

                if (!isPasswordValid) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid password",
                    });
                }
            }

            // Update fields safely
            if (name) user.name = name;
            if (email) user.email = email;
            if (phoneNumber) user.phoneNumber = phoneNumber;

            await user.save();

            res.status(200).json({
                success: true,
                user,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }));

// update user avatar
router.put(
    "/update-avatar",
    isAuthenticated,
    upload.single("file"),
    catchAsyncErrors(async (req, res, next) => {
        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Please upload an avatar",
                });
            }
            const filename = req.file.filename;
            const fileUrl = filename;
            // Delete old avatar file
            if (user.avatar && user.avatar.public_id) {
                const oldFilePath = `uploads/${user.avatar.public_id}`;
                fs.unlink(oldFilePath, (err) => {
                    if (err) {
                        console.error("Error deleting old avatar:", err);
                    }
                });
            }
            user.avatar = {
                public_id: filename,
                url: fileUrl,
            };
            await user.save();
            res.status(200).json({
                success: true,
                user,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }));
    
// update user address
router.put(
    "/update-user-address",
    isAuthenticated,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const { country, state, city, address1, address2 } = req.body;
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
            const sameTypeAddress = user.addresses.find(
                (address) => address.addressType === req.body.addressType
            );
            if (sameTypeAddress) {
                return next((new ErrorHandler("Address with this type already exists", 400)));
            }

            const existAddress = user.addresses.find(address => address._id === req.body._id);
            if (existAddress) {
                Object.assign(existAddress, req.body);
            } else {
                // add the new address to the user's addresses array
                user.addresses.push(req.body);
            }

            await user.save();

            res.status(200).json({
                success: true,
                user,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }));

// delete user address
router.delete(
    "/delete-user-address/:id",
    isAuthenticated,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
            const addressId = req.params.id;
            const addressIndex = user.addresses.findIndex(address => address._id.toString() === addressId);
            if (addressIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: "Address not found",
                });
            }
            user.addresses.splice(addressIndex, 1);
            await user.save();
            res.status(200).json({
                success: true,
                message: "Address deleted successfully!",
                user,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }));

// Update Password
router.put(
    "/update-user-password",
    isAuthenticated,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const { oldPassword, newPassword } = req.body;

            // Validate input
            if (!oldPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide both old and new password",
                });
            }

            const user = await User.findById(req.user._id).select('+password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // Check if old password matches
            const isPasswordMatched = await user.comparePassword(oldPassword);

            if (!isPasswordMatched) {
                return res.status(400).json({
                    success: false,
                    message: "Old password is incorrect",
                });
            }

            // Set new password (the pre-save middleware will hash it)
            user.password = newPassword;
            await user.save();

            res.status(200).json({
                success: true,
                message: "Password updated successfully!",
            });

        } catch (error) {
            console.error("Password update error:", error);
            return next(new ErrorHandler(error.message, 500));
        }
    })
);
module.exports = router;