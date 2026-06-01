import React, { useEffect, useState, useRef } from "react";
import { RxCross1 } from "react-icons/rx";
import styles from "../../../styles/styles";
import {
    AiOutlineMessage,
    AiFillHeart,
    AiOutlineHeart,
    AiOutlineShoppingCart,
    AiFillStar,
    AiOutlineMinus,
    AiOutlinePlus,
    AiOutlineCheck,
    AiOutlineShareAlt,
} from "react-icons/ai";
import { BiStore, BiTrophy, BiShieldAlt, BiRefresh } from "react-icons/bi";
import { server } from "../../../server";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../redux/actions/cart";
import { addToWishlist, removeFromWishlist } from "../../../redux/actions/wishlist";

const ProductDetailsCard = ({
    setOpen,
    data,
    showShop = true,
    showMessageButton = true,
    showWishlist = true,
    showQuantity = true,
    showAddToCart = true,
    initialCount = 1,
    maxCountProp,
    onAddToCart: onAddToCartProp,
    onWishlistToggle: onWishlistToggleProp,
    onMessage: onMessageProp,
    linkableShop = true,
}) => {
    const { cart } = useSelector((state) => state.cart);
    const { wishlist } = useSelector((state) => state.wishlist);
    const { seller } = useSelector((state) => state.seller);
    const [count, setCount] = useState(initialCount);
    const dispatch = useDispatch();
    const [inWishlist, setInWishlist] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const modalRef = useRef(null);
    const rightPanelRef = useRef(null);

    useEffect(() => {
        if (wishlist && wishlist.find((i) => i._id === data._id)) {
            setInWishlist(true);
        } else {
            setInWishlist(false);
        }
    }, [wishlist, data._id]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const addToWishlistHandler = async (e, data) => {
        e.stopPropagation();
        if (typeof onWishlistToggleProp === 'function') {
            onWishlistToggleProp(true, data);
            setInWishlist(true);
            return;
        }
        setInWishlist(true);
        dispatch(addToWishlist(data));
        toast.success(' Added to wishlist!');
    }

    const removeFromWishlistHandler = async (e, data) => {
        e.stopPropagation();
        if (typeof onWishlistToggleProp === 'function') {
            onWishlistToggleProp(false, data);
            setInWishlist(false);
            return;
        }
        setInWishlist(false);
        dispatch(removeFromWishlist(data));
        toast.success('Removed from wishlist');
    }

    const maxCount = typeof maxCountProp === 'number' ? maxCountProp : (data?.stock ?? Infinity);
    const isOutOfStock = data?.stock === 0 || (data?.stock < count && count > 0);
    const isLowStock = data?.stock > 0 && data?.stock <= 5;

    const incrementCount = (e) => {
        e.stopPropagation();
        if (count < maxCount) {
            setCount(prev => prev + 1);
        } else {
            toast.warning(`Only ${maxCount} items available`);
        }
    };

    const decrementCount = (e) => {
        e.stopPropagation();
        setCount(prev => Math.max(1, prev - 1));
    };

    const handleMessageSubmit = (e) => {
        e.stopPropagation();
        if (typeof onMessageProp === 'function') return onMessageProp(data);
        toast.info('💬 Message feature coming soon!');
    };

    const handleAddToCart = async (e, id) => {
        e.stopPropagation();

        if (typeof onAddToCartProp === 'function') {
            onAddToCartProp(e, id, { ...data, qty: count });
            return;
        }

        const isItemExist = cart?.find((item) => item._id === id);
        if (isItemExist) {
            toast.error('Item already in cart!');
            return;
        }

        if (data.stock < count) {
            toast.error('Not enough stock available!');
            return;
        }

        setIsAddingToCart(true);

        setTimeout(() => {
            const cartData = { ...data, qty: count };
            dispatch(addToCart(cartData));
            toast.success(`✓ Added ${count} item(s) to cart!`);
            setIsAddingToCart(false);
        }, 300);
    };

    const handleShare = (e) => {
        e.stopPropagation();
        const shareData = {
            title: data.name,
            text: data.description,
            url: window.location.href,
        };

        if (navigator.share && window.innerWidth <= 768) {
            navigator.share(shareData).catch(() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    // Prefer live seller from Redux when available, otherwise use embedded shop snapshot
    const shop = (seller && seller._id && seller._id === data?.shop?._id) ? seller : (data?.shop || {});

    // Calculate seller rating dynamically using resolved `shop`
    const calculateSellerRating = () => {
        if (!shop) return 0;

        if (shop.ratings) return shop.ratings;

        if (shop.reviews && shop.reviews.length > 0) {
            const totalRating = shop.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
            return (totalRating / shop.reviews.length).toFixed(1);
        }

        if (shop.products && shop.products.length > 0) {
            let totalRating = 0;
            let reviewCount = 0;
            shop.products.forEach(product => {
                if (product.reviews && product.reviews.length > 0) {
                    product.reviews.forEach(review => {
                        totalRating += review.rating || 0;
                        reviewCount++;
                    });
                }
            });
            if (reviewCount > 0) return (totalRating / reviewCount).toFixed(1);
        }

        return 0;
    };

    const sellerRating = calculateSellerRating();
    const totalSellerRatings = shop?.reviews?.length || shop?.total_reviews || shop?.rating_count || 0;

    if (!data) return null;
    if (!data.images || !data.images[0]) data.images = [''];

    const baseURL = server?.replace('/api/v2', '') || 'http://localhost:8000';

    const avgRating = (() => {
        if (data?.reviews && data.reviews.length > 0) {
            const sum = data.reviews.reduce((a, r) => a + (r.rating || r.ratings || 0), 0);
            return sum / data.reviews.length;
        }
        if (typeof data?.rating === 'number') return data.rating;
        if (typeof data?.ratings === 'number') return data.ratings;
        return 0;
    })();

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4 animate-fadeIn"
            onClick={() => setOpen(false)}
        >
            <div
                ref={modalRef}
                className="w-full max-w-6xl h-[95vh] sm:h-[90vh] bg-white rounded-2xl shadow-2xl relative flex flex-col lg:flex-row overflow-hidden animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button - Fixed position for mobile */}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 w-8 h-8 sm:w-10 sm:h-10 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
                    aria-label="Close modal"
                >
                    <RxCross1 size={18} className="text-gray-700 sm:text-[20px]" />
                </button>

                {/* Left Section - Image Gallery */}
                <div className="w-full lg:w-1/2 bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4 lg:p-6 flex flex-col overflow-y-auto lg:overflow-y-auto max-h-[40vh] lg:max-h-none">
                    {/* Main Image */}
                    <div className="relative bg-white rounded-xl shadow-lg overflow-hidden group">
                        {!imageLoaded && (
                            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                                <div className="w-8 h-8 sm:w-12 sm:h-12 border-3 sm:border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                        )}
                        <img
                            src={`${baseURL}/${data.images[selectedImage]}`}
                            alt={data.name}
                            className={`w-full h-auto max-h-[35vh] sm:max-h-[40vh] object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setImageLoaded(true)}
                        />

                        {/* Stock Badge */}
                        {isOutOfStock && (
                            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-red-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                                Out of Stock
                            </div>
                        )}
                        {isLowStock && !isOutOfStock && (
                            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-orange-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                                Only {data.stock} left
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Gallery - Horizontal scroll for mobile */}
                    {data.images && data.images.length > 1 && (
                        <div className="mt-3 sm:mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {data.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage(idx);
                                        setImageLoaded(false);
                                    }}
                                    className={`relative shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImage === idx
                                            ? 'border-indigo-500 shadow-lg scale-95'
                                            : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    <img
                                        src={`${baseURL}/${img}`}
                                        alt={`${data.name} ${idx + 1}`}
                                        className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Shop Info & Actions - Improved mobile layout */}
                    {showShop && data.shop && (
                        <div className="mt-4 sm:mt-5 space-y-3">
                            <div className="flex items-center justify-between gap-2 p-2 sm:p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                    <img
                                        src={`${baseURL}/${shop?.avatar || shop?.shop_avatar?.[0] || ''}`}
                                        alt=""
                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-md"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        {linkableShop ? (
                                            <Link
                                                to={`/shop/preview/${shop?._id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="font-semibold text-gray-800 hover:text-indigo-600 transition-colors truncate block text-sm sm:text-base"
                                            >
                                                {shop?.name || 'Unknown Shop'}
                                            </Link>
                                        ) : (
                                            <h5 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                                                {data?.shop?.name || 'Unknown Shop'}
                                            </h5>
                                        )}
                                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <AiFillStar className="text-yellow-400" size={12} />
                                                <span className="ml-1 font-medium">{sellerRating}</span>
                                            </div>
                                            <span>•</span>
                                            <span>{totalSellerRatings || 0} ratings</span>
                                        </div>
                                    </div>
                                </div>

                                {showMessageButton && (
                                    <button
                                        onClick={handleMessageSubmit}
                                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg active:scale-95"
                                    >
                                        <AiOutlineMessage size={14} className="sm:text-[16px]" />
                                        <span className="hidden sm:inline">Message</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Section - Product Details with independent scroll */}
                <div
                    ref={rightPanelRef}
                    className="w-full lg:w-1/2 p-4 sm:p-5 lg:p-6 overflow-y-auto flex-1 lg:overflow-y-auto"
                    style={{ maxHeight: 'calc(95vh - 0px)' }}
                >
                    {/* Product Title */}
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 leading-tight mb-2 sm:mb-3">
                        {data.name}
                    </h1>

                    {/* Rating */}
                    <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <AiFillStar
                                    key={i}
                                    size={14}
                                    className={`sm:text-[16px] ${i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600">
                            {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'}
                            <span className="hidden sm:inline"> ({data.reviews?.length || 0} reviews)</span>
                        </span>
                    </div>

                    {/* Price - Improved mobile display */}
                    <div className="mb-3 sm:mb-4">
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-2xl sm:text-3xl font-bold text-indigo-600">
                                ${data.discountPrice || data.discount_price}
                            </span>
                            {(data.originalPrice || data.price) && (
                                <span className="text-base sm:text-lg text-gray-400 line-through">
                                    ${data.originalPrice || data.price}
                                </span>
                            )}
                            {data.discountPrice && data.originalPrice && (
                                <span className="text-xs sm:text-sm text-green-600 font-medium">
                                    Save ${((data.originalPrice - data.discountPrice).toFixed(2))}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4 sm:mb-5">
                        <h3 className="font-semibold text-gray-800 mb-1.5 text-sm sm:text-base">Description</h3>
                        <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
                            {data.description}
                        </p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="space-y-3 sm:space-y-4">
                        {showQuantity && !isOutOfStock && (
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-gray-700 font-medium text-sm sm:text-base">Quantity:</span>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button
                                        onClick={decrementCount}
                                        disabled={count <= 1}
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                    >
                                        <AiOutlineMinus size={14} className="sm:text-[16px]" />
                                    </button>
                                    <span className="w-12 sm:w-16 text-center font-medium text-gray-800 text-sm sm:text-base">
                                        {count}
                                    </span>
                                    <button
                                        onClick={incrementCount}
                                        disabled={count >= maxCount}
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                    >
                                        <AiOutlinePlus size={14} className="sm:text-[16px]" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons - Stack on mobile */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            {showAddToCart && (
                                <button
                                    onClick={(e) => handleAddToCart(e, data._id)}
                                    disabled={isOutOfStock || isAddingToCart}
                                    className={`w-full sm:flex-1 h-10 sm:h-12 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${isOutOfStock
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl active:scale-98'
                                        }`}
                                >
                                    {isAddingToCart ? (
                                        <>
                                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs sm:text-sm">Adding...</span>
                                        </>
                                    ) : (
                                        <>
                                            <AiOutlineShoppingCart size={16} className="sm:text-[20px]" />
                                            <span>Add to Cart</span>
                                        </>
                                    )}
                                </button>
                            )}

                            <div className="flex gap-2 sm:gap-3">
                                {showWishlist && (
                                    <button
                                        onClick={(e) => inWishlist ? removeFromWishlistHandler(e, data) : addToWishlistHandler(e, data)}
                                        className={`flex-1 sm:flex-none w-full sm:w-12 h-10 sm:h-12 rounded-xl border-2 transition-all duration-200 flex items-center justify-center active:scale-95 ${inWishlist
                                                ? 'border-red-200 bg-red-50 text-red-500'
                                                : 'border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-600 hover:text-red-500'
                                            }`}
                                    >
                                        {inWishlist ? <AiFillHeart size={18} className="sm:text-[22px]" /> : <AiOutlineHeart size={18} className="sm:text-[22px]" />}
                                    </button>
                                )}

                                <button
                                    onClick={handleShare}
                                    className="flex-1 sm:flex-none w-full sm:w-12 h-10 sm:h-12 rounded-xl border-2 border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-indigo-600 active:scale-95"
                                >
                                    <AiOutlineShareAlt size={16} className="sm:text-[20px]" />
                                </button>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 pt-2">
                            <span className="flex items-center gap-1">
                                <BiTrophy size={14} className="sm:text-[18px] text-yellow-500" />
                                <span>{data.sold_out || data.total_sell || 0} sold</span>
                            </span>
                            {data.sku && (
                                <span className="flex items-center gap-1">
                                    <BiShieldAlt size={14} className="sm:text-[18px] text-green-500" />
                                    <span className="hidden sm:inline">SKU: </span>
                                    <span>{data.sku}</span>
                                </span>
                            )}
                        </div>

                        {/* Delivery Info - Hidden on very small screens */}
                        <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-gray-200 space-y-1.5 sm:space-y-2">
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                                <BiShieldAlt size={14} className="sm:text-[18px] text-indigo-600 shrink-0" />
                                <span className="truncate">Secure payment & 100% buyer protection</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                                <BiRefresh size={14} className="sm:text-[18px] text-indigo-600 shrink-0" />
                                <span>Easy 30-day returns</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
                
                /* Custom scrollbar for better UX */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 4px;
                }
                
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 10px;
                }
                
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
                
                /* Horizontal scroll for thumbnails */
                .overflow-x-auto::-webkit-scrollbar {
                    height: 4px;
                }
                
                .overflow-x-auto::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                
                .overflow-x-auto::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 10px;
                }
                
                /* Active scale effect */
                .active\\:scale-98:active {
                    transform: scale(0.98);
                }
                
                /* Responsive adjustments */
                @media (max-width: 640px) {
                    .animate-slideUp {
                        animation: slideUp 0.25s ease-out;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProductDetailsCard;