import { useRef, useEffect, useState } from "react";
import styles from "../../styles/styles";
import { Link, useNavigate } from "react-router-dom";
import { categoriesData } from "../../static/data.jsx";
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { IoIosArrowForward, IoIosArrowDown } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { BiMenuAltLeft } from "react-icons/bi";
import DropDown from "./DropDown.jsx";
import Navbar from "./Navbar.jsx";
import { useSelector } from "react-redux";
import { backend_url } from "../../server";
import Cart from "../cart/Cart.jsx";
import Wishlist from "../Wishlist/Wishlist.jsx";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const Header = ({ activeHeading }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isSeller } = useSelector((state) => state.seller);
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.user || {});
  const { products = [] } = useSelector((state) => state.product || {});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [dropDown, setDropDown] = useState(false);
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (products && Array.isArray(products) && products.length > 0) {
      const filteredProducts = products.filter((product) =>
        product?.name?.toLowerCase().includes(term.toLowerCase())
      );
      setSearchData(filteredProducts || []);
    } else {
      setSearchData([]);
    }
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchData([]);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
        setSearchData([]);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) setActive(true);
      else setActive(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Safe avatar URL with fallback
  const avatarSrc = user?.avatar?.url
    ? `${backend_url}${user.avatar.url}`
    : "https://res.cloudinary.com/demo/image/upload/v1312461204/sample_profile.jpg";

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

  // Safe cart and wishlist counts
  const wishlistCount = wishlist?.length || 0;

  // Function to get correct image URL
  const getImageUrl = (product) => {
    if (!product) return "/default-product.jpg";

    // Check different possible image structures
    if (product.images && product.images[0]) {
      return `${backend_url}${product.images[0]}`;
    } else if (product.image_Url && product.image_Url[0]) {
      return product.image_Url[0].url || `${backend_url}${product.image_Url[0]}`;
    } else if (product.image && product.image[0]) {
      return `${backend_url}${product.image[0]}`;
    }

    return "/default-product.jpg";
  };

  return (
    <>
      {/* DESKTOP TOP HEADER */}
      <div className="hidden md:block w-full bg-white/95 backdrop-blur-md sticky top-0 left-0 z-50 shadow-sm border-b border-gray-100">
        <div className="w-full flex items-center justify-between px-5 py-2">
          {/* LOGO */}
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

            {searchData?.length > 0 && (
              <div className="absolute left-0 mt-2 w-full bg-white rounded-lg shadow-lg z-40 max-h-[400px] overflow-y-auto border border-gray-200">
                {searchData.map((item, index) => {
                  const imageUrl = getImageUrl(item);

                  return (
                    <Link
                      to={`/product/${item._id}`}
                      key={item?._id || index}
                      onClick={() => {
                        setSearchData([]);
                        setSearchTerm("");
                      }}
                    >
                      <div className="flex items-center gap-3 p-3 hover:bg-gray-100 transition cursor-pointer border-b last:border-b-0">
                        <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={item?.name || "Product"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/150?text=No+Image";
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium line-clamp-1">{item?.name || "Product"}</p>
                          {item?.discountPrice && (
                            <p className="text-green-600 font-semibold">${item.discountPrice}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* SELLER BUTTON */}
          <div className={styles.button}>
            <Link to={isSeller ? "/dashboard" : "/shop-create"} className="flex items-center text-white">
              {isSeller ? "Go Dashboard" : "Become a Seller"}
            </Link>
          </div>
        </div>
      </div>

      {/* DESKTOP BLUE BAR - FIXED */}
      <div
        className={`hidden md:flex items-center w-full bg-gradient-to-r from-[#3321c8] to-[#4a3ad6] h-[70px] sticky top-[73px] left-0 z-40 transition-all duration-300 backdrop-blur-md ${active ? "shadow-xl shadow-[#3321c8]/20" : "shadow-lg"
          }`}
      >
        <div className={`${styles.section} flex items-center justify-between h-full w-full px-4`}>
          {/* CATEGORY DROPDOWN */}
          <div className="relative h-[50px] w-[280px] group">
            <BiMenuAltLeft
              size={26}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3321c8] z-10 transition-transform group-hover:scale-110"
            />

            <button
              onClick={() => setDropDown(!dropDown)}
              className="w-full h-full flex justify-between items-center pl-12 pr-10 bg-white rounded-lg font-medium text-base border-2 border-transparent hover:border-white/30 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <span className="text-gray-800">All Categories</span>
              <IoIosArrowDown
                size={18}
                className={`text-gray-600 transition-transform duration-300 ${dropDown ? "rotate-180" : ""
                  }`}
              />
            </button>

            {dropDown && (
              <div className="absolute top-full left-0 mt-2 w-full animate-fadeIn z-50">
                <DropDown
                  categoriesData={categoriesData || []}
                  setDropDown={setDropDown}
                />
              </div>
            )}
          </div>

          {/* NAVBAR - CENTERED */}
          <div className="flex-1 flex justify-center">
            <Navbar active={activeHeading} />
          </div>

          {/* ICONS */}
          <div className="flex items-center gap-5">
            {/* WISHLIST */}
            <div
              className="relative cursor-pointer group p-2 hover:bg-white/10 rounded-full transition-all duration-300"
              onClick={() => setOpenWishlist(true)}
            >
              <AiOutlineHeart
                size={26}
                className="text-white transition-transform group-hover:scale-110"
              />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </div>

            {/* CART */}
            <div
              className="relative cursor-pointer group p-2 hover:bg-white/10 rounded-full transition-all duration-300"
              onClick={() => setOpenCart(!openCart)}
            >
              <AiOutlineShoppingCart
                size={26}
                className="text-white transition-transform group-hover:scale-110"
              />
              {cart && cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#3bc177] text-white text-xs rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>

            {/* PROFILE */}
            <div className="cursor-pointer group">
              {isAuthenticated && user ? (
                <Link to="/profile" className="block">
                  <div className="relative p-1 rounded-full bg-gradient-to-r from-white/20 to-transparent group-hover:bg-white/30 transition-all duration-300">
                    <img
                      src={avatarSrc}
                      alt="avatar"
                      className="w-[38px] h-[38px] rounded-full object-cover border-2 border-white shadow-md transition-transform group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150?text=User";
                      }}
                    />
                  </div>
                </Link>
              ) : (
                <Link to="/login" className="block">
                  <div className="p-2 hover:bg-white/10 rounded-full transition-all duration-300">
                    <CgProfile size={26} className="text-white transition-transform group-hover:scale-110" />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CART AND WISHLIST MODALS */}
      {openCart && <Cart setOpenCart={setOpenCart} />}
      {openWishlist && <Wishlist setOpenWishlist={setOpenWishlist} />}

      {/* MOBILE HEADER */}
      <div className="md:hidden w-full sticky top-0 bg-white/95 backdrop-blur-md z-50 shadow-sm border-b border-gray-100 py-3">
        <div className="w-full flex items-center justify-between px-3">
          <BiMenuAltLeft
            size={40}
            className="cursor-pointer"
            onClick={() => setOpen(true)}
          />

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

          <div className="relative cursor-pointer" onClick={() => setOpenCart(!openCart)}>
            <AiOutlineShoppingCart size={30} />
            {cart && cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#3bc177] text-white text-xs rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
        </div>

        {/* MOBILE SIDEBAR */}
        {open && (
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setOpen(false)}>
            <div
              className="fixed top-0 left-0 w-[85%] max-w-[400px] h-[100dvh] bg-white z-50 shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between px-4 py-4 border-b">
                  <div
                    className="relative cursor-pointer"
                    onClick={() => {
                      setOpenWishlist(true);
                      setOpen(false);
                    }}
                  >
                    <AiOutlineHeart size={28} className="text-gray-700" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#3bc177] text-white text-xs rounded-full flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                  <RxCross1 size={28} className="cursor-pointer" onClick={() => setOpen(false)} />
                </div>
              </div>

              {/* Mobile Search */}
              <div className="w-[92%] mx-auto mt-4 mb-4 relative" ref={mobileSearchRef}>
                <input
                  type="search"
                  placeholder="Search Products..."
                  className="w-full h-[45px] px-3 border-2 border-[#3957db] rounded-md"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />

                {searchData?.length > 0 && (
                  <div className="absolute left-0 mt-2 w-full bg-white rounded-lg shadow-lg z-50 max-h-[60vh] overflow-y-auto border">
                    {searchData.map((item, index) => {
                      const productName = item?.name?.replace(/\s+/g, "-") || "product";
                      const imageUrl = getImageUrl(item);

                      return (
                        <Link
                          to={`/product/${productName}`}
                          key={item?._id || index}
                          onClick={() => {
                            setOpen(false);
                            setSearchData([]);
                            setSearchTerm("");
                          }}
                          className="block"
                        >
                          <div className="flex items-center gap-3 p-3 hover:bg-gray-100 border-b last:border-b-0">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                              <img
                                src={imageUrl}
                                alt={item?.name || "Product"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/150?text=No+Image";
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-800 font-medium line-clamp-1">{item?.name || "Product"}</p>
                              {item?.discountPrice && (
                                <p className="text-green-600 font-semibold">${item.discountPrice}</p>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <Navbar active={activeHeading} setOpen={setOpen} />

              <div className="mx-4">
                <Link
                  to={isSeller ? "/dashboard" : "/shop-create"}
                  onClick={() => setOpen(false)}
                  className="
                  group
                  flex items-center justify-between
                  bg-gradient-to-r from-black to-gray-800
                  hover:from-gray-900 hover:to-black
                  text-white
                  px-5 py-3
                  rounded-lg
                  shadow-md hover:shadow-xl
                  transition-all duration-300
                  transform hover:scale-[1.02]
                "
                >
                  <span className="font-medium text-[15px] tracking-wide">
                    {isSeller ? "Go to Dashboard" : "Become a Seller"}
                  </span>

                  <IoIosArrowForward
                    className="
                    ml-2
                    transition-transform duration-300
                    group-hover:translate-x-1
                  "
                    size={18}
                  />
                </Link>
              </div>

              <div className="flex w-full justify-evenly mt-6 pb-6">
                {isAuthenticated && user ? (
                  <div className="flex flex-col items-center gap-3">
                    <Link to="/profile" onClick={() => setOpen(false)}>
                      <img
                        src={avatarSrc}
                        alt="User"
                        className="w-[80px] h-[80px] rounded-full object-cover border-[3px] border-[#0cac88]"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150?text=User";
                        }}
                      />
                    </Link>
                    <button
                      onClick={logoutHandler}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      <FiLogOut size={20} />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-6">
                    <Link
                      to="/login"
                      className="text-lg text-[#000000b7] hover:text-[#17dd1f] transition"
                      onClick={() => setOpen(false)}
                    >
                      Login
                    </Link>
                    <span className="text-lg text-[#000000b7]">/</span>
                    <Link
                      to="/sign-up"
                      className="text-lg text-[#000000b7] hover:text-[#17dd1f] transition"
                      onClick={() => setOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;