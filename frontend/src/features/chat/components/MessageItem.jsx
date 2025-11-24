import React from "react";
import { EllipsisVertical } from "lucide-react";
import { useFloatingMenu } from "@/hooks/useFloatingMenu";
import FloatingMenu from "@/components/ui/FloatingMenu";

const MessageItem = ({ msg, isMine, showTime, onDeleteMessage, onEditClick }) => {
  // Sử dụng hook useFloatingMenu
  const {
    open,
    setOpen,
    arrowRef,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    arrowStyle,
  } = useFloatingMenu("bottom");

  // Xử lý khi xóa tin nhắn
  const handleDelete = () => {
    onDeleteMessage(msg._id);
    setOpen(false);
  };

  // Xử lý chỉnh sửa tin nhắn
  const handleEdit = () => {
    onEditClick(msg);
    setOpen(false);
  };

  // Lấy avatar người gửi, nếu không có thì dùng avatar mặc định
  const avatar = msg.sender?.avatarUrl?.url || "/img/default-avatar.png";
  // Chuyển createdAt thành đối tượng Date
  const msgTime = new Date(msg.createdAt); // Date tin hiện tại

  // Các hành động trong menu
  const actions = [
    { label: "Thu hồi", danger: true, onClick: handleDelete },
    { label: "Chỉnh sửa", onClick: handleEdit },
  ];

  return (
    <>
      {/* Display time */}
      {showTime && (
        <div className="flex justify-center">
          <span className="text-xs text-[var(--color-text-secondary)]">
            {msgTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            {msgTime.toLocaleDateString([], {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
            })}
          </span>
        </div>
      )}

      {/* Item Message */}
      <div className={`flex gap-4 ${isMine ? "justify-end" : "items-end gap-2"} group`}>
        {/* --- Avatar ---*/}
        {!isMine && (
          <img
            src={avatar}
            alt={msg.sender?.username}
            className="w-8 h-8 rounded-full object-cover cursor-pointer"
          />
        )}

        {/* Ellipsis + Menu */}
        {isMine && !msg.isDeleted && (
          <div className="flex items-center">
            {/* Ellipsis */}
            <button
              ref={refs.setReference}
              {...getReferenceProps()}
              type="button"
              className={`p-1 rounded-full transition-opacity ${
                open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              } hover:bg-gray-700`}
            >
              <EllipsisVertical className="w-5 h-5" color="var(--color-text-secondary)" />
            </button>

            {/* Menu */}
            <FloatingMenu
              open={open}
              refs={refs}
              floatingStyles={floatingStyles}
              getFloatingProps={getFloatingProps}
              arrowRef={arrowRef}
              arrowStyle={arrowStyle}
              actions={actions}
              width={150}
            />
          </div>
        )}

        {/* --- Bubble --- */}
        <div
          className={`px-3 py-2 rounded-2xl max-w-prose break-words ${
            isMine
              ? "bg-blue-600 text-[var(--color-text-primary)] rounded-tr-none"
              : "bg-[var(--bg-gray)] text-[var(--color-text-primary)] rounded-tl-none"
          }`}
        >
          <span className={msg.isDeleted ? "opacity-70" : ""}>{msg.content}</span>
          {msg.isEdited && (
            <span className="ml-1 text-[10px] opacity-70">(đã chỉnh sửa)</span>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageItem;
