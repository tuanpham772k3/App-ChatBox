import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND_URL || "http://localhost:8383/api",
  timeout: 5000,
});

// Add accessToken vào header trước khi request được gửi đi
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

instance.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    // Có response từ server
    if (error.response) {
      const { status, data } = error.response;

      return Promise.reject({
        status,
        message: data?.message || "Có lỗi xảy ra từ server",
      });
    }

    // Không có response (network / timeout)
    if (error.request) {
      return Promise.reject({
        status: 0,
        message: "Không thể kết nối tới server. Hãy kiểm tra lại kết nối internet",
        idCode: -2,
      });
    }

    // Lỗi config / code
    return Promise.reject({
      status: -1,
      message: error.message || "Lỗi không xác định",
      idCode: -3,
    });
  }
);

export default instance;
