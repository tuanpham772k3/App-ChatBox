import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Tooltip } from "antd";
import { Check, CheckCheck, Clock, ThumbsUp, TriangleAlert } from "lucide-react";
import PopoverMessageActions from "./PopoverMessageActions";
import UserAvatar from "@/components/ui/avatar/UserAvatar";
import { deleteMessageById, reactionMessageById } from "@/store/messagesSlice";
import { useNotification } from "@/hooks/useNotification";
import MessageReplyPreview from "./MessageReplyPreview";
import ReactionPicker from "./ReactionPicker";
import { REACTIONS } from "@/constants/reactions";

const MESSAGE_STATUS = {
  sending: {
    Icon: Clock,
    label: "Đang gửi",
  },
  sent: {
    Icon: Check,
    label: "Đã gửi",
  },
  delivered: {
    Icon: CheckCheck,
    label: "Đã nhận",
  },
  failed: {
    Icon: TriangleAlert,
    label: "Lỗi",
  },
};

const getReaders = (participants, currentUserId, messageCreatedAt) => {
  if (!participants) return [];

  return participants.filter((p) => {
    if (p.userId?._id === currentUserId) return false;

    return (
      p.lastReadAt &&
      new Date(p.lastReadAt).getTime() >= new Date(messageCreatedAt).getTime()
    );
  });
};

const getDeliveredRecipients = (participants, currentUserId, messageCreatedAt) => {
  if (!participants) return [];

  return participants.filter((p) => {
    if (p.userId?._id === currentUserId) return false;

    return (
      p.lastDeliveredAt &&
      new Date(p.lastDeliveredAt).getTime() >= new Date(messageCreatedAt).getTime()
    );
  });
};

const MessageItem = ({
  msg,
  currentUserId,
  currentConversation,
  isLastMessage,
  onPreviewImage,
  setEditingMessage,
  setReplyingMessage,
  onOpenUserProfile,
  onJumpToMessage,
  onOpenReactionDetails,
}) => {
  const dispatch = useDispatch();
  const [openReaction, setOpenReaction] = useState(false);
  const notification = useNotification();

  const { isMine, showTime, showName, showAvatar, msgTimeDate, msgTime, msgEditedAt } =
    msg.meta;

  const {
    myReaction,
    reactionSummary,
    recentReactionEmojis,
    totalReactions,
    previewReactionUsers,
    hasMoreReactionUsers,
  } = msg.reactions;

  // Lấy danh sách người đã đọc và người nhận đã nhận tin nhắn
  const readers =
    isMine && isLastMessage
      ? getReaders(currentConversation?.participants, currentUserId, msg.createdAt)
      : [];

  const deliveredRecipients =
    isMine && isLastMessage
      ? getDeliveredRecipients(
          currentConversation?.participants,
          currentUserId,
          msg.createdAt
        )
      : [];

  // trạng thái tin nhắn
  const totalParticipants = currentConversation?.participants.length - 1;

  const status =
    msg.status === "sending" || msg.status === "failed"
      ? msg.status
      : deliveredRecipients.length === totalParticipants
      ? "delivered"
      : "sent";
  const statusConfig = MESSAGE_STATUS[status];

  // xóa tin nhắn
  const handleDeleteMessage = async () => {
    try {
      await dispatch(deleteMessageById(msg._id)).unwrap();
    } catch (error) {
      notification.error({
        message: "Gỡ tin nhắn thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  // chỉnh sửa tin nhắn
  const handleEditMessage = () => {
    setEditingMessage({
      id: msg._id,
      content: msg.content,
      originalContent: msg.content,
    });
  };

  const handleReplyMessage = () => {
    setReplyingMessage({
      id: msg._id,
      senderName: msg.senderId.displayName,
      originalContent: msg.content,
    });
  };

  const handleReaction = async (reaction) => {
    try {
      await dispatch(
        reactionMessageById({
          messageId: msg._id,
          emoji: reaction,
        })
      ).unwrap();
    } catch (error) {
      notification.error({
        message: "Không thể thả cảm xúc",
        description: error.message,
      });
    }
  };

  return (
    <li id={`message-${msg._id}`} className={`${showAvatar ? "mt-4" : "mt-1"} list-none`}>
      <div
        className={`relative group flex items-start gap-2 ${
          isMine ? "justify-end" : "items-end gap-2"
        }`}
      >
        {/* --- Avatar ---*/}
        {showAvatar && (
          <button
            type="button"
            onClick={() => onOpenUserProfile(msg?.senderId?._id)}
            className="absolute left-0 top-0"
          >
            <UserAvatar
              name={msg.senderId?.displayName || "Người dùng"}
              avatarUrl={msg.senderId?.avatar?.url}
            />
          </button>
        )}

        {/* Ellipsis + Menu */}
        {isMine && !msg.isDeleted && (
          <div className="touch-always-visible self-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
            <PopoverMessageActions
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onReplyMessage={handleReplyMessage}
            />
          </div>
        )}

        {/* --- Section --- */}
        <div className="min-w-0 max-w-[min(75vw,42rem)] sm:max-w-[70%] flex flex-col items-start gap-1 ml-12">
          {/* --- Name Sender --- */}
          {showName && currentConversation?.type === "group" && (
            <span className="bg-[var(--color-app)] p-1 rounded-xl text-xs font-medium text-[var(--color-text-secondary)]">
              {msg.senderId?.displayName || "Người dùng"}
            </span>
          )}

          {/* --- Bubble --- */}
          <div
            className={`relative min-w-[3.75rem] max-w-full rounded-lg break-words border shadow-xs text-[var(--color-text-primary)]
              ${msg.type !== "image" && "py-3 px-3"}
              ${totalReactions > 0 ? "mb-3" : ""}
              ${
                isMine
                  ? "bg-[var(--color-primary)]/5 border-blue-500"
                  : "bg-[var(--color-app)] border-[var(--color-message-border)]"
              }`}
          >
            {/* Reply */}
            {!msg.isDeleted && msg.replyTo && (
              <MessageReplyPreview replyTo={msg.replyTo} onJump={onJumpToMessage} />
            )}

            {/* Content */}
            {msg.type === "image" ? (
              <figure>
                <button
                  type="button"
                  onClick={() => onPreviewImage(msg)}
                  aria-label="Preview image message"
                  className="block max-w-full"
                >
                  <img
                    src={msg.file?.url}
                    alt={msg.file?.name || "Image message"}
                    className="max-w-full max-h-[min(45vh,21.875rem)] object-cover cursor-pointer"
                  />
                </button>
              </figure>
            ) : (
              <span
                className={
                  msg.isDeleted ? "text-[var(--color-text-secondary)] text-sm" : "text-sm"
                }
              >
                {msg.content}
              </span>
            )}

            {/* Edited */}
            {msg.isEdited && !msg.isDeleted && (
              <div className="text-[10px] text-[var(--color-text-secondary)]">
                {`Đã chỉnh sửa lúc ${msgEditedAt}`}
              </div>
            )}
            {/* Time */}
            {showTime && msg.type !== "image" && (
              <time
                dateTime={msgTimeDate.toISOString()}
                className="mt-1 block text-xs text-[var(--color-text-secondary)]"
              >
                {msgTime}
              </time>
            )}

            {/* --- Reactions --- */}
            <div className="absolute -bottom-3 right-2 z-10 flex flex-row-reverse items-center gap-1">
              {/* Picker */}
              {!msg.isDeleted && (
                <div
                  className={`shrink-0 transition-opacity duration-150 ${
                    myReaction ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <ReactionPicker
                    onSelect={handleReaction}
                    open={openReaction}
                    onOpenChange={setOpenReaction}
                    myReaction={myReaction}
                  >
                    <button
                      type="button"
                      className="flex items-center justify-center p-1 rounded-full border
          border-[var(--color-border)] bg-[var(--color-chat)] text-[var(--color-text-secondary)]"
                    >
                      {myReaction ? (
                        <img
                          src={REACTIONS[myReaction.emoji].src}
                          alt={REACTIONS[myReaction.emoji].label}
                          className="w-4 h-4 select-none"
                          draggable={false}
                        />
                      ) : (
                        <ThumbsUp size={16} />
                      )}
                    </button>
                  </ReactionPicker>
                </div>
              )}

              {/* Summary */}
              {recentReactionEmojis.length > 0 && (
                <Tooltip
                  placement="bottom"
                  title={
                    <div>
                      {previewReactionUsers.map((user) => (
                        <div key={user._id}>{user.displayName}</div>
                      ))}

                      {hasMoreReactionUsers && <div>...</div>}
                    </div>
                  }
                >
                  <button
                    onClick={() => onOpenReactionDetails(reactionSummary)}
                    type="button"
                    className="shrink-0 flex items-center justify-center gap-1 px-1 rounded-full border
                  border-[var(--color-border)] bg-[var(--color-chat)]"
                  >
                    {recentReactionEmojis.map((emoji) => (
                      <img
                        key={emoji}
                        src={REACTIONS[emoji].src}
                        alt={REACTIONS[emoji].label}
                        className="w-4 h-4 select-none"
                        draggable={false}
                      />
                    ))}
                    <span>{totalReactions}</span>
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Readers or Status */}
      {isMine && isLastMessage && !msg.isDeleted && (
        <div className="flex justify-end mt-4">
          {readers.length > 0 ? (
            <div className="flex gap-1">
              {readers.map((p) => (
                <UserAvatar
                  key={p.userId?._id}
                  name={p.userId?.displayName || "Người dùng"}
                  avatarUrl={p.userId?.avatar?.url}
                  size={24}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {/* Time ảnh */}
              {showTime && msg.type === "image" && (
                <time
                  dateTime={msgTimeDate.toISOString()}
                  className="py-1 px-2 bg-[var(--color-status)] rounded-lg text-xs text-white"
                >
                  {msgTime}
                </time>
              )}

              {/* Trạng thái */}
              {statusConfig && (
                <span className="flex items-center gap-1 p-1 bg-[var(--color-status)] rounded-lg text-xs font-medium text-white">
                  <statusConfig.Icon size={14} aria-hidden="true" />
                  <span>{statusConfig.label}</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  );
};

export default MessageItem;
