import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import styles from '../../styles/styles';
import { AiOutlineShoppingCart, AiOutlineHeart, AiFillHeart, AiOutlineMessage } from "react-icons/ai"
import { backend_url } from '../../server.js';
import { getAllProductsShop } from '../../redux/actions/product.js';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../redux/actions/wishlist.js';
import { addToCart } from '../../redux/actions/cart.js';
import { toast } from 'react-toastify';

const ProductDetails = ({ data }) => {
    const { wishlist } = useSelector((state) => state.wishlist);
    const { products } = useSelector((state) => state.product);
    const { cart } = useSelector((state) => state.cart);
    const [count, setCount] = useState(1);
    const [click, setClick] = useState(false);
    const [select, setSelect] = useState(0);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (data?.shop?._id) {
            dispatch(getAllProductsShop(data.shop._id));
        }
    }, [dispatch, data?.shop?._id]);

    useEffect(() => {
        if (wishlist && wishlist.find((i) => i._id === data?._id)) {
            setClick(true);
        } else {
            setClick(false);
        }
    }, [wishlist, data?._id]);

    const handleAddToCart = (e, id) => {
        e?.stopPropagation();

        // Check if item already in cart
        const isItemExist = cart?.find((item) => item._id === id);
        if (isItemExist) {
            toast.error("Item already in cart!");
            return;
        }

        // Check if stock is available
        if (data.stock < count) {
            toast.error(`Only ${data.stock} items available!`);
            return;
        }

        // Add to cart
        const cartData = { ...data, qty: count };
        dispatch(addToCart(cartData));
        toast.success(`Added ${count} item(s) to cart!`);
    };

    const addToWishlistHandler = (e, data) => {
        e?.stopPropagation();
        setClick(true);
        dispatch(addToWishlist(data));
        toast.success("Item added to wishlist!");
    }

    const removeFromWishlistHandler = (e, data) => {
        e?.stopPropagation();
        setClick(false);
        dispatch(removeFromWishlist(data));
        toast.success("Item removed from wishlist!");
    }

    const toggleWishlistHandler = (e, data) => {
        e?.stopPropagation();

        if (click) {
            // Remove from wishlist
            setClick(false);
            dispatch(removeFromWishlist(data));
            toast.success("Item removed from wishlist!");
        } else {
            // Add to wishlist
            setClick(true);
            dispatch(addToWishlist(data));
            toast.success("Item added to wishlist!");
        }
    };

    const decrease = (e) => {
        e?.stopPropagation();
        setCount(prev => (prev > 1 ? prev - 1 : 1));
    };

    const increase = (e) => {
        e?.stopPropagation();
        setCount(prev => prev + 1);
    };

    const handleMessageSubmit = (e) => {
        e?.stopPropagation();
        navigate("/inbox?conversation-50?xsfdsfgdafjdkf");
    };

    if (!data) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500">Loading product details...</p>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {data && (
                <div className={`${styles.section} w-full py-8`}>

                    {/* Two column on large screens, stacked on mobile */}
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">

                        {/* LEFT: Images with Glass Effect */}
                        <div className="w-full lg:mt-0 sm:mt-15 flex flex-col items-center">
                            <div className="relative w-full max-w-[400px] group">
                                {/* Glass effect overlay */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>

                                {/* Main image with glass effect container */}
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                                    {/* Glass background effect */}
                                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

                                    {/* Animated gradient border */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-200/50 via-purple-200/50 to-pink-200/50 animate-pulse"></div>

                                    {/* Image container */}
                                    <div className="relative z-10 bg-white/30 backdrop-blur-md rounded-xl p-4 shadow-2xl">
                                        <img
                                            src={data.images?.[select] ? `${backend_url}${data.images[select]}` : `${backend_url}${data.images?.[0]}`}
                                            alt={data.name}
                                            className="w-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Decorative glass elements */}
                                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/30 rounded-full blur-3xl"></div>
                                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl"></div>
                                </div>
                            </div>

                            {/* Thumbnail images */}
                            {data.images && data.images.length > 0 && (
                                <div className="mt-6 grid grid-cols-4 sm:grid-cols-6 gap-3 pl-35">
                                    {data.images.map((img, i) => (
                                        <div
                                            key={i}
                                            className={`cursor-pointer p-1 rounded-lg border 
                                                transition-all duration-300 hover:scale-105
                                                ${select === i
                                                    ? "border-blue-500 bg-blue-50 shadow-lg"
                                                    : "border-gray-200 hover:border-blue-300 hover:shadow-md"}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelect(i);
                                            }}
                                        >
                                            <img
                                                src={`${backend_url}${img}`}
                                                className="h-20 w-20 object-cover rounded-md"
                                                alt={`${data.name} thumbnail ${i + 1}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Product Details */}
                        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16">

                            <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
                            <p className="text-2xl font-semibold text-blue-600">${data.originalPrice || "0"}</p>

                            <p className="text-gray-600 leading-relaxed text-justify">
                                {data.description || "No description available."}
                            </p>
                            <div className="flex p-3">
                                <h4 className="text-red-500 font-semibold">${data.discountPrice || "0"}</h4>
                            </div>

                            {/* Quantity Selector */}
                            <div className="flex items-center gap-4 mt-2">

                                {/* Decrease button — solid red */}
                                <button
                                    onClick={decrease}
                                    className="w-10 h-10 flex items-center justify-center 
                                    bg-red-500 text-white rounded-xl 
                                    hover:bg-red-600 transition-colors"
                                >
                                    −
                                </button>

                                <span className="text-lg font-semibold">{count}</span>

                                {/* Increase button — solid green */}
                                <button
                                    onClick={increase}
                                    className="w-10 h-10 flex items-center justify-center 
                                    bg-green-500 text-white rounded-xl
                                    hover:bg-green-600 transition-colors"
                                >
                                    +
                                </button>

                            </div>


                            {/* Buttons */}
                            <div className="flex flex-wrap gap-4 mt-3">

                                {/* Add to Cart — solid green */}
                                <button
                                    onClick={(e) => handleAddToCart(e, data._id)}
                                    className="flex items-center bg-green-500 text-white px-6 py-3 rounded-xl 
                                     shadow-md hover:bg-green-600 transition-colors"
                                >
                                    <AiOutlineShoppingCart className="mr-2 text-xl" />
                                    Add to Cart
                                </button>

                                {/* Wishlist — solid red if clicked, gray if not */}
                                <button
                                    onClick={(e) => toggleWishlistHandler(e, data)}
                                    className={`flex items-center px-6 py-3 rounded-xl shadow-sm transition-colors
                                       ${click
                                            ? "bg-red-500 text-white hover:bg-red-600"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                >
                                    {click ? (
                                        <AiFillHeart className="mr-2 text-white text-xl" />
                                    ) : (
                                        <AiOutlineHeart className="mr-2 text-gray-700 text-xl" />
                                    )}
                                    {click ? "Added to Wishlist" : "Add to Wishlist"}
                                </button>

                            </div>


                            {/* Extra Info */}
                            <div className="text-sm text-gray-500 mt-4">
                                <p><span className="font-medium">Category:</span> {data.category || 'General'}</p>
                                <p><span className="font-medium">Stock:</span> {data.stock > 0 ? `${data.stock} available` : 'Out of stock'}</p>
                            </div>

                            {/* Shop Info */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-gray-50 p-4 rounded-lg shadow-sm">

                                {/* Left: Shop Avatar + Info */}
                                <Link to={`/shop/preview/${data?.shop?._id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                                    <img
                                        src={data?.shop?.avatar ? `${backend_url}${data.shop.avatar}` : 'https://via.placeholder.com/56'}
                                        alt={data.shop?.name}
                                        className="w-14 h-14 rounded-full object-cover border border-gray-200"
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/56";
                                        }}
                                    />

                                    <div className="flex flex-col">
                                        <h3 className={`${styles.shop_name} text-lg font-semibold`}>
                                            {data.shop?.name}
                                        </h3>
                                        <span className="text-sm text-gray-600">
                                            (4/5) Ratings
                                        </span>
                                    </div>
                                </Link>

                                {/* Right: Send Message Button */}
                                <button
                                    onClick={handleMessageSubmit}
                                    className="flex items-center bg-purple-600 text-white px-5 py-2 rounded-lg 
                                     hover:bg-purple-700 transition-colors font-medium shadow"
                                >
                                    Send Message
                                    <AiOutlineMessage className="ml-2 text-lg" />
                                </button>

                            </div>


                        </div>

                    </div>

                    {/* Additional Info Tab */}
                    <ProductDetailsInfo data={data} products={products} />
                </div>
            )}
        </div>
    );
};

const ProductDetailsInfo = ({ data, products }) => {
    const [active, setActive] = useState(1);
    const [showFull, setShowFull] = useState(false);

    return (
        <div className="bg-[#f5f6fb] px-3 800px:px-10 py-2 rounded mx-15 mt-10">
            <div className="w-full flex justify-between border-b pt-10 pb-2">
                <div className="relative">
                    <h5
                        className={
                            "text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]"
                        }
                        onClick={(e) => {
                            e.stopPropagation();
                            setActive(1);
                        }}
                    >
                        Product Details
                    </h5>
                    {active === 1 ? (
                        <div className={`${styles.active_indicator}`} />
                    ) : null}
                </div>
                <div className="relative">
                    <h5
                        className={
                            "text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]"
                        }
                        onClick={(e) => {
                            e.stopPropagation();
                            setActive(2);
                        }}
                    >
                        Product Reviews
                    </h5>
                    {active === 2 ? (
                        <div className={`${styles.active_indicator}`} />
                    ) : null}
                </div>
                <div className="relative">
                    <h5
                        className={
                            "text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]"
                        }
                        onClick={(e) => {
                            e.stopPropagation();
                            setActive(3);
                        }}
                    >
                        Seller Information
                    </h5>
                    {active === 3 ? (
                        <div className={`${styles.active_indicator}`} />
                    ) : null}
                </div>
            </div>

            {active === 1 ? (
                <div className="py-2 pb-10">
                    <p
                        className={`
                        text-[18px] leading-8 whitespace-pre-line
                        overflow-hidden
                        ${showFull ? "line-clamp-none" : "line-clamp-3"}
                        transition-all duration-300
                    `}
                    >
                        {data.description || "No description available."}
                    </p>

                    {data.description && data.description.length > 200 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowFull(!showFull);
                            }}
                            className="mt-2 text-blue-600 font-medium hover:underline"
                        >
                            {showFull ? "Show less" : "Read more"}
                        </button>
                    )}
                </div>
            ) : null}

            {active === 2 ? (
                <div className='w-full justify-center min-h-[40vh] flex items-center'>
                    <p className="text-gray-500">No Reviews Yet!</p>
                </div>
            ) : null}

            {active === 3 && (
                <div className="w-full p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Section – Shop Info */}
                    <div className="space-y-4">
                        <Link to={`/shop/preview/${data?.shop?._id}`} onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                                <img
                                    src={data?.shop?.avatar ? `${backend_url}${data.shop.avatar}` : 'https://via.placeholder.com/56'}
                                    className="w-14 h-14 rounded-full object-cover"
                                    alt={data?.shop?.name}
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/56";
                                    }}
                                />

                                <div>
                                    <h3 className={`${styles.shop_name} text-xl font-semibold`}>
                                        {data?.shop?.name}
                                    </h3>
                                    <h5 className="text-sm text-gray-600">
                                        (4/5) Ratings
                                    </h5>
                                </div>
                            </div>
                        </Link>

                        <p className="text-gray-700 leading-relaxed">
                            {data?.shop?.description || "Discover the perfect blend of quality and style with our premium product. Carefully crafted to meet your everyday needs, it delivers exceptional performance while maintaining a sleek, modern design. Whether you're treating yourself or searching for the ideal gift, this product offers reliability, comfort, and lasting value. Experience the difference and elevate your lifestyle today."}
                        </p>
                    </div>

                    {/* Right Section – Stats */}
                    <div className="flex flex-col justify-start items-start lg:items-end space-y-4">
                        <div className="space-y-3 text-gray-800 w-full lg:w-auto">
                            <h5 className="font-bold">
                                Joined on:{" "}
                                <span className="font-medium text-gray-700">
                                    {data.shop?.createdAt ? data.shop.createdAt.slice(0, 10) : "N/A"}
                                </span>
                            </h5>

                            <h5 className="font-semibold">
                                Total Products:{" "}
                                <span className="font-medium">{products?.length || 0}</span>
                            </h5>

                            <h5 className="font-semibold">
                                Total Reviews:{" "}
                                <span className="font-medium">324</span>
                            </h5>
                        </div>
                        <div className='pr-10'>
                            <Link to={`/shop/preview/${data?.shop?._id}`} onClick={(e) => e.stopPropagation()}>
                                <button className={`${styles.button} rounded-lg h-[42px] px-5`}>
                                    <span className="text-white font-medium">Visit Shop</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;