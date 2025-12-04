import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { offEvent, onEvent } from "@/shared/lib/socket";
import { addIncomingMessage, updateMessage, removeMessage } from "../messagesSlice";
import { updateConversationLastMessage } from "@/features/conversations/conversationsSlice";

export const useMessages = (conversationId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!conversationId) return;

    // Nhận tin nhắn mới
    const onNewMessage = (msg) => {
      if (!msg?.conversation) return;

      // Cập nhật list hội thoại luôn có last message mới nhất
      dispatch(
        updateConversationLastMessage({
          conversationId: msg.conversation,
          message: msg,
        })
      );

      if (msg.conversation === conversationId) {
        dispatch(addIncomingMessage(msg));
      }
    };

    // Chỉnh sửa tin nhắn
    const onEditMessage = (msg) => {
      if (msg.conversation === conversationId) {
        dispatch(updateMessage(msg));
      }
    };

    // Xóa tin nhắn
    const onDeleteMessage = (messageId) => {
      dispatch(removeMessage(messageId));
    };

    // Lắng nghe các sự kiện từ server
    onEvent("message:new", onNewMessage);
    onEvent("message:edit", onEditMessage);
    onEvent("message:delete", onDeleteMessage);

    return () => {
      offEvent("message:new", onNewMessage);
      offEvent("message:edit", onEditMessage);
      offEvent("message:delete", onDeleteMessage);
    };
  }, [conversationId]);

  return {};
};
