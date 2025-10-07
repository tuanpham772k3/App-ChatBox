export const chatSocket = (io) => {
    // Lắng nghe kết nối từ client
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // Lắng nghe dự kiện(chat_message) từ client
        socket.on("chat_message", (msg) => {
            console.log("Message from client:", msg);

            // Phát lại cho tất cả client (kể cả sender)
            io.emit("chat_message", msg);
        });

        // Xử lý ngắt kết nối
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};
