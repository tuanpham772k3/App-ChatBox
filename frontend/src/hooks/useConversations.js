import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  addConversation,
  removeConversationRealtime,
  syncReadStatusRealtime,
  updateConversationLastMessage,
  updateConversationUnreadCount,
} from "../store/conversationsSlice";
import { offEvent, onEvent } from "@/lib/socket";

export const useConversations = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Hội thoại mới
    const onNewConversation = (conversation) => {
      dispatch(addConversation(conversation));
    };

    // Hội thoại bị xoá
    const onDeleteConversation = (conversationId) => {
      dispatch(removeConversationRealtime(conversationId));
    };

    // Realtime unread
    const onConversationLastMessage = (data) => {
      // { conversationId, lastMessage }
      dispatch(updateConversationLastMessage(data));
    };

    const onConversationUnread = (data) => {
      // { conversationId, unreadCount, userId }
      dispatch(updateConversationUnreadCount(data));
    };

    // Realtime đánh dấu đã đọc
    const onMarkAsRead = (data) => {
      // { conversationId, userId, lastReadAt }
      dispatch(syncReadStatusRealtime(data));
    };

    onEvent("conversation:new", onNewConversation);
    onEvent("conversation:delete", onDeleteConversation);
    onEvent("conversation:lastMessage", onConversationLastMessage);
    onEvent("conversation:unread", onConversationUnread);
    onEvent("conversation:read", onMarkAsRead);

    // Cleanup khi unmount
    return () => {
      offEvent("conversation:new", onNewConversation);
      offEvent("conversation:delete", onDeleteConversation);
      offEvent("conversation:lastMessage", onConversationLastMessage);
      offEvent("conversation:unread", onConversationUnread);
      offEvent("conversation:read", onMarkAsRead);
    };
  }, [dispatch]);
};
