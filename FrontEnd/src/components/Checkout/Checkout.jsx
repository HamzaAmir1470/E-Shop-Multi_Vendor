import React, { useState, useEffect } from "react";
import styles from "../../styles/styles";
import { Country, City } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { backend_url, server } from "../../server";

const Checkout = () => {
    const { user } = useSelector((state) => state.user);
    const { cart } = useSelector((state) => state.cart);
    const navigate = useNavigate();

    // Form state
    const [shippingInfo, setShippingInfo] = useState({
        address1: "",
        address2: "",
        country: "",
        city: "",
        zipCode: "",
        fullName: "",
        email: "",
        phoneNumber: ""
    });

    const [userInfo, setUserInfo] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [couponCodeData, setCouponCodeData] = useState(null);
    const [discountPrice, setDiscountPrice] = useState(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        window.scrollTo(0, 0);
        // Pre-fill user data
        if (user) {
            setShippingInfo(prev => ({
                ...prev,
                fullName: user.name || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || ""
            }));
        }
    }, [user]);

    // Calculate prices
    const subTotalPrice = cart.reduce(
        (acc, item) => acc + item.qty * item.discountPrice,
        0
    );

    const shipping = subTotalPrice * 0.1;

    // Calculate discount properly - only from eligible products
    const calculateDiscount = () => {
        if (!couponCodeData) return 0;

        const { shopId, discountValue, selectedProducts, maxAmount } = couponCodeData;

        // Filter items that are eligible for discount
        const eligibleItems = cart.filter(item => {
            if (item.shopId !== shopId) return false;
            if (selectedProducts && selectedProducts.length > 0) {
                return selectedProducts.includes(item._id);
            }
            return true;
        });

        // Calculate subtotal only for eligible items
        const eligibleItemsTotal = eligibleItems.reduce(
            (acc, item) => acc + item.qty * item.discountPrice, 0
        );

        // Calculate discount
        let discount = (eligibleItemsTotal * discountValue) / 100;

        // Apply max discount cap if exists
        if (maxAmount && discount > maxAmount) {
            discount = maxAmount;
        }

        return discount;
    };

    const discountAmount = calculateDiscount();
    const totalPrice = (subTotalPrice + shipping - discountAmount).toFixed(2);

    // Validation function
    const validateShippingInfo = () => {
        const errors = {};

        if (!shippingInfo.address1?.trim()) {
            errors.address1 = "Address line 1 is required";
        }
        if (!shippingInfo.address2?.trim()) {
            errors.address2 = "Address line 2 is required";
        }
        if (!shippingInfo.zipCode) {
            errors.zipCode = "Zip code is required";
        } else if (!/^\d{4,5}$/.test(shippingInfo.zipCode)) {
            errors.zipCode = "Please enter a valid zip code";
        }
        if (!shippingInfo.country) {
            errors.country = "Please select a country";
        }
        if (!shippingInfo.city) {
            errors.city = "Please select a city";
        }
        const phone = String(shippingInfo.phoneNumber);
        if (!phone) {
            errors.phoneNumber = "Phone number is required";
        } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
            errors.phoneNumber = "Please enter a valid 10-digit phone number";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setShippingInfo(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error for this field
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const handleApplyCoupon = async (e) => {
        e.preventDefault();

        if (!couponCode.trim()) {
            toast.error("Please enter a coupon code");
            return;
        }

        setIsApplyingCoupon(true);
        const name = couponCode.trim().toUpperCase();

        try {
            const response = await axios.get(
                `${server}/coupoun/get-coupon-value/${name}`
            );

            if (response.data.couponCode) {
                const { shop, value, selectedProducts, minAmount, maxAmount } = response.data.couponCode;

                console.log("Coupon details:", { shop, value, selectedProducts, minAmount, maxAmount });

                // Check if coupon is applicable to any items in cart based on selectedProducts
                const eligibleItems = cart.filter(item => {
                    // First check if item belongs to the correct shop
                    if (item.shopId !== shop) return false;

                    // If selectedProducts exists and has items, check if this product is in the list
                    if (selectedProducts && selectedProducts.length > 0) {
                        // Check if this product's ID is in the selectedProducts array
                        return selectedProducts.includes(item._id);
                    }

                    // If no selectedProducts, then all items from the shop are eligible
                    return true;
                });

                console.log("Eligible items for coupon:", eligibleItems);

                if (eligibleItems.length === 0) {
                    toast.error("This coupon code is not valid for any items in your cart");
                    setCouponCode("");
                    return;
                }

                // Calculate eligible subtotal
                const eligiblePrice = eligibleItems.reduce(
                    (acc, item) => acc + item.qty * item.discountPrice,
                    0
                );

                // Check minimum amount requirement if specified
                if (minAmount && eligiblePrice < minAmount) {
                    toast.error(`Minimum purchase of $${minAmount} required for this coupon`);
                    setCouponCode("");
                    return;
                }

                // Calculate discount
                let calculatedDiscount = (eligiblePrice * value) / 100;

                // Apply maximum discount cap if specified
                if (maxAmount && calculatedDiscount > maxAmount) {
                    calculatedDiscount = maxAmount;
                }

                // Store complete coupon data with selected products
                setCouponCodeData({
                    ...response.data.couponCode,
                    code: response.data.couponCode.name,
                    shopId: shop,
                    discountValue: value,
                    selectedProducts: selectedProducts || [], // Store which products are eligible
                    minAmount,
                    maxAmount
                });

                // Store the discount amount
                setDiscountPrice(calculatedDiscount);

                // Clear the input field
                setCouponCode("");

                // Show which items the coupon applied to
                const productNames = eligibleItems.map(item => item.name).join(', ');
                toast.success(
                    `Coupon applied! You saved $${calculatedDiscount.toFixed(2)} on: ${productNames}`
                );
            } else {
                toast.error("Invalid coupon code");
                setCouponCode("");
            }
        } catch (error) {
            console.error("Coupon error:", error);
            toast.error(error.response?.data?.message || "Failed to apply coupon");
            setCouponCode("");
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handlePayment = () => {
        if (!validateShippingInfo()) {
            toast.error("Please fill in all required fields correctly");
            return;
        }

        const shippingAddress = {
            address1: shippingInfo.address1,
            address2: shippingInfo.address2,
            zipCode: shippingInfo.zipCode,
            country: shippingInfo.country,
            city: shippingInfo.city,
            fullName: shippingInfo.fullName,
            phoneNumber: shippingInfo?.phoneNumber
        };

        // Prepare items with their individual discount information
        const orderItems = cart.map(item => {
            const isEligibleForDiscount = couponCodeData &&
                item.shopId === couponCodeData.shopId &&
                (!couponCodeData.selectedProducts?.length ||
                    couponCodeData.selectedProducts.includes(item._id));

            const itemDiscount = isEligibleForDiscount
                ? (item.qty * item.discountPrice * couponCodeData.discountValue) / 100
                : 0;

            return {
                ...item,
                discountApplied: isEligibleForDiscount ? couponCodeData.code : null,
                itemDiscount: itemDiscount
            };
        });

        const orderData = {
            items: orderItems,
            totalPrice,
            subTotalPrice,
            shipping,
            discountAmount,
            shippingAddress,
            user,
            couponApplied: couponCodeData ? {
                code: couponCodeData.code,
                shopId: couponCodeData.shopId,
                discountValue: couponCodeData.discountValue,
                discountAmount: discountAmount,
                selectedProducts: couponCodeData.selectedProducts
            } : null
        };

        localStorage.setItem("latestOrder", JSON.stringify(orderData));
        navigate("/payment");
    };

    const selectSavedAddress = (address) => {

        const selectedCountry = Country.getAllCountries().find(
            country => country.name === address.country
        );

        const selectedCity = City.getCitiesOfCountry(selectedCountry?.isoCode || "").find(
            city => city.name === address.city
        );

        // Update all fields
        setShippingInfo(prev => ({
            ...prev,
            address1: address.address1 || "",
            address2: address.address2 || "",
            zipCode: address.zipCode?.toString() || "",
            country: selectedCountry?.isoCode || address.country || "",
            city: selectedCity?.name || address.city || "",
        }));

        setUserInfo(false);
        toast.success(`Address "${address.addressType}" selected`);
    };

    // Check if cart is empty
    if (cart.length === 0) {
        return (
            <div className="w-full flex flex-col items-center py-20">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Your cart is empty</h2>
                <button
                    onClick={() => navigate("/")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center py-8 bg-gray-50 min-h-screen">
            <div className="w-[90%] 1000px:w-[70%] block 800px:flex gap-6">
                {/* Shipping Information Section */}
                <div className="w-full 800px:w-[65%]">
                    <ShippingInfo
                        shippingInfo={shippingInfo}
                        handleInputChange={handleInputChange}
                        user={user}
                        userInfo={userInfo}
                        setUserInfo={setUserInfo}
                        selectSavedAddress={selectSavedAddress}
                        formErrors={formErrors}
                    />
                </div>

                {/* Cart Summary Section */}
                <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
                    <CartData
                        handleApplyCoupon={handleApplyCoupon}
                        totalPrice={totalPrice}
                        shipping={shipping}
                        subTotalPrice={subTotalPrice}
                        couponCode={couponCode}
                        setCouponCode={setCouponCode}
                        discountAmount={discountAmount}
                        isApplyingCoupon={isApplyingCoupon}
                        cart={cart}
                        couponCodeData={couponCodeData}
                    />
                </div>
            </div>

            {/* Payment Button */}
            <button
                className={`${styles.button} w-[150px] 800px:w-[280px] mt-10 hover:scale-105 transition-transform duration-200`}
                onClick={handlePayment}
                disabled={cart.length === 0}
            >
                <h5 className="text-white">Proceed to Payment</h5>
            </button>
        </div>
    );
};

const ShippingInfo = ({
    shippingInfo,
    handleInputChange,
    user,
    userInfo,
    setUserInfo,
    selectSavedAddress,
    formErrors
}) => {
    return (
        <div className="w-full 800px:w-[95%] bg-white rounded-lg shadow-sm p-6">
            <h5 className="text-xl font-semibold mb-6">Shipping Address</h5>

            <form className="space-y-4">
                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={shippingInfo.fullName}
                            onChange={(e) => handleInputChange("fullName", e.target.value)}
                            className={`${styles.input} w-full ${formErrors.fullName ? 'border-red-500' : ''}`}
                            placeholder="Enter your full name"
                            readOnly={!!user?.name}
                        />
                        {formErrors.fullName && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={shippingInfo.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className={`${styles.input} w-full ${formErrors.email ? 'border-red-500' : ''}`}
                            placeholder="Enter your email"
                            readOnly={!!user?.email}
                        />
                        {formErrors.email && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                        )}
                    </div>
                </div>

                {/* Phone and Zip Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={shippingInfo.phoneNumber}
                            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                            className={`${styles.input} w-full ${formErrors.phoneNumber ? 'border-red-500' : ''}`}
                            placeholder="Enter your phone number"
                        />
                        {formErrors.phoneNumber && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Zip Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={shippingInfo.zipCode}
                            onChange={(e) => handleInputChange("zipCode", e.target.value)}
                            className={`${styles.input} w-full ${formErrors.zipCode ? 'border-red-500' : ''}`}
                            placeholder="Enter zip code"
                        />
                        {formErrors.zipCode && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.zipCode}</p>
                        )}
                    </div>
                </div>

                {/* Country and City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country <span className="text-red-500">*</span>
                        </label>
                        <select
                            className={`w-full border rounded-lg h-[45px] px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.country ? 'border-red-500' : 'border-gray-300'
                                }`}
                            value={shippingInfo.country}
                            onChange={(e) => handleInputChange("country", e.target.value)}
                        >
                            <option value="">Select your country</option>
                            {Country.getAllCountries().map((item) => (
                                <option key={item.isoCode} value={item.isoCode}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        {formErrors.country && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.country}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            City <span className="text-red-500">*</span>
                        </label>
                        <select
                            className={`w-full border rounded-lg h-[45px] px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.city ? 'border-red-500' : 'border-gray-300'
                                }`}
                            value={shippingInfo.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            disabled={!shippingInfo.country}
                        >
                            <option value="">Select your city</option>
                            {shippingInfo.country &&
                                City.getCitiesOfCountry(shippingInfo.country).map((item) => (
                                    <option key={item.isoCode} value={item.isoCode}>
                                        {item.name}
                                    </option>
                                ))}
                        </select>
                        {formErrors.city && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>
                        )}
                    </div>
                </div>

                {/* Address Lines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 1 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={shippingInfo.address1}
                            onChange={(e) => handleInputChange("address1", e.target.value)}
                            className={`${styles.input} w-full ${formErrors.address1 ? 'border-red-500' : ''}`}
                            placeholder="Street address, P.O. box"
                        />
                        {formErrors.address1 && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.address1}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 2 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={shippingInfo.address2}
                            onChange={(e) => handleInputChange("address2", e.target.value)}
                            className={`${styles.input} w-full ${formErrors.address2 ? 'border-red-500' : ''}`}
                            placeholder="Apartment, suite, unit, building"
                        />
                        {formErrors.address2 && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.address2}</p>
                        )}
                    </div>
                </div>
            </form>

            {/* Saved Addresses */}
            {user?.addresses?.length > 0 && (
                <div className="mt-6">
                    <button
                        type="button"
                        onClick={() => setUserInfo(!userInfo)}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {userInfo ? 'Hide' : 'Show'} saved addresses
                    </button>

                    {userInfo && (
                        <div className="mt-4 space-y-3">
                            {user.addresses.map((address, index) => (
                                <div
                                    key={index}
                                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => selectSavedAddress(address)}
                                >
                                    <input
                                        type="radio"
                                        name="savedAddress"
                                        className="mr-3 text-blue-600 focus:ring-blue-500"
                                        checked={shippingInfo.address1 === address.address1}
                                        onChange={() => { }}
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{address.addressType}</p>
                                        <p className="text-sm text-gray-600">
                                            {address.address1}, {address.address2}, {address.city}, {address.country} - {address.zipCode}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const CartData = ({
    handleApplyCoupon,
    totalPrice,
    shipping,
    subTotalPrice,
    couponCode,
    setCouponCode,
    discountAmount,
    isApplyingCoupon,
    cart,
    couponCodeData
}) => {
    // Calculate discount breakdown by shop and products
    const getDiscountBreakdown = () => {
        if (!couponCodeData) return null;

        const eligibleItems = cart.filter(item => {
            if (item.shopId !== couponCodeData.shopId) return false;
            if (couponCodeData.selectedProducts && couponCodeData.selectedProducts.length > 0) {
                return couponCodeData.selectedProducts.includes(item._id);
            }
            return true;
        });

        if (eligibleItems.length === 0) return null;

        const eligibleSubtotal = eligibleItems.reduce(
            (acc, item) => acc + item.qty * item.discountPrice, 0
        );

        let discountAmount = (eligibleSubtotal * couponCodeData.discountValue) / 100;

        // Apply max discount cap
        if (couponCodeData.maxAmount && discountAmount > couponCodeData.maxAmount) {
            discountAmount = couponCodeData.maxAmount;
        }

        return {
            shopName: eligibleItems[0]?.shop?.name || 'Selected shop',
            eligibleItems: eligibleItems.map(item => item.name),
            eligibleSubtotal,
            discountAmount,
            discountPercentage: couponCodeData.discountValue,
            maxDiscount: couponCodeData.maxAmount
        };
    };

    const discountBreakdown = getDiscountBreakdown();

    return (
        <div className="w-full bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h5 className="text-xl font-semibold mb-6">Order Summary</h5>

            {/* Cart Items Preview */}
            <div className="max-h-60 overflow-y-auto mb-4 space-y-3">
                {cart.map((item, index) => {
                    const isEligibleForDiscount = couponCodeData &&
                        item.shopId === couponCodeData.shopId &&
                        (!couponCodeData.selectedProducts?.length ||
                            couponCodeData.selectedProducts.includes(item._id));

                    const isFromSameShop = couponCodeData && item.shopId === couponCodeData.shopId;
                    const isSelectedProduct = isFromSameShop &&
                        couponCodeData.selectedProducts?.length > 0 &&
                        !couponCodeData.selectedProducts.includes(item._id);

                    return (
                        <div key={index} className="flex items-center gap-3 text-sm">
                            <img
                                src={`${backend_url}/${item.images?.[0] || ''}`}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                                <p className="font-medium line-clamp-1">{item.name}</p>
                                <p className="text-gray-600">Qty: {item.qty}</p>
                                {isEligibleForDiscount && (
                                    <p className="text-xs text-green-600 font-medium">
                                        ✓ Coupon eligible - {couponCodeData.discountValue}% off
                                    </p>
                                )}
                                {isSelectedProduct && (
                                    <p className="text-xs text-gray-500">
                                        Not eligible for this coupon
                                    </p>
                                )}
                            </div>
                            <p className="font-medium pr-10">${(item.qty * item.discountPrice).toFixed(2)}</p>
                        </div>
                    );
                })}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.length} items)</span>
                    <span className="font-medium">${subTotalPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                    <span>Shipping Estimate</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && discountBreakdown && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-green-600">
                            <span>Discount ({couponCodeData?.code})</span>
                            <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-gray-500 pl-2 border-l-2 border-green-200 space-y-1">
                            <p className="font-medium text-green-700">Applied to:</p>
                            <ul className="list-disc list-inside">
                                {discountBreakdown.eligibleItems.map((itemName, idx) => (
                                    <li key={idx} className="text-green-600">{itemName}</li>
                                ))}
                            </ul>
                            <p>{discountBreakdown.discountPercentage}% discount</p>
                            {discountBreakdown.maxDiscount && (
                                <p className="text-orange-600">Max discount: ${discountBreakdown.maxDiscount}</p>
                            )}
                            <p>Eligible subtotal: ${discountBreakdown.eligibleSubtotal.toFixed(2)}</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span>Total</span>
                    <span className="text-blue-600">${totalPrice}</span>
                </div>
            </div>

            {/* Coupon Code Form */}
            <form onSubmit={handleApplyCoupon} className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apply Coupon Code
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className={`${styles.input} flex-1 h-[45px]`}
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={isApplyingCoupon}
                    />
                    <button
                        type="submit"
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                    </button>
                </div>
                {couponCodeData && (
                    <p className="text-xs text-green-600 mt-2">
                        Coupon applied to specific products only. Check item labels for eligibility.
                    </p>
                )}
                {!couponCodeData && (
                    <p className="text-xs text-gray-500 mt-2">
                        Enter your coupon code to get discount on eligible items
                    </p>
                )}
            </form>

            {/* Remove Coupon Button */}
            {couponCodeData && (
                <button
                    onClick={() => {
                        setCouponCodeData(null);
                        setDiscountPrice(null);
                        toast.info("Coupon removed");
                    }}
                    className="mt-3 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove coupon
                </button>
            )}
        </div>
    );
};

export default Checkout;