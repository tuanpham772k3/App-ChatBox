import { useEffect, useState } from "react";
import socket from "@/lib/socket";

export const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit("join_room", conversationId);
    socket.on("message:new", (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.emit("leave_room", conversationId);
      socket.off("message:new");
    };
  }, [conversationId]);

  const sendMessage = (content) => {
    socket.emit("message:send", { conversationId, content });
  };

  return { messages, sendMessage };
};
