import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { emitEvent, offEvent, onEvent } from "@/lib/socket";
import {
  addConversation,
  memberAddedRealtime,
  memberLeftRealtime,
  memberRemovedRealtime,
  removeConversationRealtime,
  syncDeliveredStatusRealtime,
  syncReadStatusRealtime,
  updateConversationLastMessage,
  updateConversationUnreadCount,
  userStartTyping,
  userStatusChanged,
  userStopTyping,
} from "@/store/conversationsSlice";
import {
  addIncomingMessage,
  reactionMessageRealtime,
  removeMessage,
  updateMessage,
} from "@/store/messagesSlice";
import {
  friendRemovedRealtime,
  friendRequestAcceptedRealtime,
  friendRequestCancelledRealtime,
  friendRequestReceivedRealtime,
  friendRequestRejectedRealtime,
} from "@/store/relationshipSlice";

export const useSocket = () => {
  const dispatch = useDispatch();
  const currentUserId = useSelector((state) => state.user.currentUser?._id);
  const activeConversationId = useSelector(
    (state) => state.conversations.activeConversationId
  );

  useEffect(() => {
    const onStatusChanged = (data) => {
      dispatch(userStatusChanged(data));
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

    const onConversationDeleted = (conversationId) => {
      dispatch(removeConversationRealtime(conversationId));
    };

    const onConversationLastMessage = (data) => {
      dispatch(updateConversationLastMessage(data));
    };

    const onConversationMemberLeft = (data) => {
      dispatch(memberLeftRealtime(data));
    };

    const onConversationMemberAdded = (data) => {
      dispatch(memberAddedRealtime(data));
    };

    const onConversationMemberRemoved = (conversation) => {
      dispatch(memberRemovedRealtime(conversation));
    };

    const onFriendRequestReceived = (relationship) => {
      dispatch(friendRequestReceivedRealtime(relationship));
    };

    const onFriendRequestAccepted = (relationship) => {
      dispatch(friendRequestAcceptedRealtime(relationship));
    };

    const onFriendRequestRejected = (data) => {
      dispatch(friendRequestRejectedRealtime(data));
    };

    const onFriendRequestCancelled = (data) => {
      dispatch(friendRequestCancelledRealtime(data));
    };

    const onFriendRemoved = (data) => {
      dispatch(friendRemovedRealtime(data));
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

    const onMessageEdit = (message) => {
      dispatch(updateMessage(message));
    };

    const onMessageDelete = (message) => {
      dispatch(removeMessage(message));
    };

    const onMessageReaction = (message) => {
      dispatch(reactionMessageRealtime(message));
    };

    onEvent("user_status_changed", onStatusChanged);
    onEvent("user_typing", onTypingStart);
    onEvent("user_stop_typing", onTypingStop);

    onEvent("conversation:created", onNewConversation);
    onEvent("conversation:deleted", onConversationDeleted);
    onEvent("conversation:last_message_updated", onConversationLastMessage);
    onEvent("conversation:member_left", onConversationMemberLeft);
    onEvent("conversation:members_added", onConversationMemberAdded);
    onEvent("conversation:member_removed", onConversationMemberRemoved);

    onEvent("relationship:friend_request_received", onFriendRequestReceived);
    onEvent("relationship:friend_request_accepted", onFriendRequestAccepted);
    onEvent("relationship:friend_request_rejected", onFriendRequestRejected);
    onEvent("relationship:friend_request_cancelled", onFriendRequestCancelled);
    onEvent("relationship:friend_removed", onFriendRemoved);

    onEvent("message:unread_updated", onConversationUnread);
    onEvent("message:seen_updated", onConversationRead);
    onEvent("message:delivered_updated", onConversationDelivered);
    onEvent("message:created", onMessageNew);
    onEvent("message:edited", onMessageEdit);
    onEvent("message:deleted", onMessageDelete);
    onEvent("message:reaction_updated", onMessageReaction);

    return () => {
      offEvent("user_status_changed", onStatusChanged);
      offEvent("user_typing", onTypingStart);
      offEvent("user_stop_typing", onTypingStop);

      offEvent("conversation:created", onNewConversation);
      offEvent("conversation:deleted", onConversationDeleted);
      offEvent("conversation:last_message_updated", onConversationLastMessage);
      offEvent("conversation:member_left", onConversationMemberLeft);
      offEvent("conversation:members_added", onConversationMemberAdded);
      offEvent("conversation:member_removed", onConversationMemberRemoved);

      offEvent("relationship:friend_request_received", onFriendRequestReceived);
      offEvent("relationship:friend_request_accepted", onFriendRequestAccepted);
      offEvent("relationship:friend_request_rejected", onFriendRequestRejected);
      offEvent("relationship:friend_request_cancelled", onFriendRequestCancelled);
      offEvent("relationship:friend_removed", onFriendRemoved);

      offEvent("message:unread_updated", onConversationUnread);
      offEvent("message:seen_updated", onConversationRead);
      offEvent("message:delivered_updated", onConversationDelivered);
      offEvent("message:created", onMessageNew);
      offEvent("message:edited", onMessageEdit);
      offEvent("message:deleted", onMessageDelete);
      offEvent("message:reaction_updated", onMessageReaction);
    };
  }, [activeConversationId, currentUserId, dispatch]);
};
