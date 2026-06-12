const Conversation = require('../model/conversation');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const express = require('express');
const router = express.Router();
const { isSeller, isAuthenticated } = require('../middlewares/auth');
const User = require('../model/user');
const shop = require('../model/shop');

router.post(
    '/create-new-conversation',
    isAuthenticated,
    catchAsyncErrors(async (req, res, next) => {
        try {
            const { groupTitle, userId, sellerId } = req.body;

            const userExists = await User.findById(userId);
            const sellerExists = await shop.findById(sellerId);

            if (!userExists || !sellerExists) {
                return next(new ErrorHandler("Invalid user or seller ID", 404));
            }

            const isconversationExists = await Conversation.findOne({ groupTitle });

            if (isconversationExists) {
                return res.status(200).json({
                    success: true,
                    conversation: isconversationExists,
                });
            }

            const conversation = await Conversation.create({
                groupTitle,
                members: [userExists._id, sellerExists._id],
            });

            res.status(201).json({
                success: true,
                conversation,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    })
);

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

// get all conversations of user
router.get('/get-all-conversation-user/:userId', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
    try {
        const conversations = await Conversation.find({
            members: { $in: [req.params.userId] },
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