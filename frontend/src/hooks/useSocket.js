import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { emitEvent, offEvent, onEvent } from "@/lib/socket";
import {
  userStartTyping,
  userStatus,
  userStopTyping,
} from "@/features/conversations/conversationsSlice";

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

    // Lắng nghe sự kiện từ server
    onEvent("user_status_changed", onStatusChanged);
    onEvent("user_typing", onTypingStart);
    onEvent("user_stop_typing", onTypingStop);

    return () => {
      offEvent("user_status_changed", onStatusChanged);
      offEvent("user_typing", onTypingStart);
      offEvent("user_stop_typing", onTypingStop);
    };
  }, []);
};
