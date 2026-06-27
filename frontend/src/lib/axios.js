import axios from "axios";
import { store } from "@/store/store";
import { refreshAccessToken } from "./refreshManager";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND_URL || "http://localhost:8383/api",
  timeout: 5000,
  withCredentials: true,
});

// ================= REQUEST INTERCEPTOR =================
instance.interceptors.request.use(
  (config) => {
    const accessToken = store.getState().auth.accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
instance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // 1. Xử lý khi có Response từ Server
    if (error.response) {
      const { status, data } = error.response;

      // Xử lý lỗi 401 hết hạn token
      if (status === 401 && !originalRequest._retry && !originalRequest.skipAuthRefresh) {
        originalRequest._retry = true;

        try {
          const token = await refreshAccessToken();

          // Thực hiện lại request ban đầu với token mới
          originalRequest.headers.Authorization = `Bearer ${token}`;

          return instance(originalRequest);
        } catch (err) {
          return Promise.reject({
            status: 401,
            message: "Phiên đăng nhập đã hết hạn",
          });
        }
      }

      // Xử lý các lỗi HTTP khác (400, 403, 500...)
      return Promise.reject({
        status,
        message: data?.message || "Có lỗi xảy ra từ server",
      });
    }

    // 2. Xử lý lỗi phản hồi chậm từ server và kết nối mạng (Network Error)
    if (error.code === "ECONNABORTED" || error.request) {
      return Promise.reject({
        message: "Máy chủ không phản hồi. Vui lòng kiểm tra lại kết nối internet",
      });
    }

    // 3. Xử lý lỗi không xác định cấu trúc
    return Promise.reject({
      message: error.message || "Lỗi không xác định",
    });
  }
);

export default instance;
