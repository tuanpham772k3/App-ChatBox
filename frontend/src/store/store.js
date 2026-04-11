import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import conversationsReducer from "./conversationsSlice";
import messagesReducer from "./messagesSlice";

// Gộp các reducer lại
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    conversations: conversationsReducer,
    messages: messagesReducer,
  },
});
