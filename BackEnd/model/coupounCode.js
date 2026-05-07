const mongoose = require("mongoose");

const coupounCodeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your coupon code name!"],
        unique: true,
    },
    value: {
        type: Number,
        required: true,
    },
    minAmount: {
        type: Number,
        required: true,
    },
    maxAmount: {
        type: Number,
        required: true,
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
    },
    selectedProducts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("CoupounCode", coupounCodeSchema);
