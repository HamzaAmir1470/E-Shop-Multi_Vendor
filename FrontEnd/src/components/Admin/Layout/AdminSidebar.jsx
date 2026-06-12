import React from "react";
import { FiShoppingBag } from "react-icons/fi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { VscNewFile } from "react-icons/vsc";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import { Link } from "react-router-dom";
import { GrWorkshop } from "react-icons/gr";
import { BiMessageSquareDetail } from "react-icons/bi";
import { IoCloseOutline } from "react-icons/io5";
import { FiUsers } from "react-icons/fi";
import { AiOutlineGift } from "react-icons/ai";
import { HiOutlineReceiptRefund } from "react-icons/hi";
import { FiUser } from "react-icons/fi";

const AdminSidebar = ({ active, isMobile = false, toggleMobileMenu }) => {
    const menuItems = [
        { id: 1, label: "Dashboard", icon: RxDashboard, path: "/admin/dashboard" },
        { id: 2, label: "All Orders", icon: FiShoppingBag, path: "/admin-orders" },
        { id: 3, label: "All Sellers", icon: GrWorkshop, path: "/admin-sellers" },
        { id: 4, label: "All Users", icon: FiUsers, path: "/admin-users" },
        { id: 5, label: "All Events", icon: MdOutlineLocalOffer, path: "/admin-events" },
        { id: 6, label: "All Products", icon: FiShoppingBag, path: "/admin-products" },
        { id: 7, label: "Withdraw Requests", icon: CiMoneyBill, path: "/admin-withdraw-requests" },
        { id: 11, label: "Settings", icon: CiSettings, path: "/profile" },
    ];

    return (
        <div className={`${isMobile ? "min-h-full w-full" : "h-[90vh] w-16 lg:w-64"} bg-white border-r border-gray-200 sticky top-0 left-0 z-10
                    flex flex-col ${isMobile ? "items-start" : "items-center lg:items-start"} 
                    py-4 overflow-y-auto transition-all duration-300 ease-in-out`}>

            {isMobile && toggleMobileMenu && (
                <div className="w-full flex items-center justify-between px-4 mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Dashboard</h2>
                    <button
                        type="button"
                        onClick={toggleMobileMenu}
                        className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        aria-label="Close dashboard menu"
                    >
                        <IoCloseOutline size={24} />
                    </button>
                </div>
            )}

            
            {/* Menu Items */}
            <div className="w-full px-2 h-full flex flex-col justify-start">
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
                        ${isMobile ? "justify-start" : "justify-center lg:justify-start"} group`}
                        >
                            <Icon
                                size={22}
                                className={`${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}
                            />
                            <span className={`${isMobile ? "block" : "hidden lg:block"} ml-3 text-sm font-medium whitespace-nowrap`}>
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
        </div>
    );
};

export default AdminSidebar;