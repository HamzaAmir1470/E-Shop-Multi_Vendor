import { createReducer } from "@reduxjs/toolkit";

const initialState = {
    isLoading: false,

    // specific flags
    isCreated: false,
    isDeleted: false,

    order: null,
    orders: [],
    adminOrders: [],
    error: null,
};

export const orderReducer = createReducer(initialState, (builder) => {
    builder
        // GET ALL ORDERS OF USER
        .addCase("getAllOrdersUser", (state) => {
            state.isLoading = true;
        })
        .addCase("getAllOrdersUserSuccess", (state, action) => {
            state.isLoading = false;
            state.orders = action.payload;
        })
        .addCase("getAllOrdersUserFailed", (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })

        // get all orders of shop
        .addCase("getAllOrdersShop", (state) => {
            state.isLoading = true;
        })
        .addCase("getAllOrdersShopSuccess", (state, action) => {
            state.isLoading = false;
            state.orders = action.payload;
        })
        .addCase("getAllOrdersShopFailed", (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })

        // get all orders of admin
        .addCase("adminAllOrderRequest", (state) => {
            state.isLoading = true;
        })
        .addCase("adminAllOrderSuccess", (state, action) => {
            state.isLoading = false;
            state.adminOrders = action.payload;
        })
        .addCase("adminAllOrderFailed", (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })

        // CLEAR FLAGS
        .addCase("clearOrderCreated", (state) => {
            state.isCreated = false;
        })
        .addCase("clearOrderDeleted", (state) => {
            state.isDeleted = false;
        })

        // CLEAR ERRORS
        .addCase("clearErrors", (state) => {
            state.error = null;
        });
});
