const express = require("express");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const CoupounCode = require("../model/coupounCode");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller } = require("../middlewares/auth");

const router = express.Router();

// Create coupon
router.post(
    "/create-coupon-code",
    isSeller,
    catchAsyncErrors(async (req, res, next) => {
        const { name, value, minAmount, maxAmount, selectedProducts } = req.body;

        if (!name || !value || !minAmount || !maxAmount)
            return next(new ErrorHandler("All fields are required!", 400));

        const exists = await CoupounCode.findOne({ name });
        if (exists) return next(new ErrorHandler("Coupon code already exists!", 400));

        const coupon = await CoupounCode.create({
            name,
            value,
            minAmount,
            maxAmount,
            selectedProducts,
            shop: req.seller._id, // must match schema
        });

        res.status(201).json({ success: true, coupon });
    })
);

// Get all coupons of a shop
router.get(
    "/get-coupon/:id",
    isSeller,
    catchAsyncErrors(async (req, res, next) => {
        const couponCodes = await CoupounCode.find({ shop: req.params.id });
        res.status(200).json({ success: true, couponCodes });
    })
);

router.get("/get-coupon-value/:name", catchAsyncErrors(async (req, res, next) => {
    const coupon = await CoupounCode.findOne({ name: req.params.name });

    if (!coupon) {
        return next(new ErrorHandler("Invalid coupon code!", 400));
    }

    res.status(200).json({
        success: true,
        couponCode: coupon,
    });
}));
// Delete coupon
router.delete(
    "/delete-coupon/:id",
    isSeller,
    catchAsyncErrors(async (req, res, next) => {
        const coupon = await CoupounCode.findByIdAndDelete(req.params.id);
        if (!coupon) return next(new ErrorHandler("Coupon does not exist!", 400));
        res.status(200).json({ success: true, message: "Coupon deleted successfully!" });
    })
);

module.exports = router;
