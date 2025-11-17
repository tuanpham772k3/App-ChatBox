import React from "react";

const DraftConversation = ({
  isActive,
  avatar,
  username,
  onSelectDraft,
  onDeleteDraft,
}) => {
  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-[var(--bg-hover-secondary)] transition  ${
        isActive ? "bg-[var(--bg-hover-secondary)]" : ""
      }`}
      onClick={onSelectDraft} // mở ChatWindow
    >
      {/* Avatar */}
      <div className="relative">
        <img
          src={avatar || "/img/default-avatar.png"}
          alt={username}
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>

      {/* Nội dung */}
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-sm text-[var(--color-text-primary)] font-medium">
          Tin nhắn mới đến {username}
        </p>
      </div>

      {/* Nút hủy */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteDraft();
        }}
        className="text-[var(--color-text-secondary)] hover:text-red-500 transition"
      >
        &#10005;
      </button>
    </div>
  );
};

export default DraftConversation;
