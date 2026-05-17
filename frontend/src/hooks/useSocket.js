import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { emitEvent, isSocketConnected, offEvent, onEvent } from "@/lib/socket";
import {
  addConversation,
  removeConversationRealtime,
  syncDeliveredStatusRealtime,
  syncReadStatusRealtime,
  updateConversationLastMessage,
  updateConversationUnreadCount,
  userStartTyping,
  userStatus,
  userStopTyping,
} from "@/store/conversationsSlice";
import { addIncomingMessage, removeMessage, updateMessage } from "@/store/messagesSlice";

export const useSocket = () => {
  const dispatch = useDispatch();
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const activeConversationId = useSelector(
    (state) => state.conversations.activeConversationId
  );

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

    const onNewConversation = (conversation) => {
      dispatch(addConversation(conversation));
    };

    const onDeleteConversation = (conversationId) => {
      dispatch(removeConversationRealtime(conversationId));
    };

    const onConversationLastMessage = (data) => {
      dispatch(updateConversationLastMessage(data));
    };

    const onConversationUnread = (data) => {
      dispatch(updateConversationUnreadCount(data));
    };

    const onConversationRead = (data) => {
      dispatch(syncReadStatusRealtime(data));
    };

    const onConversationDelivered = (data) => {
      dispatch(syncDeliveredStatusRealtime(data));
    };

    const onMessageNew = (msg) => {
      const isMine = msg.senderId?._id === currentUserId;
      const isActive = msg.conversationId === activeConversationId;

      if (isActive) {
        dispatch(addIncomingMessage(msg));
      }

      if (!isMine) {
        emitEvent("message_delivered", { messageId: msg._id });
      }
    };

    const onMessageEdit = (msg) => {
      dispatch(updateMessage(msg));
    };

    const onMessageDelete = (messageId) => {
      dispatch(removeMessage(messageId));
    };

    const requestDeliverySync = () => {
      emitEvent("delivery_sync");
    };

    onEvent("connect", requestDeliverySync);
    onEvent("user_status_changed", onStatusChanged);
    onEvent("user_typing", onTypingStart);
    onEvent("user_stop_typing", onTypingStop);
    onEvent("conversation:new", onNewConversation);
    onEvent("conversation:lastMessage", onConversationLastMessage);
    onEvent("conversation:unread", onConversationUnread);
    onEvent("conversation:read", onConversationRead);
    onEvent("conversation:delivered", onConversationDelivered);
    onEvent("message_new", onMessageNew);
    onEvent("message_edit", onMessageEdit);
    onEvent("message_delete", onMessageDelete);

    if (isSocketConnected()) {
      requestDeliverySync();
    }

    return () => {
      offEvent("connect", requestDeliverySync);
      offEvent("user_status_changed", onStatusChanged);
      offEvent("user_typing", onTypingStart);
      offEvent("user_stop_typing", onTypingStop);
      offEvent("conversation:new", onNewConversation);
      offEvent("conversation:lastMessage", onConversationLastMessage);
      offEvent("conversation:unread", onConversationUnread);
      offEvent("conversation:read", onConversationRead);
      offEvent("conversation:delivered", onConversationDelivered);
      offEvent("message_new", onMessageNew);
      offEvent("message_edit", onMessageEdit);
      offEvent("message_delete", onMessageDelete);
    };
  }, [activeConversationId, currentUserId, dispatch]);
};
