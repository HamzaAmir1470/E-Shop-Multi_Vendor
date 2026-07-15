import React from "react";
import { RxCross1 } from "react-icons/rx";
import styles from "../../styles/styles";
import { BsCartPlus } from "react-icons/bs";
import { AiOutlineHeart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { removeFromWishlist } from "../../redux/actions/wishlist";
import { addToCart } from "../../redux/actions/cart";
import { toast } from "react-toastify";
import { resolveAssetUrl } from "../../server";
import { Link } from "react-router-dom";

const Wishlist = ({ setOpenWishlist }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const handleRemoveFromWishlist = (e, data) => {
    e.stopPropagation();
    dispatch(removeFromWishlist(data));
    toast.success("Item removed from wishlist!");
  };

  const handleAddToCart = (e, data) => {
    e.stopPropagation();

    // Check if item already in cart
    const isItemExist = cart?.find((item) => item._id === data._id);
    if (isItemExist) {
      toast.error("Item already in cart!");
      return;
    }

    // Check stock
    if (data.stock < 1) {
      toast.error("Product out of stock!");
      return;
    }

    // Add to cart with quantity 1
    const cartData = { ...data, qty: 1 };
    dispatch(addToCart(cartData));
    toast.success("Item added to cart!");
    setOpenWishlist(false);
  };

  return (
    /* BACKDROP */
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-150 flex justify-end"
      onClick={() => setOpenWishlist(false)}
    >
      {/* WISHLIST PANEL */}
      <div
        className="w-full sm:w-[25%] min-w-[320px] h-full bg-white flex flex-col justify-between shadow-xl rounded-l-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* CLOSE ICON */}
          <div className="flex w-full justify-end pt-5 pr-5">
            <RxCross1
              size={26}
              className="cursor-pointer hover:text-red-500 transition"
              onClick={(e) => {
                e.stopPropagation();
                setOpenWishlist(false);
              }}
            />
          </div>

          {/* HEADER */}
          <div className={`${styles.normalFlex} p-4 border-b`}>
            <AiOutlineHeart size={26} className="text-red-500" />
            <h5 className="pl-3 text-[20px] font-semibold">
              {wishlist?.length || 0} {wishlist?.length === 1 ? 'Item' : 'Items'}
            </h5>
          </div>

          {/* ITEMS */}
          <div className="w-full max-h-[calc(100vh-200px)] overflow-y-auto">
            {wishlist && wishlist.length > 0 ? (
              wishlist.map((item, index) => (
                <WishlistItem
                  key={item._id || index}
                  data={item}
                  handleRemoveFromWishlist={handleRemoveFromWishlist}
                  handleAddToCart={handleAddToCart}
                  setOpenWishlist={setOpenWishlist}
                />
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                Your wishlist is empty
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const WishlistItem = ({ data, handleRemoveFromWishlist, handleAddToCart, setOpenWishlist }) => {
  // Create a product slug from the name for the URL
  const productName = data?.name || "product";

  const handleProductClick = () => {
    setOpenWishlist(false); // Close wishlist when navigating to product
  };

  return (
    <div className="border-b p-4 hover:bg-gray-50 transition">
      <div className="w-full flex items-center gap-4">

        {/* REMOVE BUTTON */}
        <button
          className="text-gray-500 hover:text-red-500 transition"
          onClick={(e) => handleRemoveFromWishlist(e, data)}
        >
          <RxCross1 size={20} />
        </button>

        {/* PRODUCT IMAGE - Clickable */}
        <Link
          to={`/product/${productName}`}
          onClick={handleProductClick}
          className="block"
        >
          <img
            src={resolveAssetUrl(data?.images?.[0]) || 'https://via.placeholder.com/85'}
            alt={data?.name || "Product"}
            className="w-20 h-20 rounded-md shadow-sm object-cover hover:opacity-80 transition-opacity"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/85";
            }}
          />
        </Link>

        {/* PRODUCT INFO - Name is clickable */}
        <div className="flex flex-col flex-1">
          <Link
            to={`/product/${productName}`}
            onClick={handleProductClick}
            className="hover:text-blue-600 transition-colors"
          >
            <h1 className="text-[15px] font-semibold leading-5 text-gray-900 line-clamp-2">
              {data?.name || "Product"}
            </h1>
          </Link>

          <h4 className="font-medium text-[17px] pt-1.5 text-[#d02222]">
            USD ${data?.discountPrice || data?.price || 0}
          </h4>

          {data?.stock < 1 && (
            <p className="text-xs text-red-500 mt-1">Out of stock</p>
          )}
        </div>

        {/* ADD TO CART BUTTON */}
        <button
          onClick={(e) => handleAddToCart(e, data)}
          disabled={data?.stock < 1}
          className={`${data?.stock < 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-green-600'}`}
          title={data?.stock < 1 ? "Out of stock" : "Add to Cart"}
        >
          <BsCartPlus
            size={24}
            className="text-gray-700 transition"
          />
        </button>
      </div>
    </div>
  );
};

export default Wishlist;