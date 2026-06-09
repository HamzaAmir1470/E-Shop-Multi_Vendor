
import { AiOutlineCreditCard, AiOutlineMessage, AiOutlineLogin } from 'react-icons/ai';
import { HiOutlineReceiptRefund, HiOutlineShoppingBag } from 'react-icons/hi';
import { RxPerson } from 'react-icons/rx';
import { MdOutlineAdminPanelSettings, MdOutlineTrackChanges } from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';
import { TbAddressBook } from "react-icons/tb";
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import { server } from '../../server';
import { toast } from "react-toastify";
import { useSelector } from 'react-redux';

const ProfileSidebar = ({ setActive, active }) => {
    const { user } = useSelector((state) => state.user);
    const navigate = useNavigate();

    const logoutHandler = () => {
        axios
            .get(`${server}/user/logout`, { withCredentials: true })
            .then((res) => {
                toast.success(res.data.message);
                setTimeout(() => {
                    window.location.reload();
                    navigate("/login");
                }, 800);
            })
            .catch((err) => {
                console.log(err.response.data.message);
                toast.error(err.response.data.message);
            });
    };
    const menuItems = [
        { id: 1, label: "Profile", icon: RxPerson },
        { id: 2, label: "Orders", icon: HiOutlineShoppingBag },
        { id: 3, label: "Refunds", icon: HiOutlineReceiptRefund },
        {
            id: 4,
            label: "Inbox",
            icon: AiOutlineMessage,
            action: () => navigate("/inbox"),
        },
        { id: 5, label: "Track Order", icon: MdOutlineTrackChanges },
        { id: 6, label: "Change Password", icon: RiLockPasswordLine },
        { id: 7, label: "Address", icon: TbAddressBook },

        ...(user?.role === "admin"
            ? [
                {
                    id: 8,
                    label: "Admin Dashboard",
                    icon: MdOutlineAdminPanelSettings,
                    action: () => navigate("/admin/dashboard"),
                },
            ]
            : []),

        {
            id: 9,
            label: "Log Out",
            icon: AiOutlineLogin,
            action: logoutHandler,
            isLogout: true,
        },
    ];
    const handleItemClick = (item) => {
        if (item.action) {
            item.action();
        }
        if (!item.isLogout) {
            setActive(item.id);
        }
    };

    return (
        <div className="h-[600px] mt-14 md:mt-0   bg-white border border-gray-200 sticky top-0 left-0 z-10
                        w-16 lg:w-64 flex flex-col items-center lg:items-start 
                        py-4 overflow-y-auto transition-all duration-300 ease-in-out
                        select-none cursor-default">

            {/* Header Section */}
            <div className="hidden lg:flex px-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800 cursor-default select-none">
                    User Profile
                </h2>
            </div>

            {/* Menu Items */}
            <div className="w-full px-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;
                    const isLogout = item.isLogout;

                    return (
                        <div
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className={`flex items-center w-full px-3 py-3 my-1 rounded-lg transition-all duration-200 
                                ${isActive
                                    ? "bg-green-500 text-white shadow-md"
                                    : isLogout
                                        ? "text-red-500 hover:bg-red-50 hover:text-red-700 hover:shadow-sm"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                                }
                                justify-center lg:justify-start group cursor-pointer`}
                        >
                            <Icon
                                size={22}
                                className={`${isActive
                                    ? "text-white"
                                    : isLogout
                                        ? "text-red-500 group-hover:text-red-700"
                                        : "text-gray-500 group-hover:text-gray-700"
                                    }`}
                            />
                            <span className="hidden lg:block ml-3 text-sm font-medium whitespace-nowrap select-none">
                                {item.label}
                            </span>

                            {/* Active indicator for mobile */}
                            {isActive && !isLogout && (
                                <div className="lg:hidden absolute right-0 w-1 h-6 bg-green-600 rounded-l-full"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom padding/spacer */}
            <div className="flex-grow"></div>

            {/* User info section (optional) */}
            <div className="hidden lg:block w-full px-3 pt-4 mt-4 border-t border-gray-100">
                <div className="flex items-center px-2 py-3 rounded-lg hover:bg-gray-50 cursor-pointer select-none">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700 select-none">My Account</p>
                        <p className="text-xs text-gray-500 select-none">User Settings</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSidebar;