import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http"; //module core có sẵn của Node.js, để tạo HTTP server
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import { chatSocket } from "./sockets/chat.socket.js";
import redisClient, { connectRedis } from "./utils/redis.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express(); // khởi tạo app Express
const server = http.createServer(app); // tạo HTTP server
const io = new Server(server, { cors: { origin: "*" } }); // tạo socket.io chạy trên HTTP server, cho phép tất cả nguồn (origin) kết nối

// middleware
app.use(express.json()); // parse JSON body của request
app.use(express.urlencoded({ extended: true })); // parse form-urlencoded
app.use(cors()); // cho phép tất cả các nguồn (origin) truy cập API
app.use(cookieParser()); // parse cookie từ request

// routes
app.use("/api/auth", authRoutes);

// sockets
chatSocket(io);

// PORT
const port = process.env.PORT || 8080;

// =====================================
// START SERVER SEQUENCE
// =====================================

(async () => {
    try {
        console.log("🚀 Starting Chatbox API Server...");

        // 1. Connect to Redis
        await connectRedis();

        // 2. Connect to MongoDB
        await connectDB(); // ⚠️ BẮT BUỘC await

        // 3. Start HTTP + Socket.io server
        server.listen(port, () => {
            console.log(`✅ Server is running on port ${port}`);
        });
    } catch (err) {
        console.error("❌ Error starting server:", err);
        process.exit(1);
    }
})();
