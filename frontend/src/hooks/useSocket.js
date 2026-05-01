import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { emitEvent, offEvent, onEvent } from "@/lib/socket";
import {
  addConversation,
  removeConversationRealtime,
  syncReadStatusRealtime,
  updateConversationLastMessage,
  updateConversationUnreadCount,
  userStartTyping,
  userStatus,
  userStopTyping,
} from "@/store/conversationsSlice";
import {
  addIncomingMessage,
  removeMessage,
  updateMessage,
  updateStatusMessage,
} from "@/store/messagesSlice";

export const useSocket = () => {
  const dispatch = useDispatch();
  const currentConversationId = useSelector(
    (state) => state.conversations.currentConversationId
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

    const onMessageNew = (msg) => {
      if (!msg?._id) return;
      if (String(msg?.conversation) !== String(currentConversationId)) return;
      dispatch(addIncomingMessage(msg));
    };

    const onMessageEdit = (msg) => {
      if (String(msg?.conversation) !== String(currentConversationId)) return;
      dispatch(updateMessage(msg));
    };

    const onMessageDelete = (messageId) => {
      dispatch(removeMessage(messageId));
    };

    const onMessageDeliveredStatus = ({ messageId, status }) => {
      dispatch(updateStatusMessage({ messageId, status }));
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
    onEvent("conversation:new", onNewConversation);
    onEvent("conversation:lastMessage", onConversationLastMessage);
    onEvent("conversation:unread", onConversationUnread);
    onEvent("conversation:read", onConversationRead);
    onEvent("message_new", onMessageDelivered);
    onEvent("message_new", onMessageNew);
    onEvent("message_edit", onMessageEdit);
    onEvent("message_delete", onMessageDelete);
    onEvent("message_delivered", onMessageDeliveredStatus);

    return () => {
      offEvent("user_status_changed", onStatusChanged);
      offEvent("user_typing", onTypingStart);
      offEvent("user_stop_typing", onTypingStop);
      offEvent("conversation:new", onNewConversation);
      offEvent("conversation:lastMessage", onConversationLastMessage);
      offEvent("conversation:unread", onConversationUnread);
      offEvent("conversation:read", onConversationRead);
      offEvent("message_new", onMessageDelivered);
      offEvent("message_new", onMessageNew);
      offEvent("message_edit", onMessageEdit);
      offEvent("message_delete", onMessageDelete);
      offEvent("message_delivered", onMessageDeliveredStatus);
    };
  }, [currentConversationId, dispatch]);
};
