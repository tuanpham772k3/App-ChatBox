import socket from "@/lib/socket";
import { useEffect, useState } from "react";

export const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  // ===Lắng nghe socket events từ server===
  useEffect(() => {
    // Khi có hội thoại mới (VD: được tạo hoặc user được thêm vào group)
    socket.on("conversation:new", (data) => {
      setConversations((prev) => [data, ...prev]);
    });

    // Khi hội thoại có tin nhắn mới (cập nhật last message, unread, v.v.)
    socket.on("conversation:update", (updated) => {
      setConversations((prev) =>
        prev.map((c) => (c._id === updated._id ? { ...c, ...updated } : c))
      );
    });

    // Khi hội thoại bị xoá / user rời nhóm
    socket.on("conversation:delete", (conversationId) => {
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));
      if (activeConversation?._id === conversationId) {
        setActiveConversation(null);
      }
    });

    // Cleanup khi unmount
    return () => {
      socket.off("conversation:new");
      socket.off("conversation:update");
      socket.off("conversation:delete");
    };
  }, [activeConversation]);

  // === Tạo hội thoại mới ===
  const createConversation = useCallback((data) => {
    // data: { conversation }
    socket.emit("conversation:create", data);
  }, []);

  // === Chọn hội thoại đang xem ===
  const selectConversation = useCallback((conversation) => {
    setActiveConversation(conversation);
  }, []);

  return {
    conversations,
    setConversations,
    activeConversation,
    createConversation,
    selectConversation,
  };
};
