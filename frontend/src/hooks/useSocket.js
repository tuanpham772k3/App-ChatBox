import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { offEvent, onEvent } from "@/lib/socket";
import {
  userStartTyping,
  userStopTyping,
} from "@/features/conversations/conversationsSlice";

export const useSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Xử lý sự kiện global tại đây - hãy viết tiếp để hoàn th
    const onStatus = (data) => {
      dispatch(statusUser(data));
    };

    const onTypingStart = (data) => {
      dispatch(userStartTyping(data));
    };

    const onTypingStop = (data) => {
      dispatch(userStopTyping(data));
    };

    // Lắng nghe sự kiện từ server
    onEvent("user:status", onStatus);
    onEvent("user_typing", onTypingStart);
    onEvent("user_stop_typing", onTypingStop);

    return () => {
      offEvent("user:status", onStatus);
      offEvent("user_typing", onTypingStart);
      offEvent("user_stop_typing", onTypingStop);
    };
  }, []);
};
