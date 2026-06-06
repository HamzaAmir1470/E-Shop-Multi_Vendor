const express = require('express');
const router = express.Router();
const Messages = require('../model/messages');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const { upload } = require("../multer")

// Create a new message
router.post('/create-new-message', upload.array('image'), catchAsyncErrors(async (req, res, next) => {
    try {
        const messageData = req.body;

        if (req.files) {
            const files = req.files;
            const imageUrls = files.map(file => `${file.fileName}`);
            messageData.images = imageUrls;
        }
        messageData.conversationId = req.body.conversationId;
        messageData.sender = req.body.sender;
        messageData.text = req.body.text;

        const message = new Messages({
            conversationId: messageData.conversationId,
            text: messageData.text,
            sender: messageData.sender,
            images: messageData.images || []
        })

        await message.save();

        res.status(201).json({
            success: true,
            message: 'Message created successfully',
            message
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));


// Get all messages with conversationId
router.get('/get-all-messages/:conversationId', catchAsyncErrors(async (req, res, next) => {
    try {
        const conversationId = req.params.conversationId;

        const messages = await Messages.find({
            conversationId: conversationId
        });

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

module.exports = router;