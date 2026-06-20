import instance from "@/lib/axios";

const userApi = {
  /**
   * Lấy thông tin người dùng hiện tại
   * GET /user/profile
   */
  getMe: () => {
    return instance.get("/user/me");
  },

  /**
   * Cập nhật hồ sơ người dùng
   * PUT /user/profile
   */
  updateMyProfile: (formData) => {
    return instance.put("/user/me", formData);
  },

  /**
   * Tìm kiếm hoặc gợi ý người dùng
   * GET /user/search?keyword=
   */
  getUsers: (keyword) => {
    return instance.get("/user", {
      params: { keyword },
    });
  },

  getUserDetail: (id) => {
    return instance.get(`/user/${id}`);
  },
};

export default userApi;
