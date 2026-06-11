import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  loading: true,
  Usersloading: true,
  addressloading: false,
  user: null,
  error: null,
};

export const userReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("LoadUserRequest", (state) => {
      state.loading = true;
    })
    .addCase("LoadUserSuccess", (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    })
    .addCase("LoadUserFail", (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    })
    .addCase("clearErrors", (state) => {
      state.error = null;
    })
    // update profile
    .addCase("updateUserInfoRequest", (state) => {
      state.loading = true;
    })
    .addCase("updateUserInfoSuccess", (state, action) => {
      state.loading = false;
      state.user = action.payload;
    })
    .addCase("updateUserInfoFailed", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // update user address
    .addCase("updateUserAddressRequest", (state) => {
      state.addressloading = true;
    })
    .addCase("updateUserAddressSuccess", (state, action) => {
      state.addressloading = false;
      state.user = action.payload;
    })
    .addCase("updateUserAddressFailed", (state, action) => {
      state.addressloading = false;
      state.error = action.payload;
    })
    // delete user address
    .addCase("deleteUserAddressRequest", (state) => {
      state.addressloading = true;
    })
    .addCase("deleteUserAddressSuccess", (state, action) => {
      state.addressloading = false;
      state.successMessage = action.payload.successMessage;
      state.user = action.payload;
    })
    .addCase("deleteUserAddressFailed", (state, action) => {
      state.addressloading = false;
      state.error = action.payload;
    })

    // get all users --admin
    .addCase("getAllUsersRequest", (state) => {
      state.Usersloading = true;
    })
    .addCase("getAllUsersSuccess", (state, action) => {
      state.Usersloading = false;
      state.users = action.payload;
    })
    .addCase("getAllUsersFailed", (state, action) => {
      state.Usersloading = false;
      state.error = action.payload;
    });

});
