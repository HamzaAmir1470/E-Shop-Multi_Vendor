import React from "react";
import styles from "../../styles/styles";
import CountDown from "./CountDown.jsx";
import { backend_url } from "../../server.js";

const EventCard = ({ active, data }) => {
    return (
        <div
            className={`w-full md:mt-0 mt-20 bg-white rounded-2xl transition-all duration-300 overflow-hidden flex flex-col lg:flex-row shadow-lg hover:shadow-2xl ${active ? "mb-0" : "mb-12"
                }`}
        >
            {/* Image Section with Overlay Badge */}
            <div className="w-full lg:w-3/5 h-56 lg:h-100 relative group flex justify-center items-center bg-gradient-to-br from-gray-50 to-white ">
                <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    🔥 Flash Sale
                </div>
                <div className="absolute h-full inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <div className="relative w-40 h-40 lg:w-80 lg:h-80 flex items-center justify-center">
                    <img
                        src={`${backend_url}${data?.images[0]}`}
                        alt={data?.name}
                        className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                    />
                </div>
            </div>
            {/* Content Section */}
            <div className="w-full lg:w-1/2 p-6 sm:p-8 flex flex-col justify-center gap-5 bg-gradient-to-br from-white to-gray-50">
                {/* Product Title */}
                <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-2 line-clamp-2">
                        {data?.name}
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-[#3321c8] to-[#4a3ad6] rounded-full"></div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                    {data?.description}
                </p>

                {/* Pricing + Timer Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0 mt-2">
                    <div className="space-y-2">
                        <div className="flex items-baseline gap-3 flex-wrap">
                            <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                                ${data?.discountPrice || "999"}
                            </span>
                            <span className="line-through text-xl text-red-400 font-medium">
                                ${data?.originalPrice || "1099"}
                            </span>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-3">
                            <span className="text-green-600 text-sm sm:text-base font-semibold bg-green-50 px-3 py-1 rounded-full">
                                {data?.sold || "120"} Sold
                            </span>
                            {data?.stock && (
                                <span className="text-orange-600 text-sm sm:text-base font-semibold bg-orange-50 px-3 py-1 rounded-full">
                                    Only {data.stock} left
                                </span>
                            )}
                        </div>
                    </div>

                    <CountDown data={data} />
                </div>

                {/* Progress Bar - Optional (if you want to show stock progress) */}
                {data?.stock && data?.sold && (
                    <div className="w-full mt-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Sold: {data.sold}</span>
                            <span>Available: {data.stock}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#3321c8] to-[#4a3ad6] rounded-full"
                                style={{ width: `${(data.sold / (data.sold + data.stock)) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Shop Info - Optional */}
                {data?.shop && (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                        <img
                            src={`${backend_url}${data.shop.avatar}`}
                            alt={data.shop.name}
                            className="w-8 h-8 rounded-full object-cover border-2 border-[#3321c8]"
                        />
                        <span className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">{data.shop.name}</span> • Verified Seller
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCard;