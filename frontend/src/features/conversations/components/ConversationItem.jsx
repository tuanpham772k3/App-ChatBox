import React from "react";
import { Ellipsis } from "lucide-react";
import { useFloatingMenu } from "@/hooks/useFloatingMenu";
import FloatingMenu from "@/components/ui/FloatingMenu";
import { getTypingNames } from "../utils/conversationHelper";

const ConversationItem = ({
  isActive,
  display,
  onClick,
  onDeleteConversation,
  typingUsers,
  currentUserId,
}) => {
  // Lấy tên những người đang gõ trong cuộc trò chuyện này
  const typingNames = getTypingNames(typingUsers, currentUserId);

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

  //Xử lý khi click vào cả item
  const handleRowClick = () => {
    onClick?.();
  };

  // Các hành động trong menu
  const actions = [
    { label: "Đánh dấu chưa đọc", onClick: () => {} },
    {
      label: "Xóa đoạn chat",
      danger: true,
      onClick: () => {
        onDeleteConversation && onDeleteConversation();
        setOpen(false);
      },
    },
    { label: "Xem trang cá nhân", onClick: () => {} },
    { label: "Lưu trữ đoạn chat", onClick: () => {} },
  ];

  return (
    <div
      className={`group flex items-center gap-3 p-2 rounded-md cursor-pointer transition hover:bg-[var(--bg-hover-secondary)] ${
        isActive ? "bg-[var(--bg-hover-secondary)]" : ""
      }`}
      onClick={handleRowClick}
    >
      {/* Avatar */}
      <div className="relative">
        <img
          src={display.displayAvatar}
          alt={display.displayName}
          className="w-12 h-12 rounded-full object-cover"
        />
        {display.partner?.status === "active" && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-black)] rounded-full"></span>
        )}
      </div>

      {/* Nội dung */}
      <div className="flex flex-1 justify-between items-center min-w-0">
        <div className="flex flex-col">
          <h3 className="text-sm text-[var(--color-text-primary)] font-medium truncate">
            {display.displayName}
          </h3>

          <div className="flex items-center text-xs text-[var(--color-text-secondary)]">
            {/* Phần nội dung chính (last message hoặc đang gõ) */}
            <span className="flex-1 min-w-0 truncate">
              {typingNames.length > 0 ? (
                <span className="text-[var(--color-text-primary)] text-xs italic text-blue-500">
                  {typingNames.join(", ")} đang gõ...
                </span>
              ) : (
                <>
                  {display.lastMsgSender && (
                    <span className="font-medium text-[var(--color-text-primary)] mr-1">
                      {display.lastMsgSender}:
                    </span>
                  )}
                  <span className="last-msg">{display.lastMsgContent}</span>
                </>
              )}
            </span>

            {/* Thời gian */}
            <span className="ml-2 text-[var(--color-text-secondary)] whitespace-nowrap">
              {display.lastMsgTime}
            </span>
          </div>
        </div>

        {/* Ellipsis */}
        <button
          ref={refs.setReference}
          {...getReferenceProps({
            onClick(e) {
              e.stopPropagation();
            },
          })}
          type="button"
          className={`p-1 mr-6 rounded-full  ${
            open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          } hover:bg-[var(--bg-hover-primary)] transition`}
        >
          <Ellipsis className="w-5 h-5" color="var(--color-text-secondary)" />
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
          width={344}
        />
      </div>
    </div>
  );
};

export default ConversationItem;
