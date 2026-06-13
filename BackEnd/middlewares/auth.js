const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const shop = require("../model/shop");

// Load User
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decoded);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
        return next(new ErrorHandler("User not found", 404));
    }
    next();
});

// Load Seller
exports.isSeller = catchAsyncErrors(async (req, res, next) => {
    const { seller_token } = req.cookies;
    if (!seller_token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
    req.seller = await shop.findById(decoded.id);
    if (!req.seller) {
        return next(new ErrorHandler("Seller not found", 404));
    }
    next();
});

exports.isAdmin = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler("You are not allowed to access this resource", 403));
        }
        next();
    };
};