require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./modules/auth/auth.route.js");
const userRoutes = require("./modules/users/user.route.js");
const conversationRoutes = require("./modules/conversations/conversation.route.js");
const messageRoutes = require("./modules/messages/message.route.js");
const uploadRoutes = require("./modules/upload/upload.route.js");
const relationshipRoutes = require("./modules/relationship/relationship.route.js");

const { errorHandler, notFoundHandler } = require("./middlewares/error.middleware.js");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/relationships", relationshipRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
