import express from "express";
import { verifyToken } from "../../middlewares/middleware.controller.js";
import { upload } from "../../config/multer.js";
import { uploadFile } from "./upload.controller.js";

const router = express.Router();

// Upload file/image
// Multer middleware: single('file') - field name là 'file'
router.post("/", verifyToken, upload.single("file"), uploadFile);

export default router;
