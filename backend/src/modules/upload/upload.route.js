const express = require("express");
const { verifyToken } = require("../../middlewares/authMiddleware.js");
const { upload } = require("../../config/multer.js");
const { uploadFile } = require("./upload.controller.js");

const router = express.Router();

// Upload file/image
// Multer middleware: single('file') - field name là 'file'
router.post("/", verifyToken, upload.single("file"), uploadFile);

module.exports = router;
