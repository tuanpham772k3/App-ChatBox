import { useEffect, useState } from "react";
import { socket } from "./lib/socket";

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        // Nhận tin nhắn từ server
        socket.on("chat_message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        // cleanup listener khi unmount
        return () => {
            socket.off("chat_message");
        };
    }, []);

    const sendMessage = () => {
        if (input.trim() === "") return;

        // Gửi tin nhắn tới server
        socket.emit("chat_message", input);
        setInput("");
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white rounded-xl shadow">
                <h1 className="text-xl font-bold mb-4">Socket.IO Chat Test</h1>

                <div className="border rounded p-3 h-64 overflow-y-auto mb-4">
                    {messages.map((msg, i) => (
                        <p key={i} className="text-gray-800">
                            {msg}
                        </p>
                    ))}
                </div>

                <div className="flex">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1 border rounded-l px-3 py-2 focus:outline-none"
                        placeholder="Type a message..."
                    />
                    <button onClick={sendMessage} className="bg-blue-600 text-white px-4 rounded-r">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
