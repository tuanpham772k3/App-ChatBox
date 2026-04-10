import instance from "@/lib/axios";

const userApi = {
  /**
   * Lấy thông tin hồ sơ người dùng hiện tại
   * GET /user/profile
   */
  getProfile: () => {
    return instance.get("/user/profile");
  },

  /**
   * Cập nhật hồ sơ người dùng
   * PUT /user/profile
   */
  updateProfile: (formData) => {
    return instance.put("/user/profile", formData);
  },

  /**
   * Tìm kiếm hoặc gợi ý người dùng
   * GET /user/search?keyword=
   */
  searchUsers: (keyword) => {
    return instance.get("/user/search", {
      params: { keyword },
    });
  },
};

export default userApi;
