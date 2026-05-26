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
  isSeller,
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

// review for a product
router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { user, rating, comment, productId, orderId } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return next(new ErrorHandler("Order not found", 404));
      }

      const alreadyReviewed = order.cart.some((item) => {
        const itemProductId = (item.product || item._id)?.toString();
        return itemProductId === productId?.toString() && item.isReviewed;
      });

      if (alreadyReviewed) {
        return next(new ErrorHandler("You have already reviewed this product for this order", 400));
      }

      const product = await Product.findById(productId);

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }
      const isReviewed = product.reviews.some(
        (rev) => rev.user?._id?.toString() === req.user._id.toString()
      );
      const review = {
        user,
        rating,
        comment,
        productId
      };
      if (isReviewed) {
        product.reviews.forEach((rev) => {
          if (rev.user._id === req.user._id) {
            rev.rating = rating;
            rev.comment = comment;
            rev.user = user;
          }
        });
      } else {
        product.reviews.push(review);
      }
      let avg = 0;
      product.reviews.forEach((rev) => {
        avg += rev.rating;
      });
      product.ratings = avg / product.reviews.length;

      await product.save({ validateBeforeSave: false });

      order.cart = order.cart.map((item) => {
        const itemProductId = (item.product || item._id)?.toString();

        if (itemProductId === productId?.toString()) {
          return {
            ...item,
            isReviewed: true,
          };
        }

        return item;
      });

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        message: "Reviewed Successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Refund request for a product
router.put(
  "/request-refund",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { orderId, status, productId } = req.body;
      const order = await Order.findById(orderId);
      if (!order) {
        return next(new ErrorHandler("Order not found", 404));
      }

      if (productId) {
        let matched = false;
        order.cart = order.cart.map((item) => {
          const itemProductId = (item.product || item._id)?.toString();
          if (itemProductId === productId?.toString()) {
            matched = true;
            return {
              ...item,
              isRefundRequested: true,
              refundStatus: status || "Refund Requested",
            };
          }
          return item;
        });

        if (!matched) {
          return next(new ErrorHandler("Product not found in this order", 404));
        }

        const allItemsRefundRequested = order.cart.every(
          (item) => item?.isRefundRequested || item?.refundStatus
        );

        if (allItemsRefundRequested) {
          order.Status = status || "Refund Requested";
          order.status = status || "Refund Requested";
        }
      } else {
        order.Status = status || "Refund Requested";
        order.status = status || "Refund Requested";
      }

      await order.save({ validateBeforeSave: false });
      return res.status(200).json({
        success: true,
        order,
        message: productId
          ? "Item refund request submitted successfully"
          : "Refund request updated successfully",
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;