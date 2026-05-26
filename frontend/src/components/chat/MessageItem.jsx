import React, { useState } from "react";
import {
  Check,
  CheckCheck,
  Clock,
  EllipsisVertical,
  Pencil,
  Trash,
  TriangleAlert,
} from "lucide-react";
import { Popover } from "antd";
import MenuActions from "@/components/ui/popover/MenuActions";

const buildMessageActions = ({ onEdit, onDelete }) => [
  {
    key: "edit",
    icon: <Pencil size={18} />,
    label: "Chỉnh sửa tin nhắn",
    onClick: onEdit,
  },
  {
    key: "delete",
    icon: <Trash size={18} />,
    label: "Thu hồi tin nhắn",
    danger: true,
    onClick: onDelete,
  },
];

const isMessageAtOrBeforePointer = (pointerAt, messageCreatedAt) => {
  if (!pointerAt || !messageCreatedAt) return false;
  return new Date(pointerAt).getTime() >= new Date(messageCreatedAt).getTime();
};

const MessageItem = ({
  msg,
  currentUserId,
  currentConversation,
  isMine,
  showTime,
  showName,
  showAvatar,
  isLastMessage,
  onPreviewImage,
  onDeleteMessage,
  onEditClick,
}) => {
  const [open, setOpen] = useState(false); // State menu actions

  const handleDelete = () => {
    onDeleteMessage(msg._id);
    setOpen(false);
  };

  const handleEdit = () => {
    onEditClick(msg);
    setOpen(false);
  };

  const avatar = msg.senderId?.avatarUrl?.url || "/avatarA.jpg";
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

  const getReceiptParticipants = (
    participants,
    currentUserId,
    messageCreatedAt,
    pointerAtKey
  ) => {
    if (!participants) return [];

    return participants.filter((p) => {
      if (p.userId?._id === currentUserId) return false;
      return isMessageAtOrBeforePointer(p[pointerAtKey], messageCreatedAt);
    });
  };

  const totalParticipants = currentConversation?.participants.length - 1;

  const readers =
    isMine && isLastMessage
      ? getReceiptParticipants(
          currentConversation?.participants,
          currentUserId,
          msg.createdAt,
          "lastReadAt"
        )
      : [];

  const deliveredRecipients =
    isMine && isLastMessage
      ? getReceiptParticipants(
          currentConversation?.participants,
          currentUserId,
          msg.createdAt,
          "lastDeliveredAt"
        )
      : [];

  const messageActions = buildMessageActions({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  const MESSAGE_STATUS = {
    sending: {
      icon: Clock,
      label: "Đang gửi",
    },
    sent: {
      icon: Check,
      label: "Đã gửi",
    },
    delivered: {
      icon: CheckCheck,
      label: "Đã nhận",
    },
    failed: {
      icon: TriangleAlert,
      label: "Lỗi",
    },
  };

  const localStatus = ["sending", "failed"].includes(msg.status) ? msg.status : null;
  const inferredStatus =
    deliveredRecipients.length === totalParticipants ? "delivered" : "sent";
  const statusConfig = MESSAGE_STATUS[localStatus || inferredStatus];

  return (
    <li className={`${showAvatar ? "mt-4" : "mt-1"} list-none`}>
      <div
        className={`group flex items-start gap-2 ${
          isMine ? "justify-end" : "items-end gap-2"
        }`}
      >
        {/* --- Avatar ---*/}
        {showAvatar ? (
          <img
            src={avatar}
            alt={msg.senderId?.username}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover cursor-pointer border border-[var(--color-border)]"
          />
        ) : (
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
        )}

        {/* Ellipsis + Menu */}
        {isMine && !msg.isDeleted && (
          <div className="touch-always-visible self-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
            <Popover
              trigger="click"
              placement="bottom"
              open={open}
              onOpenChange={setOpen}
              content={<MenuActions actions={messageActions} minWidth={160} />}
            >
              {/* Ellipsis */}
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                aria-label="Open message actions"
                className="p-1 bg-[var(--color-app)] text-[var(--color-text-primary)] rounded-full border border-[var(--color-border)] shadow-xs hover:bg-[var(--color-hover)] active:bg-[var(--color-active)]"
              >
                <EllipsisVertical size={18} />
              </button>
            </Popover>
          </div>
        )}

        {/* --- Section --- */}
        <div className="min-w-0 max-w-[min(75vw,42rem)] sm:max-w-[70%] flex flex-col items-start gap-1">
          {/* --- Name Sender --- */}
          {showName && currentConversation?.type === "group" && (
            <span className="bg-[var(--color-app)] p-1 rounded-xl text-xs font-medium text-[var(--color-text-secondary)]">
              {msg.senderId?.username || "Người dùng"}
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
                <img
                  key={p.userId?._id}
                  src={p.userId?.avatarUrl?.url || "/avatarA.jpg"}
                  alt={p.userId?.username || "Người dùng"}
                  className="w-4 h-4 rounded-full object-cover"
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
                  <statusConfig.icon size={14} aria-hidden="true" />
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
