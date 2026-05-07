import { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { IoBagHandleOutline } from "react-icons/io5";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { backend_url } from "../../server";
import { addToCart, removeFromCart }
  from "../../redux/actions/cart";
import { toast } from "react-toastify";

const Cart = ({ setOpenCart }) => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const handleRemoveFromCart = (data) => {
    dispatch(removeFromCart(data));
  };

  const totalPrice = cart.reduce((total, item) => total + item.discountPrice * (item.qty || 1), 0);

  const quantityChangeHandler = (data) => {
    dispatch(addToCart(data));
  }

  return (
    /* BACKDROP */
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end"
      onClick={() => setOpenCart(false)}
    >
      {/* CART PANEL - Responsive sizing */}
      <div
        className="w-full sm:w-[380px] md:w-[420px] lg:w-[28%] min-w-[280px] sm:min-w-[330px] h-full bg-white shadow-xl flex flex-col rounded-l-xl sm:rounded-l-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
      >

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <IoBagHandleOutline size={22} sm:size={25} className="text-gray-700" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">
              {cart?.length || 0} Items in Cart
            </h2>
          </div>

          <RxCross1
            onClick={() => setOpenCart(false)}
            size={24}
            className="cursor-pointer hover:text-red-500 transition"
          />
        </div>

        {/* ITEMS */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {cart && cart.length > 0 ? (
            cart.map((item) => (
              <CartItem key={item._id} data={item} quantityChangeHandler={quantityChangeHandler} removeFromCart={handleRemoveFromCart} />
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">Your cart is empty</p>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-6 border-t bg-white shadow-inner">
          <Link to="/checkout" onClick={() => setOpenCart(false)}>
            <button className="w-full h-[48px] sm:h-[56px] bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl text-[16px] sm:text-[18px] font-semibold tracking-wide shadow-lg hover:shadow-xl transition-all duration-200">
              Checkout Now (USD ${totalPrice.toFixed(2)})
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
};


const CartItem = ({ data, quantityChangeHandler, removeFromCart }) => {
  const [qty, setQty] = useState(data.qty || 1);

  // Sync local state with Redux state when it changes
  useEffect(() => {
    setQty(data.qty || 1);
  }, [data.qty]);

  const increment = (e, data) => {
    e.stopPropagation(); // Add this to prevent event bubbling
    if (data.stock < qty + 1) {
      toast.error("Product stock limited!")
    } else {
      const newQty = qty + 1;
      setQty(newQty);
      const updateCartData = { ...data, qty: newQty };
      quantityChangeHandler(updateCartData);
    }
  }

  const decrement = (e, data) => {
    e.stopPropagation(); // Add this to prevent event bubbling
    const newQty = qty === 1 ? 1 : qty - 1;
    setQty(newQty);
    const updateCartData = { ...data, qty: newQty };
    quantityChangeHandler(updateCartData);
  }

  const handleRemove = (e, data) => {
    e.stopPropagation(); // Add this to prevent event bubbling
    removeFromCart(data);
  }

  // Calculate total price for this item
  const total = data.discountPrice * qty;

  return (
    <div className="flex items-center gap-2 sm:gap-4 border rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition relative">

      {/* REMOVE BUTTON - Added for small screens */}
      <RxCross1
        size={18}
        onClick={(e) => handleRemove(e, data)}
        className="absolute top-2 right-2 sm:hidden cursor-pointer hover:text-red-500 transition z-10"
      />

      {/* QUANTITY - Made more compact on mobile */}
      <div className="flex flex-col items-center gap-1 sm:gap-2">
        <button
          className="w-[24px] sm:w-[28px] h-[24px] sm:h-[28px] bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition"
          onClick={(e) => increment(e, data)}
        >
          <HiPlus size={14} sm:size={16} />
        </button>

        <span className="text-[14px] sm:text-[16px] font-semibold text-gray-700">
          {qty}
        </span>

        <button
          className="w-[24px] sm:w-[28px] h-[24px] sm:h-[28px] bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition"
          onClick={(e) => decrement(e, data)}
        >
          <HiOutlineMinus size={12} sm:size={16} className="text-gray-700" />
        </button>
      </div>

      {/* IMAGE - Smaller on mobile */}
      <img
        src={`${backend_url}/${data?.images?.[0] || ''}`}
        alt="Product"
        className="w-[60px] sm:w-[80px] h-[60px] sm:h-[80px] rounded-lg object-cover shadow-sm"
      />

      {/* INFO - Compact on mobile */}
      <div className="flex-1 pr-6 sm:pr-0">
        <h3 className="text-[13px] sm:text-[15px] font-semibold text-gray-800 leading-tight sm:leading-[18px] line-clamp-2">
          {data.name}
        </h3>

        <p className="text-[12px] sm:text-[14px] text-gray-600 mt-1">
          ${data.discountPrice} × {qty}
        </p>

        <p className="text-[14px] sm:text-[16px] font-bold text-red-500">
          USD ${total.toFixed(2)}
        </p>
      </div>

      {/* REMOVE BUTTON - Hidden on mobile, visible on larger screens */}
      <RxCross1
        size={20}
        onClick={(e) => handleRemove(e, data)}
        className="hidden sm:block cursor-pointer hover:text-red-500 transition"
      />
    </div>
  );
};

export default Cart;