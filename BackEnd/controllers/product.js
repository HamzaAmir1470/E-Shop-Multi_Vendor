const express = require('express')
const router = express.Router()
const Product = require('../model/product.js')
const { upload } = require("../multer.js")
const catchAsyncErrors = require("../middlewares/catchAsyncErrors.js");
const Shop = require('../model/shop.js')
const { isSeller } = require("../middlewares/auth.js");
const fs = require('fs');
const ErrorHandler = require("../utils/ErrorHandler.js");

// Create Product

router.post('/create-product', upload.array('images'), catchAsyncErrors(async (req, res, next) => {
    const shopId = req.body.shopId;
    const shop = await Shop.findById(shopId);

    if (!shop) {
        return next(new ErrorHandler("Shop ID not found", 404));
    } else {
        const files = req.files;
        const imageUrls = files.map((file) => `${file.filename}`);

        const productData = req.body;
        productData.images = imageUrls;
        productData.shop = shop;

        const product = await Product.create(productData);
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });
    }
}));

// Get All Products of a Shop

router.get("/get-all-products-shop/:id", catchAsyncErrors(async (req, res, next) => {
    try {
        const products = await Product.find({ shopId: req.params.id });
        res.status(201).json({
            success: true,
            products,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 400));
    }
}));

// GET ALL PRODUCTS (PUBLIC)
router.get("/get-all-products", async (req, res, next) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        next(error);
    }
});


// delete product of a shop
router.delete(
    "/delete-shop-product/:id",
    isSeller,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const productId = req.params.id;
            const productData = await Product.findById(productId);

            productData.images.forEach((imageUrl) => {
                const filename = imageUrl;
                const filePath = `uploads/${filename}`;
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error("Error deleting file:", err);
                    }
                });
            });

            console.log(productData.images)
            const product = await Product.findByIdAndDelete(productId);

            if (!product) {
                return next(new ErrorHandler("Product not found", 404));
            }
            res.status(200).json({
                success: true,
                message: "Product deleted successfully",
            });
        } catch (error) {
            return next(new ErrorHandler(error, 400));
        }
    })
);

// GET SINGLE PRODUCT
router.get(
    "/get-product/:id",
    catchAsyncErrors(async (req, res, next) => {
        try {
            const product = await Product.findById(req.params.id);

            if (!product) {
                return next(new ErrorHandler("Product not found", 404));
            }

            res.status(200).json({
                success: true,
                product,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 400));
        }
    })
);

module.exports = router;