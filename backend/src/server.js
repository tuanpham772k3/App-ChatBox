const http = require("http");
const app = require("./app.js");
const { connectDB } = require("./config/db.js");
const { initSocket } = require("./sockets/socket.js");

const port = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();
