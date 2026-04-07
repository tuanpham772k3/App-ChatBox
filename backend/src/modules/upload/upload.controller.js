import cloudinary from "../../config/cloudinary.js";

/**
 * Upload file/image lên Cloudinary
 * POST /api/upload
 *
 * Flow:
 * 1. Nhận file từ request (multer middleware xử lý trước)
 * 2. Upload file lên Cloudinary
 * 3. Trả về thông tin file (url, public_id, filename, mimeType, size)
 */
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Lấy file từ multer (đã được lưu trong memory)
    const file = req.file;

    if (file.size > 10 * 1024 * 1024) {
      return res
        .status(400)
        .json({ success: false, message: "File size too large. Maximum size is 10MB" });
    }

    const isImage = file.mimetype.startsWith("image/");

    // Upload lên Cloudinary
    // Sử dụng base64 từ buffer
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      {
        folder: "files", // Tổ chức file trong folder
        resource_type: isImage ? "image" : "raw",
      }
    );

    const fileInfo = {
      url: result.secure_url,
      public_id: result.public_id,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: fileInfo,
    });
  } catch (error) {
    return next(error);
  }
};
