const express = require('express');
const router = express.Router();
const Order = require('../model/order');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { isAuthenticated } = require('../middlewares/auth');
const Product = require('../model/product');

// Create a new order
router.post('/create-order', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
    try {
        const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;

        // group cart items by shopid
        const shopItemsMap = new Map();
        for (const item of cart) {
            const productId = item.product || item._id;
            const product = await Product.findById(productId);
            if (!product) {
                return next(new ErrorHandler('Product not found', 404));
            }
            const shopId = product.shop._id;
            if (!shopItemsMap.has(shopId)) {
                shopItemsMap.set(shopId, []);
            }
            shopItemsMap.get(shopId).push(item);
        }

        // create separate order for each shop
        const orders = [];
        for (const [shopId, items] of shopItemsMap) {
            const order = new Order({
                cart: items,
                shippingAddress,
                user: req.user,
                totalPrice,
                paymentInfo,
            });
            await order.save();
            orders.push(order);
        }
        res.status(201).json({
            success: true,
            orders,
        });
    } catch (error) {
        next(new ErrorHandler(error.message, 500));
    }
}));

router.get(
  "/get-all-orders/:userId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {

      const orders = await Order.find({
        "user._id": req.user._id,
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        orders,
      });

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
module.exports = router;