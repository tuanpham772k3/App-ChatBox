const http = require("http");
const app = require("./app.js");
const { connectDB } = require("./config/db.js");
const { initSocket } = require("./socket.js");
const { registerSocket } = require("./sockets/registerSocket.js");

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
