import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND_URL || "http://localhost:8383/api",
  timeout: 5000,
  withCredentials: true,
});

// 👉 axios riêng để gọi refresh (tránh loop interceptor)
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND_URL || "http://localhost:8383/api",
  timeout: 5000,
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue = [];

const syncAuthAfterRefresh = async (token) => {
  const [{ store }, { syncAccessToken }] = await Promise.all([
    import("@/store/store"),
    import("@/store/authSlice"),
  ]);

  store.dispatch(syncAccessToken(token));
};

// xử lý queue
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

// ================= REQUEST =================
instance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE =================
instance.interceptors.response.use(
  (response) => response.data.data,
  async (error) => {
    const originalRequest = error.config;

    // ================= CASE: có response =================
    if (error.response) {
      const { status, data } = error.response;

      // ====== HANDLE 401 (token expired) ======
      if (status === 401 && !originalRequest._retry && !originalRequest.skipAuthRefresh) {
        originalRequest._retry = true;

        // Nếu đang refresh → queue lại
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
          // 👉 gọi refresh token
          const res = await refreshClient.post("/auth/refresh-token");

          const newAccessToken = res.data.data.accessToken;

          if (!newAccessToken) {
            throw new Error("Không lấy được Access Token mới từ API");
          }

          // lưu token mới
          localStorage.setItem("accessToken", newAccessToken);
          await syncAuthAfterRefresh(newAccessToken);

          // chạy lại các request đang chờ
          processQueue(null, newAccessToken);

          // retry request cũ
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // refresh fail → clear auth
          processQueue(refreshError, null);

          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          await syncAuthAfterRefresh(null);

          return Promise.reject({
            status: 401,
            message: "Phiên đăng nhập đã hết hạn",
          });
        } finally {
          isRefreshing = false;
        }
      }

      // ====== các lỗi khác ======
      return Promise.reject({
        status,
        message: data?.message || "Có lỗi xảy ra từ server",
      });
    }

    // ================= NETWORK ERROR =================
    if (error.request) {
      return Promise.reject({
        status: 0,
        message: "Không thể kết nối tới server. Hãy kiểm tra lại kết nối internet",
        idCode: -2,
      });
    }

    // ================= UNKNOWN =================
    return Promise.reject({
      status: -1,
      message: error.message || "Lỗi không xác định",
      idCode: -3,
    });
  }
);

export default instance;
