const express = require('express');
const router = express.Router();
const Withdraw = require('../model/withdraw');
const Shop = require('../model/shop');
const { isSeller } = require('../middlewares/auth')
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const Sendmail = require('../utils/sendMail');

// Create a new withdraw request
router.post('/create-withdraw-request', isSeller, async (req, res, next) => {
    try {
        const { amount } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return next(new ErrorHandler('Invalid withdrawal amount', 400));
        }

        const withdrawData = {
            seller: req.seller,
            amount,
        };

        // Create withdrawal request in database
        const withdraw = await Withdraw.create(withdrawData);

        // Send professional email notification
        await sendWithdrawalConfirmationEmail(req.seller, amount);

        const shop = await Shop.findByIdAndUpdate(req.seller._id, {
            $push: {
                transactions: {
                    type: 'withdrawal',
                    seller: req.seller._id,
                    amount: amount,
                    date: new Date()
                }
            },
            $inc: {
                availableBalance: -amount
            }
        });


        res.status(201).json({
            success: true,
            withdraw,
            message: 'Withdrawal request created successfully'
        });

        await shop.save();


    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

const sendWithdrawalConfirmationEmail = async (seller, amount) => {
    const emailContent = `
        Dear ${seller.name},

        This email confirms that we have received your withdrawal request.

        Withdrawal Details:
        • Requested Amount: $${formatCurrency(amount)}
        • Request Date: ${new Date().toLocaleString()}
        • Status: Pending Processing

        What happens next?
        Our finance team will review and process your withdrawal request within 2-3 business days. 
        Once processed, the funds will be transferred to your registered payment method.

        Estimated Processing Time: 2-3 business days

        Need assistance?
        If you have any questions or need to modify your withdrawal request, please contact our support team at support@sultanshop.com within 24 hours.

        Thank you for being a valued seller on our platform.

        Best regards,
        Finance Team
        ${seller.name}
    `;

    await Sendmail({
        email: seller.email,
        subject: `Withdrawal Request Confirmation - $${formatCurrency(amount)}`,
        message: emailContent.trim()
    });
};

const formatCurrency = (amount) => {
    return parseFloat(amount).toFixed(2);
};

// Get all withdraw requests
router.get('/withdraws', async (req, res) => {
    try {
        const withdraws = await Withdraw.find().populate('seller');
        res.status(200).json(withdraws);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;