import React, { useEffect } from "react";
import { RxCross1 } from "react-icons/rx";
import styles from "../../../styles/styles";
import {
    AiOutlineMessage,
    AiFillHeart,
    AiOutlineHeart,
    AiOutlineShoppingCart,
} from "react-icons/ai";
import { server } from "../../../server";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../redux/actions/cart";
import { addToWishlist, removeFromWishlist } from "../../../redux/actions/wishlist"; // Add these imports

const ProductDetailsCard = ({ setOpen, data }) => {
    const { cart } = useSelector((state) => state.cart);
    const { wishlist } = useSelector((state) => state.wishlist);
    const [count, setCount] = React.useState(1);
    const dispatch = useDispatch();
    const [click, setClick] = React.useState(false);

    useEffect(() => {
        if (wishlist && wishlist.find((i) => i._id === data._id)) {
            setClick(true);
        } else {
            setClick(false);
        }
    }, [wishlist, data._id]);

    const addToWishlistHandler = (e, data) => {
        e.stopPropagation(); // Add stopPropagation
        setClick(true);
        dispatch(addToWishlist(data));
        toast.success("Item added to wishlist!");
    }

    const removeFromWishlistHandler = (e, data) => {
        e.stopPropagation(); // Add stopPropagation
        setClick(false);
        dispatch(removeFromWishlist(data));
        toast.success("Item removed from wishlist!");
    }

    const incrementCount = (e) => {
        e.stopPropagation();
        setCount((prev) => prev + 1);
    };

    const decrementCount = (e) => {
        e.stopPropagation();
        setCount((prev) => (prev > 1 ? prev - 1 : prev));
    };

    const handleMessageSubmit = (e) => {
        e.stopPropagation();
        // Message action
        toast.info("Message feature coming soon!");
    };

    const handleAddToCart = (e, id) => {
        e.stopPropagation();
        const isItemExist = cart?.find((item) => item._id === id);
        if (isItemExist) {
            toast.error("Item already in cart!");
            return;
        } else {
            if (data.stock < count) {
                toast.error("Not enough stock available!");
            }
            else {
                const cartData = { ...data, qty: count };
                dispatch(addToCart(cartData));
                toast.success(`Added ${count} item(s) to cart!`);
            }
        }
    };

    // Safety check
    if (!data || !data.images || !data.images[0]) {
        return (
            <div className="fixed top-0 left-0 w-full h-screen bg-[#00000040] flex items-center justify-center z-[999]">
                <div className="w-[90%] lg:w-[65%] h-[90vh] bg-white rounded-xl shadow-lg relative flex items-center justify-center">
                    <p className="text-gray-500">Loading product details...</p>
                </div>
            </div>
        );
    }

    const baseURL = server?.replace('/api/v2', '') || 'http://localhost:8000';

    return (
        <div className="bg-white" onClick={() => setOpen(false)}>
            <div className="fixed top-0 left-0 w-full h-screen bg-[#00000040] flex items-center justify-center z-[9999]">
                {/* Modal container */}
                <div
                    className="w-[90%] lg:w-[65%] h-[90vh] bg-white rounded-xl shadow-lg relative flex overflow-y-auto lg:overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >

                    {/* CLOSE BUTTON */}
                    <RxCross1
                        size={28}
                        className="absolute top-3 right-3 cursor-pointer z-50 text-gray-700 hover:text-black bg-white rounded-full p-1 shadow-md"
                        onClick={() => setOpen(false)}
                    />

                    {/* MAIN CONTENT */}
                    <div className="w-full flex flex-col lg:flex-row">

                        {/* LEFT — IMAGE SIDE */}
                        <div className="w-full lg:w-[50%] p-5 lg:sticky lg:top-0 lg:h-full lg:self-start border-b lg:border-b-0 lg:border-r">
                            <img
                                src={`${baseURL}/${data.images[0]}`}
                                alt={data.name}
                                className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-md"
                            />

                            {/* SHOP INFO */}
                            <div className="flex items-center mt-6">
                                <img
                                    src={`${baseURL}/${data.shop?.avatar || data.shop?.shop_avatar?.[0] || ''}`}
                                    alt=""
                                    className="w-[55px] h-[55px] rounded-full mr-3 object-cover border border-gray-200"
                                    onError={(e) => {
                                        e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                                    }}
                                />
                                <div>
                                    <Link to={`/shop/preview/${data?.shop?._id}`} onClick={(e) => e.stopPropagation()}>
                                        <h5 className={styles.shop_name}>
                                            {data?.shop?.name || "Unknown Shop"}
                                        </h5>
                                    </Link>
                                    <h5 className="text-[15px] text-gray-600">
                                        ({data.shop?.ratings || 0}) Ratings
                                    </h5>
                                </div>
                            </div>

                            {/* MESSAGE BUTTON */}
                            <div
                                className={`${styles.button} bg-[#111] mt-5 rounded-md h-11 flex items-center justify-center cursor-pointer hover:bg-gray-900 transition-colors`}
                                onClick={handleMessageSubmit}
                            >
                                <span className="text-white flex items-center">
                                    Send Message <AiOutlineMessage className="ml-2" />
                                </span>
                            </div>

                            <h5 className="text-[16px] text-red-500 font-medium mt-4">
                                ({data.sold_out || data.total_sell || 0}) Sold
                            </h5>
                        </div>

                        {/* RIGHT — DETAILS SIDE */}
                        <div className="w-full lg:w-[50%] p-6 lg:overflow-y-auto lg:h-[90vh]">
                            <h1 className={`${styles.productTitle} text-[24px] leading-tight`}>
                                {data.name}
                            </h1>

                            <p className="mt-3 text-gray-700 leading-relaxed">
                                {data.description}
                            </p>

                            {/* PRICE SECTION */}
                            <div className="flex items-center pt-5">
                                <h4 className={`${styles.productDiscountPrice}`}>
                                    ${data.discountPrice || data.discount_price}
                                </h4>
                                {(data.originalPrice || data.price) && (
                                    <h3 className={`${styles.price} line-through ml-3 text-gray-500`}>
                                        ${data.originalPrice || data.price}
                                    </h3>
                                )}
                            </div>

                            {/* QUANTITY + WISHLIST */}
                            <div className="flex items-center mt-10 justify-between pr-3">
                                {/* QUANTITY */}
                                <div className="flex items-center">
                                    <button
                                        onClick={decrementCount}
                                        className="bg-[#0fb5ba] text-white font-bold px-4 py-[10px] rounded-l shadow-md hover:bg-[#0d9ea3] transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="bg-gray-200 text-gray-800 px-5 py-[11px] font-medium">
                                        {count}
                                    </span>
                                    <button
                                        onClick={incrementCount}
                                        className="bg-[#0fb5ba] text-white font-bold px-4 py-[10px] rounded-r shadow-md hover:bg-[#0d9ea3] transition-colors"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* WISHLIST */}
                                <div>
                                    {click ? (
                                        <AiFillHeart
                                            size={32}
                                            className="cursor-pointer transition-transform hover:scale-110"
                                            onClick={(e) => removeFromWishlistHandler(e, data)} // Fixed: remove when clicked
                                            color="red"
                                            title="Remove from wishlist"
                                        />
                                    ) : (
                                        <AiOutlineHeart
                                            size={32}
                                            className="cursor-pointer transition-transform hover:scale-110"
                                            onClick={(e) => addToWishlistHandler(e, data)} // Fixed: add when clicked
                                            color="#333"
                                            title="Add to wishlist"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* ADD TO CART BUTTON */}
                            <div
                                className={`${styles.button} bg-[#0fb5ba] mt-7 rounded-md h-12 flex items-center justify-center cursor-pointer hover:bg-[#0d9ea3] transition-colors`}
                                onClick={(e) => handleAddToCart(e, data._id)}
                            >
                                <span className="text-white flex items-center text-[17px] font-medium">
                                    Add to Cart <AiOutlineShoppingCart className="ml-2" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsCard;