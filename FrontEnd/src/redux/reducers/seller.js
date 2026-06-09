import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  isSeller: false,
  isLoading: true,
  seller: null,
  error: null,
};

export const sellerReducer = createReducer(initialState, (builder) => {
  builder

    // ================= LOAD SELLER =================
    .addCase("LoadSellerRequest", (state) => {
      state.isLoading = true;
    })

    .addCase("LoadSellerSuccess", (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.isSeller = true;
      state.seller = action.payload;
      state.error = null;
    })

    .addCase("LoadSellerFail", (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.isSeller = false;
      state.seller = null;
      state.error = action.payload;
    })

    // ================= LOGIN SELLER =================
    .addCase("SellerLoginRequest", (state) => {
      state.isLoading = true;
    })

    .addCase("SellerLoginSuccess", (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.isSeller = true;
      state.seller = action.payload;
      state.error = null;
    })

    .addCase("SellerLoginFail", (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.isSeller = false;
      state.seller = null;
      state.error = action.payload;
    })

    // ================= LOGOUT SELLER =================
    .addCase("SellerLogout", (state) => {
      state.isAuthenticated = false;
      state.isSeller = false;
      state.seller = null;
      state.error = null;
    })
    // get all sellers -- admin
    .addCase("getAllSellersRequest", (state) => {
      state.isLoading = true;
    })

    .addCase("getAllSellersSuccess", (state, action) => {
      state.isLoading = false;
      state.sellers = action.payload;
      state.error = null;
    })

    .addCase("getAllSellersFailed", (state, action) => {
      state.isLoading = false;
      state.sellers = [];
      state.error = action.payload;
    })

    // ================= CLEAR ERRORS =================
    .addCase("clearErrors", (state) => {
      state.error = null;
    });
});
