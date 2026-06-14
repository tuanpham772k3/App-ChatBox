import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import conversationsReducer from "./conversationsSlice";
import messagesReducer from "./messagesSlice";
import themeReducer from "./themeSlice";
import relationshipReducer from "./relationshipSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    conversations: conversationsReducer,
    messages: messagesReducer,
    relationship: relationshipReducer,
    theme: themeReducer,
  },
});
