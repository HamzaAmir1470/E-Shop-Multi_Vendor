import { createReducer } from "@reduxjs/toolkit";

const initialState = {
    isLoading: false,

    // specific flags
    isCreated: false,
    isDeleted: false,

    product: null,
    products: [],
    error: null,
};

export const productReducer = createReducer(initialState, (builder) => {
    builder
        // CREATE PRODUCT
        .addCase("productCreateRequest", (state) => {
            state.isLoading = true;
        })
        .addCase("productCreateSuccess", (state, action) => {
            state.isLoading = false;
            state.product = action.payload;
            state.isCreated = true;
        })
        .addCase("productCreateFail", (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })

        // GET ALL PRODUCTS OF SHOP
        .addCase("getAllProductsShopRequest", (state) => {
            state.isLoading = true;
        })
        .addCase("getAllProductsShopSuccess", (state, action) => {
            state.isLoading = false;
            state.products = action.payload;
        })
        .addCase("getAllProductsShopFailed", (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })

        // GET ALL PRODUCTS (PUBLIC)
        .addCase("getAllProductsRequest", (state) => {
            state.isLoading = true;
        })
        .addCase("getAllProductsSuccess", (state, action) => {
            state.isLoading = false;
            state.products = action.payload;
        })
        .addCase("getAllProductsFailed", (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })

        // GET SINGLE PRODUCT
        .addCase("getSingleProductRequest", (state) => {
            state.isLoading = true;
        })
        .addCase("getSingleProductSuccess", (state, action) => {
            state.isLoading = false;
            state.product = action.payload;
        })
        .addCase("getSingleProductFailed", (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })

        // DELETE PRODUCT
        .addCase("deleteProductRequest", (state) => {
            state.isLoading = true;
        })
        .addCase("deleteProductSuccess", (state, action) => {
            state.isLoading = false;
            state.isDeleted = true;
        })
        .addCase("deleteProductFailed", (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })

        // CLEAR FLAGS
        .addCase("clearProductCreated", (state) => {
            state.isCreated = false;
        })
        .addCase("clearProductDeleted", (state) => {
            state.isDeleted = false;
        })

        // CLEAR ERRORS
        .addCase("clearErrors", (state) => {
            state.error = null;
        });
});
