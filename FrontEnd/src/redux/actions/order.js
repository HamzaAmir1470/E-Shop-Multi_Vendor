import axios from "axios";
import { server } from "../../server";

// GET ALL ORDERS OF USER
export const getAllOrdersUser = (userId) => async (dispatch) => {
    try {
        dispatch({ type: "getAllOrdersUser" });
        const { data } = await axios.get(`${server}/order/get-all-orders/${userId}`, {
            withCredentials: true,
        });
        dispatch({ type: "getAllOrdersUserSuccess", payload: data.orders });
    } catch (error) {
        dispatch({ type: "getAllOrdersUserFailed", payload: error.response.data.message });
    }
};
// GET ALL ORDERS OF Shop
export const getAllOrdersShop = (shopId) => async (dispatch) => {
    try {
        dispatch({ type: "getAllOrdersShop" });
        const { data } = await axios.get(`${server}/order/get-seller-all-orders/${shopId}`, {
            withCredentials: true,
        });
        dispatch({ type: "getAllOrdersShopSuccess", payload: data.orders });
    } catch (error) {
        dispatch({ type: "getAllOrdersShopFailed", payload: error.response.data.message });
    }
};

// CLEAR FLAGS
export const clearOrderCreated = () => async (dispatch) => {
    dispatch({ type: "clearOrderCreated" });
};

export const clearOrderDeleted = () => async (dispatch) => {
    dispatch({ type: "clearOrderDeleted" });
};

export const clearErrors = () => async (dispatch) => {
    dispatch({ type: "clearErrors" });
};