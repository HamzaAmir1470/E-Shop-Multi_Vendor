import axios from "axios";
import { server } from "../../server";

// Create event action
export const createevent = (newForm) => async (dispatch) => {
    try {
        dispatch({
            type: "eventCreateRequest",
        });

        const config = {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            withCredentials: true  // ✅ Add this
        };

        const { data } = await axios.post(
            `${server}/event/create-event`,
            newForm,
            config
        );

        dispatch({
            type: "eventCreateSuccess",
            payload: data.event,
        });

        return data; // ✅ Return for chaining
    } catch (error) {
        dispatch({
            type: "eventCreateFail",
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Get all events of shop
export const getAlleventsShop = (id) => async (dispatch) => {
    try {
        dispatch({
            type: "getAlleventsShopRequest",
        });

        const { data } = await axios.get(
            `${server}/event/get-all-events/${id}`,
            { withCredentials: true }  // ✅ Add this
        );

        dispatch({
            type: "getAlleventsShopSuccess",
            payload: data.events,
        });
    } catch (error) {
        dispatch({
            type: "getAlleventsShopFailed",
            payload: error.response?.data?.message || error.message,
        });
    }
}

// Reset event action
export const resetEventCreate = () => (dispatch) => {
    dispatch({ type: "eventCreateReset" });
};

// Delete event of shop
export const deleteevent = (id) => async (dispatch) => {
    try {
        dispatch({
            type: "deleteeventRequest",
        });

        const { data } = await axios.delete(
            `${server}/event/delete-shop-event/${id}`,
            { withCredentials: true }
        );

        dispatch({
            type: "deleteeventSuccess",
            payload: id,  // ✅ Send id, not message
        });

        return data;
    } catch (error) {
        dispatch({
            type: "deleteeventFailed",
            payload: error.response?.data?.message || error.message,
        });
    }
};

// get all events for home page
export const getAllEvents = () => async (dispatch) => {
    try {
        dispatch({
            type: "getAllevents Request",
        });
        const { data } = await axios.get(
            `${server}/event/get-all-events`,
            { withCredentials: true }
        );
        dispatch({
            type: "getAlleventsSuccess",
            payload: data.events,
        });
    } catch (error) {
        dispatch({
            type: "getAlleventsFailed",
            payload: error.response?.data?.message || error.message,
        });
    }
};