import axios from "axios";

// Tạo instance của axios với cấu hình(config) mặc định (baseURL, timeout, headers, ...)
export const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BACKEND_URL, //url gốc của backend
    timeout: 5000, // Thời gian tối đa (ms) chờ phản hồi, quá thì hủy request, trả về lỗi
});

// Add accessToken vào header trước khi request được gửi đi
instance.interceptors.request.use(
    (config) => {
        // Lấy accessToken từ localStorage
        const accessToken = localStorage.getItem("accessToken");

        // Nếu có accessToken thì thêm vào header Authorization
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Trả về config đã chỉnh sửa để request tiếp tục
        return config;
    },
    // Nếu lỗi khi tạo config thì reject để axios báo lỗi
    (error) => Promise.reject(error)
);
