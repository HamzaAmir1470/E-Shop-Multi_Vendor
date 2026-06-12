// src/components/Events/EventCard.jsx
import React, { useState, useEffect } from "react";
import { backend_url } from "../../server.js";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/actions/cart.js";
import { toast } from "react-toastify";
import CountDown from "./CountDown.jsx";
import { FiHeart, FiShare2, FiEye } from "react-icons/fi";

const EventCard = ({ data, active = true }) => {
    const dispatch = useDispatch();
    const cart = useSelector((state) => state.cart);
    const [quantity, setQuantity] = useState(1);
    const [isHovered, setIsHovered] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        setQuantity(1);
        setCurrentImageIndex(0);
    }, [data?._id]);

    if (!data) return null;

    const isOutOfStock = data?.stock === 0;
    const maxQuantity = data?.stock || 10;
    const discountPercentage = data?.originalPrice && data?.discountPrice
        ? Math.round(((data.originalPrice - data.discountPrice) / data.originalPrice) * 100)
        : 0;

    const addtoCartHandler = async (e) => {
        e?.stopPropagation();

        if (isOutOfStock) {
            toast.error("Product is out of stock!");
            return;
        }

        const isItemExist = cart?.cart?.find((item) => item._id === data._id);
        if (isItemExist) {
            toast.error("Item already in cart!");
            return;
        }

        if (data.stock < quantity) {
            toast.error(`Only ${data.stock} items available!`);
            return;
        }

        setIsLoading(true);

        try {
            const cartData = { ...data, qty: quantity };
            dispatch(addToCart(cartData));
            toast.success(`Added ${quantity} item(s) to cart!`);
        } catch (error) {
            toast.error("Failed to add item to cart!");
        } finally {
            setIsLoading(false);
        }
    };

    const updateQuantity = (newQuantity) => {
        const validQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
        setQuantity(validQuantity);
    };

    const nextImage = () => {
        if (data?.images && data.images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % data.images.length);
        }
    };

    const prevImage = () => {
        if (data?.images && data.images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + data.images.length) % data.images.length);
        }
    };

    const handleWishlist = () => {
        setIsWishlisted(!isWishlisted);
        toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    return (
        <div
            className={`w-full mt-5z bg-white rounded-2xl transition-all duration-300 overflow-hidden flex flex-col lg:flex-row shadow-lg hover:shadow-2xl ${active ? "mb-0" : "mb-12"}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Section - Perfectly Sized */}
            <div className="w-full lg:w-2/5 relative group bg-gradient-to-br from-gray-50 to-white overflow-hidden rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none">
                {/* Image Container with Perfect Centering */}
                <div className="relative w-full h-full min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[450px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none">

                    {/* Navigation Arrows */}
                    {data?.images && data.images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg z-10 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                            >
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg z-10 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                            >
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}

                    {/* Image Dots */}
                    {data?.images && data.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2">
                            {data.images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`transition-all duration-200 rounded-full ${idx === currentImageIndex
                                            ? 'bg-gray-800 w-2 h-2 shadow-md'
                                            : 'bg-gray-400 w-1.5 h-1.5'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Image - Centered */}
                    <div className="w-full h-full flex items-center justify-center p-6 sm:p-8">
                        <img
                            src={`${backend_url}${data?.images?.[currentImageIndex] || data?.images?.[0]}`}
                            alt={data?.name}
                            className="max-w-full max-h-full w-90 h-90 object-contain transform group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400?text=No+Image';
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="w-full lg:w-1/2 p-6 sm:p-8 flex flex-col justify-center gap-4 bg-white">
                {/* Product Title */}
                <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {data?.name}
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {data?.description || "No description available"}
                </p>

                {/* Pricing */}
                <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                        ${data?.discountPrice?.toLocaleString() || "0"}
                    </span>
                    <span className="line-through text-lg text-gray-400">
                        ${data?.originalPrice?.toLocaleString() || "0"}
                    </span>
                    {discountPercentage > 0 && (
                        <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded">
                            Save {discountPercentage}%
                        </span>
                    )}
                </div>

                {/* Timer */}
                <div className="mt-2">
                    <CountDown data={data} />
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-green-600 text-sm font-semibold bg-green-50 px-3 py-1 rounded-full">
                        {data?.sold?.toLocaleString() || "0"} Sold
                    </span>
                    {data?.stock > 0 && data?.stock <= 10 && (
                        <span className="text-orange-600 text-sm font-semibold bg-orange-50 px-3 py-1 rounded-full animate-pulse">
                            3 Only {data.stock} left
                        </span>
                    )}
                </div>

                {/* Progress Bar */}
                {data?.stock !== undefined && data?.sold !== undefined && (
                    <div className="w-full">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Sold: {data.sold?.toLocaleString()}</span>
                            <span>Available: {data.stock?.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
                                style={{ width: `${(data.sold / (data.sold + data.stock)) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Quantity Selector */}
                {!isOutOfStock && (
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-sm font-medium text-gray-700">Quantity:</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => updateQuantity(quantity - 1)}
                                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center font-bold disabled:opacity-50"
                                disabled={quantity <= 1 || isLoading}
                            >
                                -
                            </button>
                            <span className="w-12 text-center font-semibold text-gray-800">{quantity}</span>
                            <button
                                onClick={() => updateQuantity(quantity + 1)}
                                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center font-bold disabled:opacity-50"
                                disabled={quantity >= maxQuantity || isLoading}
                            >
                                +
                            </button>
                        </div>
                        <span className="text-xs text-gray-500">Max: {maxQuantity}</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Link to={`/product/${data?._id}?isEvent=true`} className="flex-1">
                        <button className="w-full px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm rounded-lg hover:shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center gap-2">
                            <FiEye size={16} />
                            View Details
                        </button>
                    </Link>

                    <button
                        className={`flex-1 px-6 py-2.5 font-semibold text-sm rounded-lg transition-all duration-300 active:scale-95 ${isOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
                            }`}
                        onClick={addtoCartHandler}
                        disabled={isOutOfStock || isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Adding...
                            </div>
                        ) : isOutOfStock ? (
                            'Out of Stock'
                        ) : (
                            'Add to Cart'
                        )}
                    </button>
                </div>

                {/* Shop Info */}
                {data?.shop && (
                    <Link to={`/shop/${data.shop._id}`}>
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer">
                            <img
                                src={`${backend_url}${data.shop.avatar}`}
                                alt={data.shop.name}
                                className="w-8 h-8 rounded-full object-cover border-2 border-purple-600"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/32';
                                }}
                            />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{data.shop.name}</p>
                                <p className="text-xs text-green-600">✓ Verified Seller</p>
                            </div>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default EventCard;