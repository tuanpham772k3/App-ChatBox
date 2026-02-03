import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { offEvent, onEvent } from "@/shared/lib/socket";
import {
  addIncomingMessage,
  updateMessage,
  removeMessage,
  updateStatusMessage,
} from "../messagesSlice";

export const useMessages = (conversationId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!conversationId) return;

    // Nhận tin nhắn mới (người nhận)
    const onNewMessage = (msg) => {
      if (!msg?._id) return;
      if (msg?.conversation === conversationId) {
        dispatch(addIncomingMessage(msg));
      }
    };

    // Chỉnh sửa tin nhắn (người gửi)
    const onEditMessage = (msg) => {
      if (msg?.conversation === conversationId) {
        dispatch(updateMessage(msg));
      }
    };

    // Xóa tin nhắn (người gửi)
    const onDeleteMessage = (messageId) => {
      dispatch(removeMessage(messageId));
    };

    // Cập nhật trạng thái tin nhắn (người gửi)
    const onDeliveredMessage = ({ messageId, status }) => {
      dispatch(updateStatusMessage({ messageId, status }));
    };

    // Lắng nghe các sự kiện từ server
    onEvent("message_new", onNewMessage);
    onEvent("message_edit", onEditMessage);
    onEvent("message_delete", onDeleteMessage);
    onEvent("message_delivered", onDeliveredMessage);

    return () => {
      offEvent("message_new", onNewMessage);
      offEvent("message_edit", onEditMessage);
      offEvent("message_delete", onDeleteMessage);
      offEvent("message_delivered", onDeliveredMessage);
    };
  }, [conversationId, dispatch]);
};
