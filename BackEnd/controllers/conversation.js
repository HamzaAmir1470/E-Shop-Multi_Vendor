const Conversation = require('../model/Conversation');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const express = require('express');
const router = express.Router();

// Create a new conversation
router.post('/create-new-conversation', catchAsyncErrors(async (req, res, next) => {
    try {
        const { groupTitle, userId, sellerId } = req.body;

        const isconversationExists = await Conversation.findOne({
            groupTitle,
        });

        if (isconversationExists) {

            return res.status(201).json({
                success: true,
                conversation: isconversationExists
            });
        } else {
            
            const conversation = await Conversation.create({
                groupTitle: groupTitle,
                members: [userId, sellerId],
            });

            res.status(201).json({
                success: true,
                conversation
            });
        }
    } catch (error) {
        next(new ErrorHandler(error.response.message, 500));
    }
}));

module.exports = router;