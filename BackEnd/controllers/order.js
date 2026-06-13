const express = require('express');
const router = express.Router();
const Order = require('../model/order');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { isAuthenticated } = require('../middlewares/auth');
const Product = require('../model/product');
const { isSeller, isAdmin } = require('../middlewares/auth');
const Shop = require("../model/shop");
const Event = require("../model/event");

// Create a new order (Supports both standard Products and Events safely)
router.post(
  "/create-order",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { cart, shippingAddress, paymentInfo } = req.body;

      // Group cart items by shopId
      const shopItemsMap = new Map();

      for (const item of cart) {
        const itemId = item.product || item._id;

        // 1. Try finding it as a standard Product first
        let dbItem = await Product.findById(itemId);
        let itemType = "Product";

        // 2. 🛡️ Fallback: If not found, look for it in the Event collection
        if (!dbItem) {
          dbItem = await Event.findById(itemId);
          itemType = "Event";
        }

        // 3. If it doesn't exist in either collection, throw the error
        if (!dbItem) {
          return next(new ErrorHandler(`Item with ID ${itemId} not found in Products or Events`, 404));
        }

        // Handle structural consistency for shop references
        const shopId = dbItem.shop?._id ? dbItem.shop._id.toString() : dbItem.shopId?.toString();

        if (!shopId) {
          return next(new ErrorHandler("Could not resolve shop metadata for this item", 400));
        }

        if (!shopItemsMap.has(shopId)) {
          shopItemsMap.set(shopId, []);
        }

        // Push sanitized data into the shop bucket
        shopItemsMap.get(shopId).push({
          ...item,
          itemType, // Optional: helpful context for order history tracking
          price: item.discountPrice || item.price || dbItem.discountPrice || dbItem.originalPrice,
        });
      }

      const orders = [];

      // Create separate orders for each unique vendor/shop
      for (const [shopId, items] of shopItemsMap) {
        const shopTotalPrice = items.reduce((acc, item) => {
          return acc + Number(item.price) * Number(item.qty || item.quantity || 1);
        }, 0);

        const order = new Order({
          cart: items,
          shippingAddress,
          user: req.user,
          totalPrice: shopTotalPrice,
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
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

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

        // Prevent adding balance multiple times
        if (!order.balanceTransferred) {
          const shopId = order.cart?.[0]?.shopId;

          if (shopId) {
            const shop = await Shop.findById(shopId);

            if (shop) {
              const amountToAdd = Math.floor(Number(order.totalPrice) * 0.9);

              shop.availableBalance += amountToAdd;

              await shop.save({ validateBeforeSave: false });
            }
          }

          order.balanceTransferred = true;
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

// Accept refund request for seller
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found", 404));
      }

      const nextStatus = req.body.status || "Refund Success";
      const isRefundFlow = /refund/i.test(order.Status) || order.cart.some((item) => item?.isRefundRequested || item?.refundStatus);

      if (!isRefundFlow) {
        return next(new ErrorHandler("This order is not in refund flow", 400));
      }

      await Promise.all(
        order.cart.map(async (item) => {
          const productId = item.product || item._id;
          const quantity = Number(item.qty || item.quantity || 0);

          if (!productId || !quantity) return;

          const product = await Product.findById(productId);
          if (!product) return;

          product.stock += quantity;
          product.sold_out = Math.max(Number(product.sold_out || 0) - quantity, 0);
          await product.save({ validateBeforeSave: false });
        })
      );

      order.cart = order.cart.map((item) => ({
        ...item,
        refundStatus: nextStatus,
      }));

      order.Status = nextStatus;

      if (order.paymentInfo) {
        order.paymentInfo.status = "refunded";
      }
      if (order.balanceTransferred) {
        const shopId = order.cart?.[0]?.shopId;

        if (shopId) {
          const shop = await Shop.findById(shopId);

          if (shop) {
            const refundAmount = Math.floor(
              Number(order.totalPrice) * 0.9
            );

            shop.availableBalance = Math.max(
              0,
              shop.availableBalance - refundAmount
            );

            await shop.save({ validateBeforeSave: false });
          }
        }

        order.balanceTransferred = false;
      }
      await order.save({ validateBeforeSave: false });

      return res.status(200).json({
        success: true,
        order,
        message: "Refund request accepted successfully",
      });
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

// all orders -- admin
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find().sort({
        deliveredAt: -1, createdAt: -1
      });

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