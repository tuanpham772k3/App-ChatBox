import axios from "axios";
import { store } from "@/store/store";
import { clearState, setAccessToken } from "@/store/authSlice";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND_URL || "http://localhost:8383/api",
  timeout: 5000,
  withCredentials: true,
});

// Instance riêng để gọi refresh token (tránh loop)
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND_URL || "http://localhost:8383/api",
  timeout: 5000,
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue = [];

// Xử lý hàng đợi request khi có token mới hoặc thất bại
const processQueue = (error, token = null) => {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  refreshQueue = [];
};

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

        // Nếu đang trong quá trình refresh -> Đẩy request vào hàng đợi
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshQueue.push({
              resolve: (token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(instance(originalRequest));
              },
              reject: (err) => reject(err),
            });
          });
        }

        isRefreshing = true;

        try {
          // Gọi API refresh token từ instance riêng lẻ
          const res = await refreshClient.post("/auth/refresh-token");

          const newAccessToken = res.data.data;

          if (!newAccessToken) {
            throw new Error("Không lấy được Access Token mới từ API");
          }

          // Cập nhật token mới
          store.dispatch(setAccessToken(newAccessToken));

          // Giải phóng hàng đợi thành công
          processQueue(null, newAccessToken);

          // Thực hiện lại request ban đầu với token mới
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // Dọn dẹp dữ liệu trước khi báo lỗi cho hàng đợi để tránh lỗi đồng bộ giao diện
          processQueue(refreshError, null);

          store.dispatch(clearState());

          return Promise.reject({
            status: 401,
            message: "Phiên đăng nhập đã hết hạn",
          });
        } finally {
          isRefreshing = false;
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
