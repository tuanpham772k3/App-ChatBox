import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (
    !authHeader ||
    typeof authHeader !== "string" ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      message: "token không hợp lệ hoặc thiếu",
      idCode: 1,
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err.message);
      return res.status(403).json({
        message: "Token không hợp lệ hoặc đã hết hạn",
        idCode: 2,
      });
    }

    req.user = decoded;
    next();
  });
};
