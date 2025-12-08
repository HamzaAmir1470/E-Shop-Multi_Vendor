import { createReducer } from "@reduxjs/toolkit";

const initialState = {
    isSeller: false,
    loading: false,
    seller: null,
    error: null,
};

export const SellerReducer = createReducer(initialState, (builder) => {
    builder
        .addCase("LoadSellerRequest", (state) => {
            state.loading = true;
        })
        .addCase("LoadSellerSuccess", (state, action) => {
            state.loading = false;
            state.isSeller = true;
            state.seller = action.payload;   // FIXED
        })
        .addCase("LoadSellerFailure", (state, action) => {
            state.loading = false;
            state.isSeller = false;
            state.seller = null;
            state.error = action.payload;
        })
        .addCase("ClearErrors", (state) => {
            state.error = null;
        });
});
