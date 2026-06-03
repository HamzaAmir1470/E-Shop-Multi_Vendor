const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    cart: {
        type: Array,
        required: true,
    },
    shippingAddress: {
        type: Object,
        required: true,
    },
    user: {
        type: Object,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    Status: {
        type: String,
        default: 'Processing',
    },
    paymentInfo: {
        id: {
            type: String,
        },
        status: {
            type: String,
        },
        type: {
            type: String,
        },
    },
    balanceTransferred: {
        type: Boolean,
        default: false,
    },
    paidAt: {
        type: Date,
        default: Date.now(),
    },
    delieverAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
