import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { emitEvent, offEvent, onEvent } from "@/lib/socket";
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
  const currentUserId = useSelector((state) => state.user.currentUser?._id);
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
        emitEvent("message:mark_delivered", { messageId: msg._id });
      }
    };

    const onMessageEdit = (msg) => {
      dispatch(updateMessage(msg));
    };

    const onMessageDelete = (messageId) => {
      dispatch(removeMessage(messageId));
    };

    onEvent("user_status_changed", onStatusChanged);
    onEvent("user_typing", onTypingStart);
    onEvent("user_stop_typing", onTypingStop);

    onEvent("conversation:created", onNewConversation);
    onEvent("conversation:last_message_updated", onConversationLastMessage);

    onEvent("message:unread_updated", onConversationUnread);
    onEvent("message:seen_updated", onConversationRead);
    onEvent("message:delivered_updated", onConversationDelivered);
    onEvent("message:created", onMessageNew);
    onEvent("message:edited", onMessageEdit);
    onEvent("message:deleted", onMessageDelete);

    return () => {
      offEvent("user_status_changed", onStatusChanged);
      offEvent("user_typing", onTypingStart);
      offEvent("user_stop_typing", onTypingStop);

      offEvent("conversation:created", onNewConversation);
      offEvent("conversation:last_message_updated", onConversationLastMessage);

      offEvent("message:unread_updated", onConversationUnread);
      offEvent("message:seen_updated", onConversationRead);
      offEvent("message:delivered_updated", onConversationDelivered);
      offEvent("message:created", onMessageNew);
      offEvent("message:edited", onMessageEdit);
      offEvent("message:deleted", onMessageDelete);
    };
  }, [activeConversationId, currentUserId, dispatch]);
};
