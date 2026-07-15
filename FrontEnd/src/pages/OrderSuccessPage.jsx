import React, { useEffect } from "react";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Lottie from "lottie-react";
import { Link, useLocation, useParams } from "react-router-dom";
import animationData from "../assets/animations/107043-success.json";
import { resolveAssetUrl } from "../server";

const OrderSuccessPage = () => {
    const location = useLocation();
    const { id } = useParams();

    const orderId = location.state?.orderId || id || "N/A";
    const paymentMethod = location.state?.paymentMethod || "card";
    const amount = location.state?.amount;
    const items = location.state?.items || [];
    const shippingAddress = location.state?.shippingAddress || {};
    const paymentDetails = location.state?.paymentDetails || {};

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-50">
            <Header />
            <Success
                orderId={orderId}
                paymentMethod={paymentMethod}
                amount={amount}
                items={items}
                shippingAddress={shippingAddress}
                paymentDetails={paymentDetails}
            />
            <Footer />
        </div>
    );
};

const Success = ({ orderId, paymentMethod, amount, items, shippingAddress, paymentDetails }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const getItemImageSrc = (item) => {
        const image = item?.images?.[0];

        if (!image) {
            return null;
        }

        const imagePath = typeof image === "string" ? image : image.url || image.public_id;

        if (!imagePath) {
            return null;
        }

        if (/^https?:\/\//i.test(imagePath)) {
            return imagePath;
        }

        return resolveAssetUrl(imagePath);
    };

    const methodLabel =
        paymentMethod === "card"
            ? "Credit / Debit Card"
            : paymentMethod === "paypal"
                ? "PayPal"
                : paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : paymentMethod;

    const summaryItems = [
        { label: "Order ID", value: orderId },
        { label: "Payment Method", value: methodLabel },
        { label: "Payment Status", value: "Confirmed" },
        {
            label: "Amount Paid",
            value:
                typeof amount === "number" || typeof amount === "string"
                    ? `$${Number(amount).toFixed(2)}`
                    : "Processing",
        },
    ];

    return (
        <div className="w-full flex items-center justify-center px-4 py-12 sm:py-16 lg:py-20">
            <div className="w-full max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
                    {/* Main Content Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 lg:p-10">
                        {/* Success Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3.5 py-1.5 text-green-700 text-sm font-semibold mb-6">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Payment successful
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            Your order has been placed successfully.
                        </h1>

                        <p className="mt-4 text-gray-600 text-base leading-relaxed">
                            Thank you for your purchase. We've received your payment and are preparing your order for processing.
                        </p>

                        {/* Summary Cards */}
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {summaryItems.map((item) => (
                                <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-gray-300">
                                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                        {item.label}
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-gray-900 wrap-break-word">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Shipping Details */}
                        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
                            <div className="flex items-center justify-between gap-3 mb-5">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                    Shipping details
                                </h2>
                                <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                                    Delivery destination
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Recipient</p>
                                    <p className="mt-2 font-semibold text-gray-900">{shippingAddress.fullName || "Customer"}</p>
                                    <p className="mt-1 text-sm text-gray-600">{paymentDetails?.cardName || paymentDetails?.payerName || ""}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Contact</p>
                                    <p className="mt-2 font-semibold text-gray-900">{shippingAddress.phoneNumber || "N/A"}</p>
                                    <p className="mt-1 text-sm text-gray-600 wrap-break-word">
                                        {shippingAddress.city || ""}{shippingAddress.country ? `, ${shippingAddress.country}` : ""}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 sm:col-span-2">
                                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Address</p>
                                    <p className="mt-2 font-medium text-gray-900 wrap-break-word">
                                        {shippingAddress.address1 || ""}
                                        {shippingAddress.address2 ? `, ${shippingAddress.address2}` : ""}
                                        {shippingAddress.zipCode ? ` - ${shippingAddress.zipCode}` : ""}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items Ordered */}
                        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-5">
                                Items ordered ({items.length})
                            </h2>

                            {items.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                                    {items.map((item, index) => (
                                        <div key={item._id || index} className="flex gap-4 rounded-xl bg-gray-50 border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                                            <div className="h-16 w-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                                {getItemImageSrc(item) ? (
                                                    <img
                                                        src={getItemImageSrc(item)}
                                                        alt={item.name}
                                                        className="h-full w-full object-contain p-1"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-400 font-medium">No image</span>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-gray-900 wrap-break-word line-clamp-2">{item.name}</p>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Qty: {item.qty || 1} • Shop: {item.shop?.name || "Unknown shop"}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-bold text-gray-900">
                                                    ${(Number(item.qty || 1) * Number(item.discountPrice || item.price || 0)).toFixed(2)}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Paid</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-8">Your ordered items will appear here when order data is available.</p>
                            )}
                        </div>

                        {/* Next Steps */}
                        <div className="mt-8 rounded-xl bg-blue-50 border border-blue-100 p-5">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-4">
                                What happens next
                            </h2>
                            <div className="space-y-2 text-sm text-gray-700">
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">1.</span>
                                    <span>We will verify and prepare your order.</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">2.</span>
                                    <span>You will receive an update with shipping progress.</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">3.</span>
                                    <span>Your payment has been confirmed and processed.</span>
                                </p>
                            </div>
                        </div>

                        {paymentDetails?.cardName && (
                            <p className="mt-5 text-sm text-gray-500">
                                Payment name: <span className="font-semibold text-gray-700">{paymentDetails.cardName}</span>
                            </p>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/products"
                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200"
                            >
                                Continue shopping
                            </Link>
                            <Link
                                to="/profile"
                                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors focus:ring-4 focus:ring-gray-200"
                            >
                                View account
                            </Link>
                        </div>
                    </div>

                    {/* Right Side - Animation Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-50 via-white to-blue-50 border border-blue-100 shadow-lg p-8 sm:p-10 flex flex-col items-center justify-center text-center lg:sticky lg:top-24">
                        {/* Decorative blobs */}
                        <div className="absolute inset-0 opacity-30 pointer-events-none">
                            <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-blue-200 blur-3xl" />
                            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-green-100 blur-3xl" />
                        </div>

                        <div className="relative z-10 max-w-md">
                            <Lottie
                                animationData={animationData}
                                loop={false}
                                autoplay
                                className="w-full max-w-70 mx-auto"
                            />

                            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-gray-700 text-sm font-medium shadow-sm border border-gray-200 backdrop-blur-sm">
                                Order reference: <span className="font-bold text-gray-900">#{orderId}</span>
                            </div>

                            <h2 className="mt-8 text-2xl sm:text-3xl font-bold text-gray-900">
                                You're all set.
                            </h2>

                            <p className="mt-3 text-gray-600 leading-relaxed">
                                Keep this page for your records. Your order is confirmed and we've stored the payment details for fulfillment.
                            </p>

                            {/* Additional info */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                    A confirmation email has been sent to your registered email address.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add custom scrollbar styles (add this to your global CSS or use a CSS file)
const style = document.createElement('style');
style.textContent = `
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
`;
if (!document.querySelector('#order-success-styles')) {
    style.id = 'order-success-styles';
    document.head.appendChild(style);
}

export default OrderSuccessPage;