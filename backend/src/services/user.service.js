import User from "../models/user.model.js";

/**
 * @param {string} userId - ID của người dùng hiện tại
 * @param {string} q - keyword người dùng nhập vào
 * @returns {object} - Trả về kết quả tìm kiếm
 */
export const searchUserService = async (q, userId) => {
  try {
    // 1. Nếu người dùng không nhập gì → trả về mảng rỗng
    if (!q || q.trim() === "") return [];

    // 2. Tạo regex không phân biệt hoa thường
    const regex = new RegExp(q, "i");

    // 3. Tìm người dùng
    const users = await User.find({
      _id: { $ne: userId }, //Loại chính mình
      username: regex,
    })
      .select("_id username avatarUrl bio lastActiveAt")
      .sort({ lastActiveAt: -1 })
      .limit(10);

    //Trả về kết quả tìm kiếm
    return users;
  } catch (error) {
    console.log("Error in getAllUsersService service", error);
    throw error;
  }
};

/**
 * @param {string} userId - ID của người dùng
 * @returns {object} - Trả về danh sách người dùng
 */
export const getAllUsersService = async (userId) => {
  try {
    const users = await User.find({
      _id: { $ne: userId }, // loại bỏ chính mình
    })
      .select("_id username avatarUrl bio lastActiveAt")
      .sort({ lastActiveAt: -1 }) // người hoạt động gần nhất lên đầu
      .limit(50); // tránh load quá nhiều user cùng lúc

    // Trả về danh sách người dùng
    return users;
  } catch (error) {
    console.log("Error in getAllUsersService service", error);
    throw error;
  }
};
