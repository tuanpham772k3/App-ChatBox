import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { emitEvent, offEvent, onEvent } from "@/lib/socket";
import { userStartTyping, userStatus, userStopTyping } from "@/store/conversationsSlice";

export const useSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Xử lý sự kiện thay đổi trạng thái người dùng
    const onStatusChanged = (data) => {
      dispatch(userStatus(data));
    };

    // Xử lý sự kiện gõ phím
    const onTypingStart = (data) => {
      dispatch(userStartTyping(data));
    };

    const onTypingStop = (data) => {
      dispatch(userStopTyping(data));
    };

    // Thay đổi trạng thái tin nhắn
    const onMessageDelivered = (msg) => {
      if (!msg?._id) return;

      // Gửi sự kiện xác nhận tin nhắn đã được giao
      emitEvent("message_delivered", {
        messageId: msg._id,
        conversationId: msg.conversation,
      });
    };

    // Lắng nghe sự kiện từ server
    onEvent("user_status_changed", onStatusChanged);
    onEvent("user_typing", onTypingStart);
    onEvent("user_stop_typing", onTypingStop);
    onEvent("message_new", onMessageDelivered);

    return () => {
      offEvent("user_status_changed", onStatusChanged);
      offEvent("user_typing", onTypingStart);
      offEvent("user_stop_typing", onTypingStop);
      offEvent("message_new", onMessageDelivered);
    };
  }, []);
};
