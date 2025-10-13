import User from "../models/user.model.js";

// lấy thông tin người dùng
export const getProfile = async (req, res) => {
    try {
        //req.user lấy từ verifyToken
        const userId = req.user.userId;

        //tìm user trong db
        const user = await User.findById(userId).select("-passwordHash");

        //validate
        if (!user) {
            return res.status(401).json({
                message: "User not found",
                idCode: 1,
            });
        }

        return res.status(200).json({
            message: "Get user profile successfully!",
            idCode: 0,
            user,
        });
    } catch (error) {
        console.log("getProfile error:", error);
        return res.status(500).json({
            message: "Internal server error",
            idCode: 3,
        });
    }
};

// cập nhật hồ sơ
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { username, bio, avatar } = req.body;

        //tìm user
        const user = await User.findById(userId).select("-passwordHash"); //có thể sử dụng findbyIdAndUpdate để tối ưu truy vấn nếu dự án lớn
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                idCode: 1,
            });
        }

        // Gán giá trị mới
        if (username) user.username = username;
        if (bio) user.bio = bio;
        if (avatar) user.avatarUrl = avatar;

        await user.save();

        //trả kết quả
        return res.status(200).json({
            message: "Update profile successfully",
            idCode: 0,
            user,
        });
    } catch (error) {
        console.log("updateProfile error:", error);
        return res.status(500).json({
            message: "Internal error server",
            idCode: 3,
        });
    }
};
