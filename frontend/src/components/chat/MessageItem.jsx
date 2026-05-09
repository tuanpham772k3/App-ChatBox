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

const MessageItem = ({
  msg,
  currentUserId,
  currentConversation,
  isMine,
  showDate,
  showTime,
  showName,
  showAvatar,
  isLastMessage,
  onPreviewImage,
  onDeleteMessage,
  onEditClick,
}) => {
  const [open, setOpen] = useState(false); // State menu actions

  // Xóa tin nhắn
  const handleDelete = () => {
    onDeleteMessage(msg._id);
    setOpen(false);
  };

  // Chỉnh sửa tin nhắn
  const handleEdit = () => {
    onEditClick(msg);
    setOpen(false);
  };

  // Avatar người gửi
  const avatar = msg.sender?.avatarUrl?.url || "/avatarA.jpg";
  // Date tin hiện tại
  const msgTime = new Date(msg.createdAt);

  const getReaders = (participants, currentUserId, msgId) => {
    if (!participants) return [];

    return participants.filter((p) => {
      if (p.user._id === currentUserId) return false;
      if (!p.lastReadMessage) return false;
      return p.lastReadMessage >= msgId;
    });
  };

  const readers =
    isMine && isLastMessage
      ? getReaders(currentConversation?.participants, currentUserId, msg._id)
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

  const statusConfig = MESSAGE_STATUS[msg.status];

  return (
    <li className="w-full flex flex-col">
      {/* ====== Display date ====== */}
      {showDate && (
        <div className="flex justify-center m-2">
          <time
            dateTime={msgTime.toISOString()}
            className="py-1 px-4 bg-gray-400 rounded-xl text-xs text-white"
          >
            {msgTime.toLocaleDateString([], {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </time>
        </div>
      )}

      {/* ====== Message Item ====== */}
      <div
        className={`group flex items-start gap-2 ${
          isMine ? "justify-end" : "items-end gap-2"
        }`}
      >
        {/* --- Avatar ---*/}
        {showAvatar ? (
          <img
            src={avatar}
            alt={msg.sender?.username}
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
                className="p-1 bg-[var(--color-app)] text-[var(--color-text-primary)] rounded-full border border-[var(--color-border)] shadow-xs hover:bg-gray-100 active:bg-black/5"
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
              {msg.sender?.username || "Người dùng"}
            </span>
          )}

          {/* --- Bubble --- */}
          <div
            className={`relative min-w-[3.75rem] max-w-full rounded-lg overflow-hidden break-words border shadow-xs text-[var(--color-text-primary)]
              ${msg.type !== "image" && "py-3 px-3"}
              ${
                isMine
                  ? "bg-[var(--color-primary)]/5 border-blue-500"
                  : "bg-[var(--color-app)] border-black/15"
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
                (đã chỉnh sửa)
              </div>
            )}
            {/* Time */}
            {showTime && msg.type !== "image" && (
              <time
                dateTime={msgTime.toISOString()}
                className="mt-1 block text-xs text-[var(--color-text-secondary)]"
              >
                {msgTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                  key={p.user._id}
                  src={p.user.avatarUrl?.url || "/avatarA.jpg"}
                  alt={p.user.username}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {/* Time ảnh */}
              {showTime && msg.type === "image" && (
                <time
                  dateTime={msgTime.toISOString()}
                  className="py-1 px-2 bg-gray-400 rounded-lg text-xs text-white"
                >
                  {msgTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </time>
              )}

              {/* Trạng thái */}
              {statusConfig && (
                <span className="flex items-center gap-1 p-1 bg-gray-400 rounded-lg text-xs font-medium text-white">
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
