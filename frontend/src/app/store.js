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
import storage from "redux-persist/lib/storage"; // Sử dụng localStorage

// Import các slice
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/user/userSlice";
import conversationsReducer from "../features/conversations/conversationsSlice";
import messagesReducer from "../features/chat/messagesSlice";

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
  whitelist: ["auth", "conversations", "messages"], // ✅ Chỉ lưu những slice cần thiết
  blacklist: ["user"], // ❌ Không cần lưu danh sách user search
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
