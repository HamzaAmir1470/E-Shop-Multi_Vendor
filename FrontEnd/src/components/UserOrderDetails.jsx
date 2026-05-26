import React, { useEffect } from 'react'
import { BsFillBagFill } from "react-icons/bs";
import { FaTruck, FaPaypal, FaCreditCard } from "react-icons/fa";
import { MdMoneyOffCsred } from "react-icons/md";
import styles from "../../src/styles/styles.js";
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { backend_url } from '../server.js';
import axios from 'axios';
import { server } from '../server.js';
import { toast } from "react-toastify";
import { getAllOrdersUser } from '../redux/actions/order.js';
import { RxCross1 } from "react-icons/rx";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { HiOutlineReceiptRefund } from 'react-icons/hi';

const UserOrderDetails = () => {
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [rating, setRating] = React.useState(1);
  const [comment, setComment] = React.useState("");
  const { id } = useParams();

  useEffect(() => {
    dispatch(getAllOrdersUser(user._id));
  }, [dispatch, user?._id]);

  const data = orders?.find((item) => item._id === id);
  const checkoutGroupKey = data?.paymentInfo?.id || data?._id;
  const groupedOrders = orders?.filter((item) => (item?.paymentInfo?.id || item?._id) === checkoutGroupKey) || [];
  const groupedItems = groupedOrders.flatMap((order) =>
    (order.cart || []).map((item) => ({
      ...item,
      __orderId: order._id,
      __orderStatus: order.Status,
    }))
  );
  const isDeliveredOrder = groupedOrders.some((order) => order.Status === "Delivered");
  const groupedTotalPrice = groupedOrders[0]?.totalPrice ?? data?.totalPrice;

  const reviewHandler = async () => {
    await axios.put(`${server}/order/create-new-review`, {
      user,
      rating,
      comment,
      productId: selectedItem._id,
      orderId: selectedItem.__orderId || id
    }, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
        dispatch(getAllOrdersUser(user._id));
        setComment("");
        setRating(null);
        setOpen(false);
      })
      .catch((error) => {
        toast.error(error.response.data.message || "Failed to submit feedback.");
      }
      );
  }

  const hasReviewed = (item) => Boolean(item?.isReviewed);


  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-50';
      case 'Shipping': return 'text-blue-600 bg-blue-50';
      case 'Processing': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  const getPaymentMethodIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'paypal':
        return <FaPaypal className="text-blue-600 text-sm" />;
      case 'card':
      case 'credit card':
      case 'stripe':
        return <FaCreditCard className="text-purple-600 text-sm" />;
      case 'cod':
      case 'cash on delivery':
        return <MdMoneyOffCsred className="text-green-600 text-sm" />;
      default:
        return <FaCreditCard className="text-gray-600 text-sm" />;
    }
  }

  const getPaymentMethodName = (type) => {
    switch (type?.toLowerCase()) {
      case 'paypal':
        return 'PayPal';
      case 'card':
      case 'credit card':
      case 'stripe':
        return 'Credit / Debit Card';
      case 'cod':
      case 'cash on delivery':
        return 'Cash on Delivery';
      default:
        return type?.toUpperCase() || 'Card';
    }
  }

  const refundHandler = async () => {
    try {
      const refundOrderId = data?._id || id;
      console.log(refundOrderId)
      if (!refundOrderId) {
        toast.error("Unable to identify the order for refund.");
        return;
      }

      const response = await axios.put(
        `${server}/order/request-refund`,
        { orderId: refundOrderId, status: "Processing Refund" },
        { withCredentials: true }
      );

      toast.success(response?.data?.message || "Refund request submitted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to request refund.");
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg shadow-md">
              <BsFillBagFill size={20} color="white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Order Details
              </h1>
            </div>
          </div>
        </div>

        {/* Order Info - Simple Professional Style */}
        <div className="flex flex-wrap items-center gap-6 mb-6 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Order ID:</span>
            <span className="text-sm font-mono font-medium text-gray-800">#{data?._id?.slice(0, 8)}</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Placed on:</span>
            <span className="text-sm font-medium text-gray-800">{data?.createdAt?.split('T')[0]}</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(data?.Status)}`}>
              {data?.Status}
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
          <h3 className="text-base font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
            Order Items
          </h3>
          <div className="space-y-3">
            {groupedItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={`${backend_url}/${item.images[0]}`}
                  alt={item.name}
                  className='w-16 h-16 object-cover rounded-md'
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800 text-sm mb-1">
                    <Link to={`/product/${item._id}`} className="hover:text-pink-600 transition-colors duration-200">
                      {item.name}
                    </Link>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="text-pink-600 font-medium">US {item.discountPrice} $</span>
                    <span className="mx-2">×</span>
                    <span>{item.qty}</span>
                    <span className="mx-2">=</span>
                    <span className="font-semibold">US {(item.discountPrice * item.qty).toFixed(2)} $</span>
                  </div>
                </div>
                {
                  isDeliveredOrder && (
                    hasReviewed(item) ? (
                      <div className="px-4 py-2 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        Reviewed
                      </div>
                    ) : (
                      <div
                        className={`${styles.button} text-white`}
                        onClick={() => {
                          setSelectedItem(item);
                          setOpen(true);
                        }}
                      >
                        Feedback
                      </div>
                    )
                  )
                }
              </div>
            ))}

            {/* Feedback Modal */}
            {
              open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
                  <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-100">
                      <h2 className="text-xl font-semibold text-gray-800 font-['Poppins']">
                        Share Your Feedback
                      </h2>
                      <button
                        onClick={() => setOpen(false)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                      >
                        <RxCross1 size={20} className="text-gray-500 hover:text-gray-700" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Product Info */}
                      <Link to={`/product/${selectedItem?._id}`} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl mb-6">
                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl mb-6">
                          <img
                            src={`${backend_url}/${selectedItem?.images[0]}`}
                            alt={selectedItem?.name}
                            className="w-20 h-20 object-cover rounded-lg shadow-sm"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800 line-clamp-2">
                              {selectedItem?.name}
                            </h3>
                            <div className="mt-1">
                              <span className="text-lg font-semibold text-gray-900">
                                US$ {selectedItem?.discountPrice}
                              </span>
                              <span className="text-gray-500 ml-2">
                                × {selectedItem?.qty}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Rating Section */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <button
                              key={i}
                              onClick={() => setRating(i)}
                              className="transition-transform hover:scale-110 focus:outline-none"
                            >
                              {rating >= i ? (
                                <AiFillStar size={28} className="text-yellow-400" />
                              ) : (
                                <AiOutlineStar size={28} className="text-yellow-400" />
                              )}
                            </button>
                          ))}
                        </div>
                        {rating === 0 && (
                          <p className="text-xs text-red-500 mt-1">Please select a rating</p>
                        )}
                      </div>

                      {/* Comment Section */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Review
                          <span className="text-gray-400 text-xs font-normal ml-1">
                            (optional)
                          </span>
                        </label>
                        <textarea
                          rows="4"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Tell us about your experience with this product..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 resize-none placeholder:text-gray-400"
                        />
                        <div className="text-right mt-1">
                          <span className="text-xs text-gray-400">
                            {comment.length}/500 characters
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setOpen(false)}
                          className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={rating >= 1 ? reviewHandler : null}
                          className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${rating >= 1
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                          Submit Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

          </div>
          <div className="border-t border-gray-200 mt-3 pt-3 text-right">
            <div className="text-base">
              <span className="text-gray-600">Total Price: </span>
              <strong className="text-xl text-pink-600">US {groupedTotalPrice} $</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FaTruck className="text-pink-500 text-sm" />
              <h4 className='text-base font-semibold text-gray-800'>
                Shipping Address
              </h4>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>{data?.shippingAddress?.address1}, {data?.shippingAddress?.address2}</p>
              <p>{data?.shippingAddress?.city}, {data?.shippingAddress?.state}</p>
              <p>{data?.shippingAddress?.zipCode}, {data?.shippingAddress?.country}</p>
              <p className="pt-1">0{data?.user?.phoneNumber}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h4 className='text-base font-semibold text-gray-800'>
                Payment Information
              </h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Method:</span>
                <div className="flex items-center gap-2">
                  {getPaymentMethodIcon(data?.paymentInfo?.type)}
                  <span className="text-gray-800 font-medium">
                    {getPaymentMethodName(data?.paymentInfo?.type)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${data?.paymentInfo?.status === "succeeded"
                  ? "bg-green-100 text-green-700"
                  : data?.paymentInfo?.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                  }`}>
                  {data?.paymentInfo?.status === "succeeded"
                    ? "Paid ✓"
                    : data?.paymentInfo?.status === "pending"
                      ? "Pending"
                      : data?.paymentInfo?.status}
                </span>
              </div>
              {data?.paymentInfo?.paidAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Paid on:</span>
                  <span className="text-gray-800">
                    {new Date(data?.paymentInfo?.paidAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="text-gray-800 text-xs font-mono">
                  {data?.paymentInfo?.id?.slice(0, 12)}...
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email:</span>
                <span className="text-gray-800">{data?.user?.email}</span>
              </div>
            </div>
          </div>
        </div>
        <Link to="/">
          <div className={`${styles.button} text-white`}>
            Send Message!
          </div>
        </Link>
        {isDeliveredOrder && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h4 className='text-base font-semibold text-gray-800 mb-3'>
              Refund Action
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              This order has been delivered, so refund handling is available from here.
            </p>
            <button
              type="button"
              onClick={refundHandler}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <HiOutlineReceiptRefund size={18} />
              Refund Order
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserOrderDetails;