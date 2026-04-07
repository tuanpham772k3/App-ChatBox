import "./config/loadEnv.js";
import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initSocket } from "./socket.js";
import { registerSocket } from "./sockets/registerSocket.js";
const port = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    const io = initSocket(server);

    registerSocket(io);

    server.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();
