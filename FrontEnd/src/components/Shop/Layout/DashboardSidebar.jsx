import React from "react";
import { AiOutlineFolderAdd, AiOutlineGift } from "react-icons/ai";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { VscNewFile } from "react-icons/vsc";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import { Link } from "react-router-dom";
import { BiMessageSquareDetail } from "react-icons/bi";
import { HiOutlineReceiptRefund } from "react-icons/hi";

const DashboardSideBar = ({ active }) => {
    const menuItems = [
        { id: 1, label: "Dashboard", icon: RxDashboard, path: "/dashboard" },
        { id: 2, label: "All Orders", icon: FiShoppingBag, path: "/dashboard-orders" },
        { id: 3, label: "All Products", icon: FiPackage, path: "/dashboard-products" },
        { id: 4, label: "Create Product", icon: AiOutlineFolderAdd, path: "/dashboard-create-product" },
        { id: 5, label: "All Events", icon: MdOutlineLocalOffer, path: "/dashboard-events" },
        { id: 6, label: "Create Event", icon: VscNewFile, path: "/dashboard-create-event" },
        { id: 7, label: "Withdraw Money", icon: CiMoneyBill, path: "/dashboard-withdraw-money" },
        { id: 8, label: "Shop Inbox", icon: BiMessageSquareDetail, path: "/dashboard-messages" },
        { id: 9, label: "Discount Codes", icon: AiOutlineGift, path: "/dashboard-coupons" },
        { id: 10, label: "Refunds", icon: HiOutlineReceiptRefund, path: "/dashboard-refunds" },
        { id: 11, label: "Settings", icon: CiSettings, path: "/settings" },
    ];

    return (
        <div className="h-screen bg-white border-r border-gray-200 sticky top-0 left-0 z-10
                    w-16 lg:w-64 flex flex-col items-center lg:items-start 
                    py-4 overflow-y-auto transition-all duration-300 ease-in-out">

            {/* Logo/Header Section (Optional) */}
            <div className="hidden lg:flex px-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
            </div>

            {/* Menu Items */}
            <div className="w-full px-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;

                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`flex items-center w-full px-3 py-3 my-1 rounded-lg transition-all duration-200
                ${isActive
                                    ? "bg-green-500 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                                }
                justify-center lg:justify-start group`}
                        >
                            <Icon
                                size={22}
                                className={`${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}
                            />
                            <span className="hidden lg:block ml-3 text-sm font-medium whitespace-nowrap">
                                {item.label}
                            </span>

                            {/* Active indicator for mobile */}
                            {isActive && (
                                <div className="lg:hidden absolute right-0 w-1 h-6 bg-green-600 rounded-l-full"></div>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Bottom padding/spacer */}
            <div className="flex-grow"></div>

            {/* Optional: User profile/Logout section */}
            <div className="hidden lg:block w-full px-3 pt-4 mt-4 border-t border-gray-100">
                <div className="flex items-center px-2 py-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">U</span>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">User Name</p>
                        <p className="text-xs text-gray-500">Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSideBar;