import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { emitEvent, offEvent, onEvent } from "@/lib/socket";
import { userStartTyping, userStatus, userStopTyping } from "@/store/conversationsSlice";

export const useSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const onStatusChanged = (data) => {
      dispatch(userStatus(data));
    };

    const onTypingStart = (data) => {
      dispatch(userStartTyping(data));
    };

    const onTypingStop = (data) => {
      dispatch(userStopTyping(data));
    };

    const onMessageDelivered = (msg) => {
      if (!msg?._id || !msg?.conversation) return;

      emitEvent("message_delivered", {
        messageId: msg._id,
        conversationId: msg.conversation,
      });
    };

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
  }, [dispatch]);
};
