import jwt from "jsonwebtoken";

// Kiểm tra token
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // kiểm tra đầu vào
    if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "token không hợp lệ hoặc thiếu",
        idCode: 1,
      });
    }

    // cắt token
    const token = authHeader.split(" ")[1];

    // xác thực token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.error("Token verification error:", err.message);
        return res.status(403).json({
          message: "Token không hợp lệ hoặc đã hết hạn",
          idCode: 2,
        });
      }

      // Gắn user vào request để route có thể dùng
      req.user = decoded;
      next();
    });
  } catch (err) {
    // trả lỗi
    console.log("Error in verifyToken: ", err);
    return res.status(500).json({ message: "Interval server error", idCode: 3 });
  }
};
