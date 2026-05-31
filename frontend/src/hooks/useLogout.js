import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/store/authSlice";
import { clearMessages } from "@/store/messagesSlice";
import { disconnectSocket, emitEvent } from "@/lib/socket";
import { useNotification } from "@/hooks/useNotification";

export const useLogout = () => {
  const dispatch = useDispatch();
  const conversations = useSelector((state) => state.conversations.conversations);
  const notification = useNotification();

  const logout = useCallback(async () => {
    conversations.forEach((conversation) => {
      emitEvent("leave_conversation", { conversationId: conversation._id });
    });

    try {
      await dispatch(logoutUser()).unwrap();

      notification.success({
        message: "Đăng xuất thành công",
        description: "See you again ^-^",
      });

      dispatch(clearMessages());
      disconnectSocket();
    } catch (error) {
      notification.error({
        message: "Lỗi đăng xuất hệ thống",
        description: error.message || "Có lỗi xảy ra",
      });
    }
  }, [conversations, dispatch, notification]);

  return logout;
};
