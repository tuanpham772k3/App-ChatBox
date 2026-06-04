const User = require("./user.model.js");

const UserService = {
  /**
   * @param {string} userId - ID của người dùng hiện tại
   * @param {string} keyword - keyword người dùng nhập vào
   * @returns {object} - Trả về kết quả tìm kiếm
   */
  getUsers: async (keyword, userId) => {
    // Nếu không có keyword → trả về danh sách gợi ý (mới hoạt động gần đây)
    if (!keyword || keyword.trim() === "") {
      const suggestedUsers = await User.find({ _id: { $ne: userId } })
        .select("_id username avatar bio lastActiveAt")
        .sort({ lastActiveAt: -1 }) // user hoạt động gần nhất trước
        .limit(20);

      return suggestedUsers;
    }

    // Tìm kiếm theo tên, không phân biệt hoa thường
    const regex = new RegExp(keyword.trim(), "i");

    const searchedUsers = await User.find({
      _id: { $ne: userId },
      username: regex,
    })
      .select("_id username avatar bio lastActiveAt")
      .sort({ lastActiveAt: -1 })
      .limit(10);

    return searchedUsers;
  },
};

module.exports = UserService;
