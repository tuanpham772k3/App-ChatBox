import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { emitEvent, isSocketConnected, offEvent, onEvent } from "@/lib/socket";
import { addIncomingMessage, updateMessage, removeMessage } from "../messagesSlice";

export const useMessages = (conversationId) => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    if (!conversationId || !accessToken) return;

    // Join phòng cuộc trò chuyện
    const joinRoom = () => emitEvent("join_conversation", conversationId);

    if (isSocketConnected()) {
      joinRoom();
    } else {
      onEvent("connect", joinRoom);
    }

    // Nhận tin nhắn mới
    const onNewMessage = (msg) => {
      console.log(msg);

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
      offEvent("connect", joinRoom);
      if (isSocketConnected()) {
        emitEvent("leave_conversation", conversationId);
      }
      offEvent("message:new", onNewMessage);
      offEvent("message:edit", onEditMessage);
      offEvent("message:delete", onDeleteMessage);
    };
  }, [conversationId, accessToken, dispatch]);

  return {};
};
