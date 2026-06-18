const notFoundHandler = (_req, res) => {
  res.status(404).json({ message: "Route not found" });
};

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  console.error("💥 ERROR INTERCEPTED:", error);

  if (statusCode === 500) {
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi hệ thống xảy ra, vui lòng thử lại sau!",
    });
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || "Đã xảy ra lỗi",
  });
};

module.exports = { notFoundHandler, errorHandler };
