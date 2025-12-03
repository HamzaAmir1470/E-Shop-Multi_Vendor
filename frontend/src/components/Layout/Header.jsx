import React, { useEffect, useState } from "react";
import styles from "../../styles/styles";
import { Link } from "react-router-dom";
import { productData, categoriesData } from "../../static/data";
import {
    AiOutlineHeart,
    AiOutlineSearch,
    AiOutlineShoppingCart,
} from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { IoIosArrowForward, IoIosArrowDown, IoIosArrowRoundForward } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { BiMenuAltLeft } from "react-icons/bi";
import DropDown from "./DropDown";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { backend_url } from "../../server";
import Cart from "../cart/Cart"
import Wishlist from "../Wishlist/Wishlist"
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const Header = ({ activeHeading, setActiveHeading }) => {
    const { isAuthenticated, user, loading } = useSelector((state) => state.user)
    const [searchTerm, setSearchTerm] = React.useState("");
    const [searchData, setSearchData] = React.useState([]);
    const [dropDown, setDropDown] = React.useState(false);
    const [active, setActive] = React.useState(false);
    const [open, setOpen] = useState(false);
    const [openCart, setOpenCart] = React.useState(false);
    const [openWishlist, setOpenWishlist] = React.useState(false);
    const searchRef = React.useRef(null);

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        const filteredProducts = productData?.filter((product) =>
            product.name.toLowerCase().includes(term.toLowerCase())
        );

        setSearchData(filteredProducts);
    };

    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchData([]); // hide dropdown
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);


    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 80) setActive(true);
            else setActive(false);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const avatarSrc = user?.avatar?.url
        ? `${backend_url}/${encodeURIComponent(user.avatar.url)}`
        : "/default-avatar.png";

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
            .catch(() => { });
    };

    return (
        <>
            {/* DESKTOP TOP HEADER */}
            <div className="hidden md:flex w-full bg-white  top-0 left-0 z-50 shadow-sm py-2">
                <div className="w-full flex items-center justify-between">

                    {/* LOGO */}
                    <Link to="/">
                        <img
                            src="https://shopo.quomodothemes.website/assets/images/logo.svg"
                            alt="LOGO"
                            className="h-[45px] md:h-[55px]"
                        />
                    </Link>

                    {/* SEARCH BAR */}
                    <div className="flex-1 mx-10 relative max-w-[600px]" ref={searchRef}>
                        <input
                            type="text"
                            placeholder="Search Product..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full h-[45px] pl-4 pr-12 border-2 border-[#3957db] rounded-lg outline-none shadow-sm"
                        />

                        <AiOutlineSearch
                            size={26}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer"
                        />

                        {searchData.length > 0 && (
                            <div className="absolute left-0 mt-2 w-full bg-white rounded-lg shadow-lg z-40 max-h-[50vh] overflow-y-auto border border-gray-200">
                                {searchData.map((i, index) => {
                                    const Product_name = i.name.replace(/\s+/g, "-");
                                    return (
                                        <Link to={`/product/${Product_name}`} key={index}>
                                            <div className="flex items-center gap-3 p-3 hover:bg-gray-100 transition cursor-pointer">
                                                <img
                                                    src={i.image_Url[0].url}
                                                    className="w-12 h-12 rounded object-cover"
                                                />
                                                <p className="text-gray-800 font-medium">{i.name}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* SELLER BUTTON */}
                    <div className={styles.button}>
                        <Link to="/seller" className="flex items-center text-white">
                            Become Seller
                            <IoIosArrowForward className="ml-1" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* DESKTOP BLUE BAR */}
            <div
                className={`hidden md:flex items-center w-full bg-[#3321c8] h-[60px] md:sticky shadow-sm z-30 ${active ? "fixed top-0 left-0" : "absolute top-[90px] left-0"}`}>
                <div className={`${styles.section} flex items-center justify-between h-full`}>
                    {/* CATEGORY */}
                    <div className="relative h-[60px] w-[270px]">
                        <BiMenuAltLeft
                            size={30}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                        />

                        <button
                            onClick={() => setDropDown(!dropDown)}
                            className="w-full h-full flex justify-between items-center pl-12 pr-10 bg-white rounded-md font-medium text-lg border shadow-sm"
                        >
                            All Categories
                        </button>

                        <IoIosArrowDown
                            size={20}
                            onClick={() => setDropDown(!dropDown)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer"
                        />

                        {dropDown && (
                            <DropDown
                                categoriesData={categoriesData}
                                setDropDown={setDropDown}
                            />
                        )}
                    </div>

                    {/* NAVBAR */}
                    <Navbar active={activeHeading} />

                    {/* ICONS */}
                    <div className="flex items-center gap-6">
                        {/* HEART */}
                        <div className="relative cursor-pointer" onClick={() => setOpenWishlist(true)}>
                            <AiOutlineHeart size={30} className="text-white" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#3bc177] text-white text-[10px] rounded-full flex justify-center items-center">0</span>
                        </div>

                        {/* CART */}
                        <div className="relative cursor-pointer" onClick={() => setOpenCart(true)}>
                            <AiOutlineShoppingCart size={30} className="text-white" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#3bc177] text-white text-[10px] rounded-full flex justify-center items-center">0</span>
                        </div>

                        {/* PROFILE */}
                        <div className="cursor-pointer">
                            {isAuthenticated ? (
                                <Link to="/profile">
                                    <img
                                        src={`${backend_url}${user.avatar?.url}`}
                                        alt="avatar"
                                        className="w-[35px] h-[35px] rounded-full object-cover"
                                    />
                                </Link>
                            ) : (
                                <Link to="/Login">
                                    <CgProfile size={30} className="text-white" />
                                </Link>
                            )}
                        </div>

                        {openCart && <Cart setOpenCart={setOpenCart} />}
                        {openWishlist && <Wishlist setOpenWishlist={setOpenWishlist} />}
                    </div>
                </div>
            </div>

            {/* MOBILE HEADER */}
            <div className="md:hidden w-full fixed bg-white z-50 top-0 left-0 shadow-sm py-3">
                <div className="w-full flex items-center justify-between">

                    <BiMenuAltLeft
                        size={40}
                        className="ml-4"
                        onClick={() => setOpen(true)}
                    />

                    <Link to="/">
                        <img
                            src="https://shopo.quomodothemes.website/assets/images/logo.svg"
                            alt="LOGO"
                            className="h-[40px]"
                        />
                    </Link>

                    <div className="relative mr-[20px]" onClick={() => setOpenCart(true)}>
                        <AiOutlineShoppingCart size={30} />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#3bc177] text-white text-[10px] rounded-full flex justify-center items-center"
                        // {cart && cart.length}
                        >0</span>
                        {/* cart popup */}
                        {openCart ? <Cart setOpenCart={setOpenCart} /> : null}

                        {/* wishlist popup */}
                        {openWishlist ? <Wishlist setOpenWishlist={setOpenWishlist} /> : null}
                    </div>
                </div>

                {/* SIDEBAR */}
                {open && (
                    <div className="fixed inset-0 bg-black/50 z-40">
                        <div className="fixed top-0 left-0 w-[75%] max-w-[320px] h-full bg-white z-50 shadow-xl">

                            <div className="flex items-center justify-between px-4 py-4 border-b">
                                <div className="relative mr-[15px]" onClick={() => setOpenWishlist(true) || setOpen(false)}>
                                    <AiOutlineHeart
                                        size={28}
                                        className="text-gray-700"
                                        onClick={() => setOpenWishlist(true)}
                                    />

                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#3bc177] text-white text-[10px] rounded-full flex justify-center items-center">0</span>
                                </div>

                                <RxCross1
                                    size={28}
                                    className="cursor-pointer"
                                    onClick={() => setOpen(false)}
                                />
                            </div>

                            <div className="w-[92%] mx-auto mt-4 mb-4 relative " ref={searchRef}>
                                <input
                                    type="search"
                                    placeholder="Search Products..."
                                    className="w-full h-[45px] px-3 border-2 border-[#3957db] rounded-md"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />

                                {searchData.length > 0 && (
                                    <div className="absolute left-0 mt-2 w-full bg-white rounded-lg shadow-lg z-50 max-h-[45vh] overflow-y-auto border">
                                        {searchData.map((i, index) => {
                                            const Product_name = i.name.replace(/\s+/g, "-");
                                            return (
                                                <Link
                                                    to={`/product/${Product_name}`}
                                                    key={index}
                                                    onClick={() => setOpen(false)}
                                                    className="block"
                                                >
                                                    <div
                                                        className="flex items-center gap-3 p-3 hover:bg-gray-100">
                                                        <img
                                                            src={i.image_Url[0].url}
                                                            alt={i.name}
                                                            className="w-12 h-12 rounded object-cover"
                                                        />
                                                        <p className="text-gray-800 font-medium">{i.name}</p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <Navbar
                                active={activeHeading}
                            />
                            <div className={`${styles.button} ml-4 !rounded-[4px]`}>
                                <Link to="/seller">
                                    <h1 className="text-[#fff] flex items-center">Become a Seller <IoIosArrowForward className="ml-1" /></h1>
                                </Link>
                            </div>
                            <br />
                            <div className="flex w-full justify-evenly">
                                {
                                    isAuthenticated ? (
                                        // User is logged in → show avatar + Logout
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="">
                                                <Link to="/profile">
                                                    <img
                                                        src={avatarSrc} // or `${backend_url}${user.avatar?.url}`
                                                        alt="User"
                                                        className="w-[80px] h-[80px] rounded-full object-cover border-[3px] border-[#0cac88]"
                                                    />
                                                </Link>
                                            </div>
                                            <button
                                                onClick={logoutHandler}
                                                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition "
                                                title="Logout"
                                            >
                                                <FiLogOut size={20} />
                                                <span className="hidden md:inline">Logout</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-4">
                                            <Link
                                                to="/login"
                                                className="text-[18px] text-[#000000b7] hover:text-[#17dd1f] transition"
                                            >
                                                Login  &nbsp;/&nbsp;
                                            </Link>
                                            <Link
                                                to="/sign-up"
                                                className="text-[18px] text-[#000000b7] hover:text-[#17dd1f] transition"
                                            >
                                                Sign-Up
                                            </Link>
                                        </div>
                                    )
                                }


                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>

    );
};

export default Header;
