import { createReducer } from "@reduxjs/toolkit";

const initialState = {
    events: [],        // ✅ Initialize as empty array
    event: null,
    isLoading: false,  // ✅ Start with false, not true
    error: null,
    success: false,
    message: null,
    allEvents: [],     // ✅ For storing all events for home page
};

export const eventReducer = createReducer(initialState, (builder) => {
    builder
        // Create event
        .addCase("eventCreateRequest", (state) => {
            state.isLoading = true;
            state.error = null;
            state.success = false;
        })
        .addCase("eventCreateSuccess", (state, action) => {
            state.isLoading = false;
            state.event = action.payload;
            state.events = [action.payload, ...state.events]; // ✅ Add to events array
            state.success = true;
            state.error = null;
        })
        .addCase("eventCreateFail", (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.success = false;
        })
        .addCase("eventCreateReset", (state) => {
            state.isLoading = false;
            state.success = false;
            state.event = null;
            state.error = null;
        })

        // Get all events of shop
        .addCase("getAlleventsShopRequest", (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase("getAlleventsShopSuccess", (state, action) => {
            state.isLoading = false;
            state.events = action.payload || []; // ✅ Ensure it's an array
            state.success = true;
            state.error = null;
        })
        .addCase("getAlleventsShopFailed", (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.events = []; // ✅ Reset to empty array on error
            state.success = false;
        })

        // Delete event
        .addCase("deleteeventRequest", (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase("deleteeventSuccess", (state, action) => {
            state.isLoading = false;
            state.message = action.payload;
            state.success = true;
            // ✅ Remove deleted event from array
            state.events = state.events.filter(
                (event) => event._id !== action.payload
            );
        })
        .addCase("deleteeventFailed", (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.success = false;
        })
        
        // Get all events 
        .addCase("getAlleventsRequest", (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase("getAlleventsSuccess", (state, action) => {
            state.isLoading = false;
            state.allEvents = action.payload || [];
            state.success = true;
            state.error = null;
        })
        .addCase("getAlleventsFailed", (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.allEvents = [];
            state.success = false;
        })
        // Clear errors
        .addCase("clearErrors", (state) => {
            state.error = null;
        });
});