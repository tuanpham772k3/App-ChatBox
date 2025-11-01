import User from "../models/user.model.js";

/**
 * @param {string} userId - ID của người dùng hiện tại
 * @param {string} q - keyword người dùng nhập vào
 * @returns {object} - Trả về danh sách người dùng
 */
export const searchUserService = async (q, userId) => {
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

  //Trả về danh sách người dùng
  return users;
};
