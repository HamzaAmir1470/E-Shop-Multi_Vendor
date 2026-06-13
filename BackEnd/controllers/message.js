const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Messages = require('../model/messages');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
const cloudinary = require('../config/cloudinary');
const upload = require('../multer');

// Create new message (with image support)
router.post('/create-new-message', upload.single('images'), catchAsyncErrors(async (req, res, next) => {
    try {
        const { conversationId, sender, text } = req.body;

        // Validate required fields
        if (!conversationId || !sender) {
            return next(new ErrorHandler('Missing required fields', 400));
        }

        let imageData = null;

        // Handle file upload if an image is attached to the chat message
        if (req.file) {
            // Convert memory buffer to base64 string for Cloudinary
            const fileBase64 = req.file.buffer.toString('base64');
            const fileDataUrl = `data:${req.file.mimetype};base64,${fileBase64}`;

            const cloudinaryResponse = await cloudinary.uploader.upload(fileDataUrl, {
                folder: 'messages', // Saves chat media files inside a 'messages' folder
            });

            // Format object with Cloudinary metadata keys
            imageData = {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            };
        }

        const message = new Messages({
            conversationId: conversationId,
            text: text || '',
            sender: sender,
            images: imageData // Assigns null or the {public_id, url} object
        });

        await message.save();

        res.status(201).json({
            success: true,
            // Fixed the duplicate 'message' key bug here
            message: 'Message created successfully',
            messageData: message
        });
    } catch (error) {
        console.error('Error creating message:', error);
        return next(new ErrorHandler(error.message, 500));
    }
}));

// Get all messages for a conversation
router.get('/get-all-messages/:conversationId', catchAsyncErrors(async (req, res, next) => {
    try {
        const messages = await Messages.find({
            conversationId: req.params.conversationId
        }).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

// Delete message
router.delete('/delete-message/:messageId', catchAsyncErrors(async (req, res, next) => {
    try {
        const message = await Messages.findById(req.params.messageId);

        if (!message) {
            return next(new ErrorHandler('Message not found', 404));
        }

        // Delete image file if exists
        if (message.images) {
            const imagePath = path.join(__dirname, '../uploads', message.images);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await message.remove();

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

module.exports = router;