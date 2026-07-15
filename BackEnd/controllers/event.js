const express = require('express')
const router = express.Router()
const Product = require('../model/product.js')
const catchAsyncErrors = require("../middlewares/catchAsyncErrors.js");
const Shop = require('../model/shop.js')
const { isSeller, isAdmin, isAuthenticated } = require("../middlewares/auth.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const Event = require('../model/event.js')
const cloudinary = require('../config/cloudinary');
const upload = require("../multer.js")

// Create Event

router.post('/create-event', upload.array('images'), catchAsyncErrors(async (req, res, next) => {
    const shopId = req.body.shopId;
    const shop = await Shop.findById(shopId);

    if (!shop) {
        return next(new ErrorHandler("Shop ID not found", 404));
    }

    const files = req.files;

    // 1. Validate if at least one image was uploaded for the event
    if (!files || files.length === 0) {
        return next(new ErrorHandler("Please upload at least one event image", 400));
    }

    // 2. Map through files and prepare Cloudinary upload promises
    const imageUploadPromises = files.map(async (file) => {
        const fileBase64 = file.buffer.toString('base64');
        const fileDataUrl = `data:${file.mimetype};base64,${fileBase64}`;

        const cloudinaryResponse = await cloudinary.uploader.upload(fileDataUrl, {
            folder: 'events', // Saves all event-related images into an 'events' folder
        });

        // Return structured object matching your Cloudinary schema
        return {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        };
    });

    // 3. Resolve all uploads asynchronously in parallel
    const imageUrls = await Promise.all(imageUploadPromises);

    // 4. Structure data, clear out potential garbage frontend text data, and append shop info
    const eventData = { ...req.body };

    // CRITICAL FIX: Erase the malformed string sent by the frontend payload
    eventData.images = imageUrls;
    eventData.shop = shop;

    // 5. Create event document in MongoDB
    const event = await Event.create(eventData);

    res.status(201).json({
        success: true,
        message: "Event created successfully",
        event,
    });
}));


// Get All Events of a Shop
router.get("/get-all-events/:id", catchAsyncErrors(async (req, res, next) => {
    try {
        const events = await Event.find({ shopId: req.params.id });
        res.status(201).json({
            success: true,
            events,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 400));
    }
}));

// get all events for home page
router.get("/get-all-events", catchAsyncErrors(async (req, res, next) => {
    try {
        const events = await Event.find();
        res.status(201).json({
            success: true,
            events,
        });
    }
    catch (err) {
        return next(new ErrorHandler(err.message, 400));
    }
}));

// delete event of a shop
router.delete(
    "/delete-shop-event/:id",
    isSeller,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const eventId = req.params.id;
            const eventData = await Event.findById(eventId);

            if (eventData?.images?.length) {
                await Promise.all(
                    eventData.images.map((image) =>
                        image?.public_id ? cloudinary.uploader.destroy(image.public_id) : Promise.resolve()
                    )
                );
            }

            const event = await Event.findByIdAndDelete(eventId);
            if (!event) {
                return next(new ErrorHandler("Event not found", 404));
            }
            res.status(200).json({
                success: true,
                message: "Event deleted successfully",
            });
        } catch (error) {
            return next(new ErrorHandler(error, 400));
        }
    })
);

// admin all events
router.get("/admin-all-events", isAuthenticated, isAdmin("admin"), catchAsyncErrors(async (req, res, next) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.status(201).json({
            success: true,
            events,
        });
    }
    catch (err) {
        return next(new ErrorHandler(err.message, 400));
    }
}));

module.exports = router;