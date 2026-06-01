import axios from "axios";
import { server } from "../../server";


// create product action

export const createProduct = (newForm) => async (dispatch) => {
    try {
        dispatch({
            type: "productCreateRequest",
        });
        const config = { headers: { "Content-Type": "multipart/form-data" }, };

        const { data } = await axios.post(
            `${server}/product/create-product`,
            newForm,
            config
        );

        dispatch({
            type: "productCreateSuccess",
            payload: data.product,
        })
    } catch (error) {
        dispatch({
            type: "productCreateFail",
            payload: error.response.data.message,
        });
    }
};

// get all products of shop

export const getAllProductsShop = (id) => async (dispatch) => {
    try {
        dispatch({
            type: "getAllProductsShopRequest",
        });
        const { data } = await axios.get(
            `${server}/product/get-all-products-shop/${id}`
        );
        dispatch({
            type: "getAllProductsShopSuccess",
            payload: data.products,
        });
    } catch (error) {
        dispatch({
            type: "getAllProductsShopFailed",
            payload: error.response.data.message,
        });
    }
}

// delete product of shop
export const deleteProduct = (id) => async (dispatch) => {
    try {
        dispatch({
            type: "deleteProductRequest",
        });
        const { data } = await axios.delete(
            `${server}/product/delete-shop-product/${id}`,
            { withCredentials: true }
        );

        dispatch({
            type: "deleteProductSuccess",
            payload: data.message,
        });
    } catch (error) {
        dispatch({
            type: "deleteProductFailed",
            payload: error.response.data.message,
        });
    }
};

// GET ALL PRODUCTS (PUBLIC)
export const getAllProducts = () => async (dispatch) => {
    try {
        dispatch({
            type: "getAllProductsRequest",
        });

        const { data } = await axios.get(
            `${server}/product/get-all-products`
        );

        dispatch({
            type: "getAllProductsSuccess",
            payload: data.products,
        });
    } catch (error) {
        dispatch({
            type: "getAllProductsFailed",
            payload: error.response.data.message,
        });
    }
};

export const getSingleProduct = (id) => async (dispatch) => {
    try {
        dispatch({ type: "getSingleProductRequest" });

        const { data } = await axios.get(
            `${server}/product/get-product/${id}`
        );

        dispatch({
            type: "getSingleProductSuccess",
            payload: data.product,
        });

    } catch (error) {
        dispatch({
            type: "getSingleProductFailed",
            payload: error.response.data.message,
        });
    }
};
