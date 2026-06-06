const Conversation = require('../model/Conversation');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const express = require('express');
const router = express.Router();
const { isSeller } = require('../middlewares/auth');
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

// get all conversations of seller
router.get('/get-all-conversation-seller/:sellerId', isSeller, catchAsyncErrors(async (req, res, next) => {
    try {
        const conversations = await Conversation.find({
            members: { $in: [req.params.sellerId] },
        }).sort({ updatedAt: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            conversations,
        });

    } catch (error) {
        return next(new ErrorHandler(error.response.message, 500));
    }
}));

// update last message
router.put('/update-last-message/:conversationId', catchAsyncErrors(async (req, res, next) => {
    try {

        const { lastMessage, lastMessageId } = req.body;

        const conversation = await Conversation.findByIdAndUpdate(req.params.conversationId, {
            lastMessage,
            lastMessageId,
        }, { new: true });

        res.status(200).json({
            success: true,
            conversation,
        });
    } catch (error) {
        return next(new ErrorHandler(error.response.message, 500));
    }
}));

module.exports = router;