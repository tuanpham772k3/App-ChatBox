import instance from "@/lib/axios";

const userApi = {
  /**
   * Lấy thông tin hồ sơ người dùng hiện tại
   * GET /user/profile
   */
  getProfile: async () => {
    const res = await instance.get("/user/profile");
    return res.data;
  },

  /**
   * Cập nhật hồ sơ người dùng
   * PUT /user/profile
   */
  updateProfile: async (formData) => {
    const res = await instance.put("/user/profile", formData);
    return res.data;
  },

  /**
   * Tìm kiếm hoặc gợi ý người dùng
   * GET /user/search?keyword=
   */
  searchUsersApi: async (keyword) => {
    const res = await instance.get("/user/search", {
      params: { keyword },
    });
    return res.data;
  },
};

export default userApi;
