const express = require('express')
const router = express.Router()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")

router.post("/payment/process", catchAsyncErrors(async (req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "USD",
        metaData: {
            company: "Sultan's Shop"
        },
    });
    res.status(201).json({
        success: true,
        client_secret: myPayment.client_secret,
    })
}))

router.get("/stripeapikey", catchAsyncErrors(async (req, res, next) => {
    res.status(201).json({ stripeApikey: process.env.STRIPE_API_KEY });
}))

module.exports = router;