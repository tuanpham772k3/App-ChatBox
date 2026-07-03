import React from "react";
import { Check, CheckCheck, Clock, TriangleAlert } from "lucide-react";
import PopoverMessageActions from "./PopoverMessageActions";
import UserAvatar from "@/components/ui/avatar/UserAvatar";
import messagesApi from "@/services/messagesApi";
import { useNotification } from "@/hooks/useNotification";

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
  onSelectAvatarUser,
}) => {
  const notification = useNotification();

  // Lấy thông tin tin nhắn
  const isMine = msg.meta.isMine;
  const showTime = msg.meta.showTime;
  const showName = msg.meta.showName;
  const showAvatar = msg.meta.showAvatar;

  // Lấy thời gian gửi tin nhắn và thời gian chỉnh sửa tin nhắn
  const msgTimeDate = new Date(msg.createdAt);
  const msgTime = msgTimeDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const msgEditedAt = new Date(msg.editedAt).toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

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
      await messagesApi.deleteMessageById(msg._id);
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

  return (
    <li className={`${showAvatar ? "mt-4" : "mt-1"} list-none`}>
      <div
        className={`group flex items-start gap-2 ${
          isMine ? "justify-end" : "items-end gap-2"
        }`}
      >
        {/* --- Avatar ---*/}
        {showAvatar ? (
          <button type="button" onClick={() => onSelectAvatarUser(msg?.senderId?._id)}>
            <UserAvatar
              name={msg.senderId?.displayName || "Người dùng"}
              avatarUrl={msg.senderId?.avatar?.url}
            />
          </button>
        ) : (
          <div className="w-10 h-10 shrink-0" />
        )}

        {/* Ellipsis + Menu */}
        {isMine && !msg.isDeleted && (
          <div className="touch-always-visible self-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
            <PopoverMessageActions
              msg={msg}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
            />
          </div>
        )}

        {/* --- Section --- */}
        <div className="min-w-0 max-w-[min(75vw,42rem)] sm:max-w-[70%] flex flex-col items-start gap-1">
          {/* --- Name Sender --- */}
          {showName && currentConversation?.type === "group" && (
            <span className="bg-[var(--color-app)] p-1 rounded-xl text-xs font-medium text-[var(--color-text-secondary)]">
              {msg.senderId?.displayName || "Người dùng"}
            </span>
          )}

          {/* --- Bubble --- */}
          <div
            className={`relative min-w-[3.75rem] max-w-full rounded-lg overflow-hidden break-words border shadow-xs text-[var(--color-text-primary)]
              ${msg.type !== "image" && "py-3 px-3"}
              ${
                isMine
                  ? "bg-[var(--color-primary)]/5 border-blue-500"
                  : "bg-[var(--color-app)] border-[var(--color-message-border)]"
              }`}
          >
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
