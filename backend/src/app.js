import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.route.js";
import userRoutes from "./modules/users/user.route.js";
import conversationRoutes from "./modules/conversations/conversation.route.js";
import messageRoutes from "./modules/messages/message.route.js";
import uploadRoutes from "./modules/upload/upload.route.js";

import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware.js";

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

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
