const express = require('express');
const router = express.Router();
const Order = require('../model/order');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { isAuthenticated } = require('../middlewares/auth');
const Product = require('../model/product');
const { isSeller } = require('../middlewares/auth');

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

// Get all orders of a user
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

// Get all orders of a shop
router.get(
  "/get-seller-all-orders/:shopId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({
        "cart.shopId": req.params.shopId,
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

// Update Order Status for seller
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return next(new ErrorHandler("Order not found", 404));
      }

      const nextStatus = req.body.status;

      if (nextStatus === "Transferred to delivery partner") {
        await Promise.all(
          order.cart.map(async (item) => {
            await updateOrder(item.product || item._id, item.qty || item.quantity || 0);
          })
        );
      }

      order.Status = nextStatus;
      order.status = nextStatus;

      if (nextStatus === "Delivered") {
        order.delieverAt = Date.now();
        order.deliveredAt = Date.now();
        if (order.paymentInfo) {
          order.paymentInfo.status = "succeeded";
        }
      }

      await order.save({ validateBeforeSave: false });
      return res.status(200).json({
        success: true,
        order,
      });

      async function updateOrder(productId, quantity) {
        if (!productId || !quantity) return;

        const product = await Product.findById(productId);
        if (!product) return;

        product.stock -= quantity;
        product.sold_out += quantity;
        await product.save({ validateBeforeSave: false });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;