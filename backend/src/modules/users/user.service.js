const User = require("./user.model.js");

const UserService = {
  /**
   * @param {string} userId - ID của người dùng hiện tại
   * @param {string} keyword - keyword người dùng nhập vào
   * @returns {object} - Trả về kết quả tìm kiếm
   */
  searchUsers: async (keyword, userId) => {
    // 1. Nếu không có keyword → trả về danh sách gợi ý (mới hoạt động gần đây)
    if (!keyword || keyword.trim() === "") {
      const suggestedUsers = await User.find({ _id: { $ne: userId } })
        .select("_id username avatar bio lastActiveAt")
        .sort({ lastActiveAt: -1 }) // user hoạt động gần nhất trước
        .limit(20);

      return suggestedUsers;
    }

    // 2. Tìm kiếm theo tên, không phân biệt hoa thường
    const regex = new RegExp(keyword.trim(), "i");

    // 3. Tìm người dùng
    const searchedUsers = await User.find({
      _id: { $ne: userId }, //Loại chính mình
      username: regex,
    })
      .select("_id username avatar bio lastActiveAt")
      .sort({ lastActiveAt: -1 })
      .limit(10);

    //Trả về kết quả tìm kiếm
    return searchedUsers;
  },
};

module.exports = UserService;
