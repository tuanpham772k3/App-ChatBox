import React, { useState } from "react";
import { EllipsisVertical, Pencil, Trash } from "lucide-react";
import { Popover } from "antd";
import MenuActions from "@/shared/components/ui/popover/MenuActions";

const MessageItem = ({
  msg,
  isMine,
  showDate,
  showTime,
  showName,
  showAvatar,
  isLastMessage,
  conversation,
  currentUserId,
  onDeleteMessage,
  onEditClick,
}) => {
  // State menu actions
  const [open, setOpen] = useState(false);

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

  // Danh sách những người đã đọc tin nhắn
  let readers = [];

  if (isMine && isLastMessage && conversation?.participants) {
    readers = conversation.participants.filter((p) => {
      if (p.user._id === currentUserId) return;
      if (!p.lastReadMessage) return;
      return p.lastReadMessage >= msg._id;
    });
  }

  // Menu actions
  const messageActions = [
    {
      key: "edit",
      icon: <Pencil size={18} />,
      label: "Chỉnh sửa tin nhắn",
      onClick: handleEdit,
    },
    {
      key: "delete",
      icon: <Trash size={18} />,
      label: "Thu hồi tin nhắn",
      danger: true,
      onClick: handleDelete,
    },
  ];

  return (
    <>
      {/* --- Display date --- */}
      {showDate && (
        <div className="flex justify-center mt-4">
          <span className="px-4 py-1 bg-[var(--color-surface)] rounded-lg text-xs text-[var(--color-text-primary)]">
            {msgTime.toLocaleDateString([], {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
            })}
          </span>
        </div>
      )}

      {/* --- Item Message --- */}
      <div
        className={`flex items-start gap-4 mt-1 ${
          isMine ? "justify-end" : "items-end gap-2"
        } group`}
      >
        {/* --- Avatar ---*/}
        {!isMine &&
          (showAvatar ? (
            <img
              src={avatar}
              alt={msg.sender?.username}
              className="w-8 h-8 rounded-full object-cover cursor-pointer"
            />
          ) : (
            <div className="w-8 h-8" />
          ))}

        {/* Ellipsis + Menu */}
        {isMine && !msg.isDeleted && (
          <Popover
            trigger="click"
            placement="bottom"
            open={open}
            onOpenChange={setOpen}
            content={<MenuActions actions={messageActions} minWidth={160} />}
            className="self-center"
          >
            {/* Ellipsis */}
            <button
              type="button"
              className={`p-1 rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)]
                hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)]
                transition-opacity ${
                  open
                    ? "opacity-100 focus:bg-[var(--color-icon-hover-bg)] focus:text-[var(--color-icon-hover-text)]"
                    : "opacity-0 group-hover:opacity-100"
                }`}
            >
              <EllipsisVertical className="w-5 h-5" />
            </button>
          </Popover>
        )}

        {/* --- Content Column (Sender name + Bubble) --- */}
        <div className="flex flex-col items-start gap-2">
          {/* --- Sender name --- */}
          {!isMine && showName && conversation?.type === "group" && (
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {msg.sender?.username || "Người dùng"}
            </span>
          )}

          {/* --- Bubble wrapper --- */}
          <div
            className={`px-3 py-2 rounded-2xl min-w-[60px] max-w-prose break-words ${
              isMine
                ? "bg-[var(--color-primary)] text-white rounded-tr-none"
                : "bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-tl-none"
            }`}
          >
            {/* Content */}
            <span className={msg.isDeleted ? "opacity-70" : ""}>{msg.content}</span>

            {/* Edited */}
            {msg.isEdited && <div className="text-[10px] opacity-70">(đã chỉnh sửa)</div>}

            {/* Time */}
            {showTime && (
              <div
                className={`mt-1 text-[11px] ${
                  isMine ? " text-white" : "text-[var(--color-text-secondary)]"
                }`}
              >
                {msgTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hiển thị những người đã đọc tin nhắn */}
      {isMine && isLastMessage && !msg.isDeleted && (
        <div className="flex justify-end mt-1">
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
            <span className="text-[11px] text-[var(--color-text-secondary)]">Đã gửi</span>
          )}
        </div>
      )}
    </>
  );
};

export default MessageItem;
