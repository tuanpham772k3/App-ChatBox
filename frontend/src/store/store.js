import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./authSlice";
import userReducer from "./userSlice";
import conversationsReducer from "./conversationsSlice";
import messagesReducer from "./messagesSlice";

// Gộp các reducer lại
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  conversations: conversationsReducer,
  messages: messagesReducer,
});

// Cấu hình persist
const persistConfig = {
  key: "root",
  storage, // localStorage
  whitelist: ["auth", "conversations", "messages"], // lưu
  blacklist: ["user"], // Không cần lưu
};

// Gắn persist reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Tạo store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Fix warning redux-persist khi dùng middleware
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Tạo persistor để dùng trong App
export const persistor = persistStore(store);
