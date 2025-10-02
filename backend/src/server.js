import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http"; //module core có sẵn của Node.js, để tạo HTTP server
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express(); // khởi tạo app Express
const server = http.createServer(app); // tạo HTTP server
const io = new Server(server, { cors: { origin: "*" } }); // tạo socket.io chạy trên HTTP server, cho phép tất cả nguồn (origin) kết nối

// middleware
app.use(express.json()); // parse JSON body của request
app.use(cors()); // cho phép tất cả các nguồn (origin) truy cập API

// Kết nối Mongo
connectDB();

// Define a route for the root URL
app.get("/api", (req, res) => {
    res.send("Hello World!");
});

// socket.io lắng nghe kết nối từ client
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Lắng nghe sự kiện chat_message từ client
    socket.on("chat_message", (msg) => {
        console.log("Message from client:", msg);

        // Phát lại cho tất cả client (kể cả sender)
        io.emit("chat_message", msg);
    });

    // Lắng nghe sự kiện ngắt kết nối
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Lấy port từ biến môi trường hoặc mặc định là 8080
const port = process.env.PORT || 8080;
// Khởi động server
server.listen(port, () => {
    console.log(`Chatbox API + Socket server running on port: ${port}`);
});
