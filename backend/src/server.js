import "./config/loadEnv.js";
import express from "express";
import cors from "cors";
import http from "http"; //module core có sẵn của Node.js, để tạo HTTP server
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { chatSocket } from "./sockets/chat.socket.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import conversationRoutes from "./routes/conversation.route.js";
import messageRoutes from "./routes/message.route.js";
import { initSocket } from "./socket.js";

connectDB();

const app = express(); // khởi tạo app Express
const server = http.createServer(app); // tạo HTTP server
const io = initSocket(server); // Khởi tạo Socket.IO

// middleware
app.use(express.json()); // parse JSON body của request
app.use(express.urlencoded({ extended: true })); // parse form-urlencoded
app.use(cors()); // cho phép tất cả các nguồn (origin) truy cập API
app.use(cookieParser()); // parse cookie từ request

// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// sockets
chatSocket(io);

// PORT
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
