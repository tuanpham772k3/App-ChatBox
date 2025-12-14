import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  addConversation,
  removeConversationRealtime,
  syncReadStatusRealtime,
  updateConversationMetadata,
} from "../conversationsSlice";
import { offEvent, onEvent } from "@/shared/lib/socket";

export const useConversations = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // ✅ Hội thoại mới
    const onNewConversation = (conversation) => {
      dispatch(addConversation(conversation));
    };

    // ✅ Hội thoại bị xoá
    const onDeleteConversation = (conversationId) => {
      dispatch(removeConversationRealtime(conversationId));
    };

    // ✅ Realtime unread
    const onConversationUpdate = (data) => {
      // { conversationId, lastMessage, unreadCount, userId }
      dispatch(updateConversationMetadata(data));
    };

    // ✅ Realtime đã đọc
    const onReadSync = (data) => {
      // { conversationId, userId, lastReadAt }
      dispatch(syncReadStatusRealtime(data));
    };

    onEvent("conversation:new", onNewConversation);
    onEvent("conversation:delete", onDeleteConversation);
    onEvent("conversation:update", onConversationUpdate);
    onEvent("conversation:read", onReadSync);

    // Cleanup khi unmount
    return () => {
      offEvent("conversation:new", onNewConversation);
      offEvent("conversation:delete", onDeleteConversation);
      offEvent("conversation:update", onConversationUpdate);
      offEvent("conversation:read", onReadSync);
    };
  }, [dispatch]);
};
