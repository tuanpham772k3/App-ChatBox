import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();
const server = http.createServer(app); // tao server HTTP để gắn socket.io
const io = new Server(server, { cors: { origin: "*" } }); // bật socket.io với CORS

// middleware
app.use(express.json()); // đọc JSON body từ request

// Kết nối Mongo
connectDB();

// Define a route for the root URL
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// socket demo
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Use the PORT from environment variables or default to 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Chatbox API is running: ${port}`);
});
