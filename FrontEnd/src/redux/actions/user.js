import axios from "axios";
import { server } from "../../server.js";

// Helper to extract safe error message
const getErrorMessage = (error) => {
    return (
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong"
    );
};

// Load User
export const loadUser = () => async (dispatch) => {
    try {
        dispatch({ type: "LoadUserRequest" });

        const { data } = await axios.get(`${server}/user/getuser`, {
            withCredentials: true,
        });

        dispatch({ type: "LoadUserSuccess", payload: data.user });
    } catch (error) {
        dispatch({
            type: "LoadUserFail",
            payload: getErrorMessage(error),
        });
    }
};

// Load Seller
export const loadSeller = () => async (dispatch) => {
    try {
        dispatch({ type: "LoadSellerRequest" });

        const { data } = await axios.get(`${server}/shop/getSeller`, {
            withCredentials: true,
        });

        dispatch({ type: "LoadSellerSuccess", payload: data.seller });
    } catch (error) {
        dispatch({
            type: "LoadSellerFail",
            payload: getErrorMessage(error),
        });
    }
};

// Update User Info
export const updateUserInformation =
    ({ name, email, phoneNumber, password }) =>
        async (dispatch) => {
            try {
                dispatch({ type: "updateUserInfoRequest" });

                const { data } = await axios.put(
                    `${server}/user/update-user-info`,
                    { name, email, phoneNumber, password },
                    { withCredentials: true }
                );

                dispatch({
                    type: "updateUserInfoSuccess",
                    payload: data.user,
                });
            } catch (error) {
                dispatch({
                    type: "updateUserInfoFailed",
                    payload: getErrorMessage(error),
                });
            }
        };


// update User information
export const updateUserAddress =
    ({ country, city, address1, address2, zipCode, addressType }) =>
        async (dispatch) => {
            try {
                dispatch({ type: "updateUserAddressRequest" });

                const { data } = await axios.put(
                    `${server}/user/update-user-address`,
                    { country, city, address1, address2, zipCode, addressType },
                    { withCredentials: true }
                );

                dispatch({
                    type: "updateUserAddressSuccess",
                    payload: data.user,
                });
            } catch (error) {
                dispatch({
                    type: "updateUserAddressFailed",
                    payload: getErrorMessage(error),
                });
            }
        };
// delte user address
export const deleteUserAddress = (addressId) => async (dispatch) => {
    try {
        dispatch({ type: "deleteUserAddressRequest" });
        const { data } = await axios.delete(
            `${server}/user/delete-user-address/${addressId}`,
            { withCredentials: true }
        );
        dispatch({
            type: "deleteUserAddressSuccess",
            payload: {
                successMessage: data.message,
                user: data.user,
            },
        });
    } catch (error) {
        dispatch({
            type: "deleteUserAddressFailed",
            payload: getErrorMessage(error),
        });
    }
};
// Clear Errors
export const clearErrors = () => (dispatch) => {
    dispatch({ type: "clearErrors" });
};