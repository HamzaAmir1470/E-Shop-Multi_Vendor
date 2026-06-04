import React, { useEffect, useState } from "react";
import {
    AiFillHeart,
    AiFillStar,
    AiOutlineEye,
    AiOutlineHeart,
    AiOutlineShoppingCart,
    AiOutlineStar,
} from "react-icons/ai";
import { Link, useSearchParams } from "react-router-dom";
import styles from "../../../styles/styles";
import { useDispatch, useSelector } from "react-redux";
import ProductDetailsCard from "../ProductDetailsCard/ProductDetailsCard.jsx";
import { toast } from "react-toastify";
import { server } from "../../../server.js";
import { addToWishlist, removeFromWishlist } from "../../../redux/actions/wishlist.js";
import { addToCart } from "../../../redux/actions/cart.js";

const ProductCard = ({ data, isEvent }) => {
    const { wishlist } = useSelector((state) => state.wishlist);
    const { cart } = useSelector((state) => state.cart);
    const { seller } = useSelector((state) => state.seller);
    const [click, setClick] = useState(false);
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();

    if (!data) return null;
    useEffect(() => {
        if (wishlist && wishlist.find((i) => i._id === data._id)) {
            setClick(true);
        } else {
            setClick(false);
        }
    }, [wishlist, data._id]);

    const handleAddToCart = (e, id) => {
        e.stopPropagation();
        const isItemExist = cart?.find((item) => item._id === id);

        if (isItemExist) {
            toast.error("Item already in cart!");
            return;
        }

        // Check if stock is available
        if (data.stock < 1) {
            toast.error("Product out of stock!");
            return;
        }

        // Add to cart with quantity 1 by default
        const cartData = { ...data, qty: 1 };
        dispatch(addToCart(cartData));
        toast.success(`Added 1 item to cart!`);
    };

    const baseURL = server.replace('/api/v2', '');

    // Prefer live seller from Redux if it matches this product's shop id
    const shop = (seller && seller._id && seller._id === data?.shop?._id) ? seller : (data?.shop || {});

    // compute numeric rating from reviews or rating fields
    const ratingValue = (() => {
        if (data?.reviews && data.reviews.length > 0) {
            const sum = data.reviews.reduce((acc, r) => acc + (r.rating || r.ratings || 0), 0);
            return sum / data.reviews.length;
        }
        if (typeof data?.rating === 'number') return data.rating;
        if (typeof data?.ratings === 'number') return data.ratings;
        return 0;
    })();

    const addToWishlistHandler = (e, data) => {
        e.stopPropagation();
        setClick(true);
        dispatch(addToWishlist(data));
        toast.success("Item added to wishlist!");
    }

    const removeFromWishlistHandler = (e, data) => {
        e.stopPropagation();
        setClick(false);
        dispatch(removeFromWishlist(data));
        toast.success("Item removed from wishlist!");
    }

    const handleQuickView = (e) => {
        e.stopPropagation();
        setOpen(!open);
    }

    return (
        <div className="w-full h-[370px] bg-white rounded-lg shadow-sm p-3 relative cursor-pointer group">

            {/* Product Image */}
            <Link to={isEvent ? `/product/${data?._id}?isEvent=true` : `/product/${data._id}`} onClick={(e) => e.stopPropagation()}>
                {data?.images?.length > 0 && (
                    <img
                        src={`${baseURL}/${data.images[0]}`}
                        alt={data?.name || "Product image"}
                        className="w-full h-[170px] object-contain"
                    />
                )}
            </Link>

            {/* Shop Name */}
            <Link to={`/shop/preview/${shop?._id}`} onClick={(e) => e.stopPropagation()}>
                <h5 className={styles.shop_name}>
                    {shop?.name || "Unknown Shop"}
                </h5>
            </Link>

            {/* Product Name */}
            <Link to={isEvent ? `/product/${data?._id}?isEvent=true` : `/product/${data?._id}`} onClick={(e) => e.stopPropagation()}>
                <h4 className="pb-3 font-500">
                    {data?.name?.length > 40
                        ? data.name.slice(0, 40) + "..."
                        : data?.name || "Product"}
                </h4>
            </Link>

            {/* Dynamic Rating */}
            <Link to={isEvent ? `/product/${data?._id}?isEvent=true` : `/product/${data._id}`} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                    <div className="relative inline-block" aria-hidden>
                        <div className="flex text-gray-200">
                            {[...Array(5)].map((_, i) => (
                                <AiOutlineStar key={i} className="mr-1" color="#e5e7eb" size={18} />
                            ))}
                        </div>
                        <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${Math.max(0, Math.min(5, ratingValue)) / 5 * 100}%` }}>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <AiFillStar key={i} className="mr-1" color="#F6BA00" size={18} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <span className="text-sm text-gray-600">{ratingValue > 0 ? `${ratingValue.toFixed(1)} (${data.reviews?.length || 0})` : 'No rating'}</span>
                </div>
            </Link>

            {/* Price Section */}
            <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h5 className={styles.productDiscountPrice}>
                        ${data?.discountPrice || 0}
                    </h5>

                    {data?.originalPrice > data?.discountPrice && (
                        <h4 className={`${styles.price} line-through`}>
                            ${data?.originalPrice || 0}
                        </h4>
                    )}
                </div>

                <span className="font-400 text-17px text-[#68d284]">
                    {data?.sold_out || 0} sold
                </span>
            </div>

            {/* Side Icons - Improved visibility */}
            <div className="absolute right-2 top-2 flex flex-col gap-2">
                {click ? (
                    <div
                        className="w-[35px] h-[35px] rounded-full bg-white shadow-md flex items-center justify-center hover:bg-red-50 transition-colors"
                        onClick={(e) => removeFromWishlistHandler(e, data)}
                        title="Remove from wishlist"
                    >
                        <AiFillHeart
                            size={20}
                            color="#ef4444"
                            className="cursor-pointer"
                        />
                    </div>
                ) : (
                    <div
                        className="w-[35px] h-[35px] rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                        onClick={(e) => addToWishlistHandler(e, data)}
                        title="Add to wishlist"
                    >
                        <AiOutlineHeart
                            size={20}
                            color="#4b5563"
                            className="cursor-pointer"
                        />
                    </div>
                )}

                <div
                    className="w-[35px] h-[35px] rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                    onClick={handleQuickView}
                    title="Quick view"
                >
                    <AiOutlineEye
                        size={20}
                        color="#4b5563"
                        className="cursor-pointer"
                    />
                </div>

                <div
                    className={`w-[35px] h-[35px] rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors ${data?.stock < 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                    onClick={(e) => handleAddToCart(e, data._id)}
                    title={data?.stock < 1 ? "Out of stock" : "Add to cart"}
                >
                    <AiOutlineShoppingCart
                        size={20}
                        color={data?.stock < 1 ? "#9ca3af" : "#4b5563"}
                    />
                </div>
            </div>

            {open && <ProductDetailsCard setOpen={setOpen} data={data} />}
        </div >
    );
};

export default ProductCard;