import React, { useEffect } from 'react'
import { BsFillBagFill } from "react-icons/bs";
import { FaTruck } from "react-icons/fa";
import styles from "../../styles/styles.js";
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrdersShop } from '../../redux/actions/order.js';
import { backend_url } from '../../server.js';
import { toast } from "react-toastify";

const OrderDetails = () => {
    const { orders, isLoading } = useSelector((state) => state.order);
    const { seller } = useSelector((state) => state.seller);
    const dispatch = useDispatch();

    const [status, setStatus] = React.useState("");
    const { id } = useParams();

    useEffect(() => {
        dispatch(getAllOrdersShop(seller._id));
    }, [dispatch]);

    const data = orders?.find((item) => item._id === id);

    const orderUpdateHandler = (e) => {
        console.log("Order status updated to:", status);
        toast.success("Order status updated successfully!");
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'text-green-600 bg-green-50';
            case 'Shipping': return 'text-blue-600 bg-blue-50';
            case 'Processing': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    }

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
                    <Link to="/dashboard-orders">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-sm shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Orders
                        </div>
                    </Link>
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
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                        Order Items
                    </h3>
                    <div className="space-y-3">
                        {data && data.cart.map((item, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <img
                                    src={`${backend_url}/${item.images[0]}`}
                                    alt={item.name}
                                    className='w-16 h-16 object-cover rounded-md'
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-800 text-sm mb-1">
                                        {item.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <span className="text-pink-600 font-medium">US${item.discountPrice}</span>
                                        <span className="mx-2">×</span>
                                        <span>{item.qty}</span>
                                        <span className="mx-2">=</span>
                                        <span className="font-semibold">US${(item.discountPrice * item.qty).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-200 mt-3 pt-3 text-right">
                        <div className="text-base">
                            <span className="text-gray-600">Total Price: </span>
                            <strong className="text-xl text-pink-600">US$ {data?.totalPrice}</strong>
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
                                <span className="text-gray-600">Status:</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${data?.paymentInfo?.status === "succeeded"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}>
                                    {data?.paymentInfo?.status === "succeeded" ? "Paid" : "Pending"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Email:</span>
                                <span className="text-gray-800">{data?.user?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Status Update */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <h4 className='text-base font-semibold text-gray-800 mb-3'>
                        Order Status
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                        <div className="flex-1 w-full">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none bg-white'
                            >
                                {[
                                    "Pending",
                                    "Processing",
                                    "Transferred to delivery partner",
                                    "Shipping",
                                    "Received",
                                    "On the way",
                                    "Delivered",
                                ]
                                    .slice(
                                        [
                                            "Pending",
                                            "Processing",
                                            "Transferred to delivery partner",
                                            "Shipping",
                                            "Received",
                                            "On the way",
                                            "Delivered",
                                        ].indexOf(data?.Status)
                                    )
                                    .map((option, index) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <button
                            className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-sm shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={orderUpdateHandler}
                            disabled={!status}
                        >
                            Update Status
                        </button>
                    </div>

                    {/* Current Status Indicator */}
                    {data?.Status && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-600">Current:</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(data?.Status)}`}>
                                    {data?.Status}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default OrderDetails