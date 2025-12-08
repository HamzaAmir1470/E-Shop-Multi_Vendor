import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/user";
import { cartReducer } from "./reducers/cart";
import { SellerReducer } from "./reducers/seller";

const Store = configureStore({
    reducer: {
        user: userReducer,
        cart: cartReducer,
        seller: SellerReducer,
    },
});

export default Store;