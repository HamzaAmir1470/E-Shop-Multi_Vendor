import React, { useState } from "react";
import { AiOutlineGift, AiOutlineClose } from "react-icons/ai";
import { MdOutlineLocalOffer } from "react-icons/md";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { BiMessageSquareDetail } from "react-icons/bi";
import { BsBell } from "react-icons/bs";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { backend_url } from "../../../server";

const DashboardHeader = () => {
    const { seller } = useSelector((state) => state.seller);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!seller) return null;

    // Safe avatar URL construction
    const getAvatarUrl = () => {
        if (!seller?.avatar) return "/default-avatar.png";

        const avatarPath = seller.avatar.startsWith('/') ? seller.avatar : `/${seller.avatar}`;
        return `${backend_url}${avatarPath}`;
    };

    const iconClass = "mx-3 cursor-pointer text-gray-600 hover:text-green-500 transition-colors duration-200";

    const mobileIconClass = "w-full flex items-center justify-center p-4 hover:bg-gray-50 rounded-lg";

    // Navigation items
    const navItems = [
        { id: 1, icon: AiOutlineGift, label: "Discount Codes", path: "/dashboard-coupons" },
        { id: 2, icon: MdOutlineLocalOffer, label: "Events", path: "/dashboard-events" },
        { id: 3, icon: FiShoppingBag, label: "Products", path: "/dashboard-products" },
        { id: 4, icon: FiPackage, label: "Orders", path: "/dashboard-orders" },
        { id: 5, icon: BiMessageSquareDetail, label: "Messages", path: "/dashboard-messages" },
    ];

    // Add CSS animation styles directly in the component
    const slideDownAnimation = {
        animation: 'slideDown 0.3s ease-out'
    };

    return (
        <>
            <style>
                {`
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
            </style>

            <div className="w-full h-[80px] bg-white shadow-md sticky top-0 left-0 z-40 flex items-center justify-between px-4 md:px-8 border-b border-gray-100">
                {/* Logo Section */}
                <div>
                    <Link to="/">
                        <div className="
  flex
  items-center
  gap-2
  bg-gradient-to-r
  from-teal-800
  to-teal-600
  px-4
  py-1.5
  rounded-xl
  shadow-md
  hover:shadow-teal-500/30
  transition-all
  duration-300
  hover:scale-105
  cursor-pointer
  group
  border
  border-teal-400/30
">
                            {/* Crown icon - warm contrast */}
                            <svg
                                className="w-7 h-7 text-orange-400 group-hover:rotate-12 transition-transform duration-300"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>

                            {/* Shop name */}
                            <div className="flex flex-col">
                                <span className="
      text-xl
      font-bold
      text-white
      tracking-wider
      leading-tight
    ">
                                    SULTAN
                                </span>
                                <span className="
      text-xs
      font-semibold
      text-orange-400
      tracking-widest
      -mt-1
    ">
                                    SHOP
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Icons & Profile Section */}
                <div className="flex items-center space-x-2 md:space-x-4">
                    {/* Notification Bell */}
                    <div className="relative hidden md:block">
                        <BsBell
                            className="text-gray-600 hover:text-green-500 cursor-pointer transition-colors duration-200"
                            size={24}
                        />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            3
                        </span>
                    </div>

                    {/* Navigation Icons - Desktop */}
                    <div className="hidden lg:flex items-center">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    title={item.label}
                                >
                                    <Icon size={26} className={iconClass} />
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden ml-2">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="w-10 h-10 flex flex-col justify-center items-center space-y-1.5 cursor-pointer focus:outline-none"
                        >
                            {mobileMenuOpen ? (
                                <AiOutlineClose size={24} className="text-gray-700" />
                            ) : (
                                <>
                                    <span className="w-6 h-0.5 bg-gray-600 transition-transform duration-200"></span>
                                    <span className="w-6 h-0.5 bg-gray-600 transition-opacity duration-200"></span>
                                    <span className="w-6 h-0.5 bg-gray-600 transition-transform duration-200"></span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Profile Section */}
                    <div className="ml-4 flex items-center space-x-3">
                        <Link to={`/shop/${seller._id}`}>
                            <div className="relative">
                                <img
                                    src={getAvatarUrl()}
                                    alt={seller.name || "Seller Avatar"}
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 hover:border-green-400 transition-colors duration-200"
                                    onError={(e) => {
                                        e.target.src = "/default-avatar.png";
                                    }}
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                        </Link>

                        {/* Seller Info - Hidden on small screens */}
                        <div className="hidden md:block">
                            <p className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                                {seller.name || "Seller"}
                            </p>
                            <p className="text-xs text-gray-500">View Shop</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 mt-[80px]"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <div
                        className="bg-white shadow-lg rounded-b-lg"
                        style={slideDownAnimation}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile Icons Grid */}
                        <div className="grid grid-cols-3 gap-2 p-4">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={mobileIconClass}
                                    >
                                        <div className="flex flex-col items-center space-y-2">
                                            <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full hover:bg-green-50 transition-colors">
                                                <Icon size={24} className="text-gray-700" />
                                            </div>
                                            <span className="text-xs font-medium text-gray-700 text-center">
                                                {item.label}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}

                            {/* Notification Item for Mobile */}
                            <div
                                className={mobileIconClass}
                                onClick={() => {
                                    // Handle notification click
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="relative">
                                        <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full hover:bg-green-50 transition-colors">
                                            <BsBell size={24} className="text-gray-700" />
                                        </div>
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                            3
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 text-center">
                                        Notifications
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Profile Info */}
                        <div className="border-t border-gray-100 p-4">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={getAvatarUrl()}
                                    alt={seller.name || "Seller Avatar"}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                    onError={(e) => {
                                        e.target.src = "/default-avatar.png";
                                    }}
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {seller.name || "Seller"}
                                    </p>
                                    <p className="text-xs text-gray-500">Online</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DashboardHeader;