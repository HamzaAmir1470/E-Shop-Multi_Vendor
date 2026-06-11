const express = require('express');
const router = express.Router();
const Withdraw = require('../model/withdraw');
const Shop = require('../model/shop');
const { isSeller, isAuthenticated, isAdmin } = require('../middlewares/auth')
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
                    seller: req.seller._id,
                    withdrawId: withdraw._id,
                    amount,
                    status: "Processing",
                    type: "withdrawal",
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

// Get all withdraw requests --admin
router.get('/get-all-withdraw-request', isAuthenticated, isAdmin("admin"), catchAsyncErrors(async (req, res) => {
    try {
        const withdraws = await Withdraw.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            withdraws
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));

// Update withdraw request status -- admin
router.put(
    "/update-withdraw-request/:id",
    isAuthenticated,
    isAdmin("admin"),
    catchAsyncErrors(async (req, res, next) => {
        try {
            const { sellerId } = req.body;

            // Update withdrawal request
            const withdraw = await Withdraw.findByIdAndUpdate(
                req.params.id,
                {
                    status: "succeed",
                    updatedAt: new Date(),
                },
                { new: true }
            );

            if (!withdraw) {
                return next(
                    new ErrorHandler("Withdraw request not found", 404)
                );
            }

            // Find seller
            const seller = await Shop.findById(sellerId);

            if (!seller) {
                return next(
                    new ErrorHandler("Seller not found", 404)
                );
            }

            // Update existing transaction status
            const transactionIndex = seller.transactions.findIndex(
                (transaction) =>
                    transaction.amount === withdraw.amount &&
                    transaction.status === "Processing"
            );

            if (transactionIndex !== -1) {
                seller.transactions[transactionIndex].status = "succeed";
                seller.transactions[transactionIndex].updatedAt = new Date();

                await seller.save();
            }

            // Send email
            try {
                await Sendmail({
                    email: seller.email,
                    subject: `Payment Confirmation - ${formatCurrency(
                        withdraw.amount
                    )}`,
                    message: `
                    Dear ${seller.name},

                    Your withdrawal request has been processed successfully.

                    Amount: ${formatCurrency(withdraw.amount)}
                    Status: ${withdraw.status}
                    Date: ${withdraw.updatedAt}

                    Thank you.
          `,
                });
            } catch (emailError) {
                console.error("Email Error:", emailError);
            }

            res.status(200).json({
                success: true,
                message: "Withdrawal request approved successfully",
                withdraw,
            });
        } catch (error) {
            console.error("Withdraw Update Error:", error);

            return next(
                new ErrorHandler(
                    error.message || "Internal Server Error",
                    500
                )
            );
        }
    })
);

module.exports = router;