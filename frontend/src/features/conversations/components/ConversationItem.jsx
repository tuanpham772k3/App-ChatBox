import React from "react";
import { Ellipsis } from "lucide-react";
import { useFloatingMenu } from "@/shared/hooks/useFloatingMenu";
import FloatingMenu from "@/shared/components/ui/popover/FloatingMenu";
import { getTypingNames } from "../utils/conversationHelper";

const ConversationItem = React.memo(
  ({
    isActive,
    display,
    onClick,
    onDeleteConversation,
    typingUsers,
    currentUserId,
    partnerStatus,
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
        className={`group flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition w-full max-w-full ${
          isActive
            ? "bg-[var(--color-primary)]/5"
            : "hover:bg-[var(--bg-hover-secondary)]"
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
          {partnerStatus?.status === "online" && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-black)] rounded-full"></span>
          )}
        </div>

        {/* Nội dung */}
        <div className="flex flex-1 justify-between items-center min-w-0">
          <div className="flex flex-col min-w-0">
            <h3
              className={`text-sm font-medium truncate ${
                isActive
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text-primary)]"
              }`}
            >
              {display.displayName}
            </h3>

            <div className="flex items-center text-xs text-[var(--color-text-secondary)] min-w-0">
              {/* Phần nội dung chính (last message hoặc đang gõ) */}
              <span className="flex-1 min-w-0 max-w-60 overflow-hidden truncate">
                {typingNames.length > 0 ? (
                  <span className="text-xs italic text-[var(--color-primary)]">
                    {typingNames.join(", ")} đang gõ...
                  </span>
                ) : (
                  <>
                    {display.lastMsgSender && (
                      <span className="text-[var(--color-text-secondary)] mr-1">
                        {display.lastMsgSender}:
                      </span>
                    )}
                    <span>{display.lastMsgContent}</span>
                  </>
                )}
              </span>

              {/* Thời gian */}
              <span className="ml-2 text-[var(--color-text-secondary)] whitespace-nowrap">
                {display.lastMsgTime}
              </span>
            </div>
          </div>

          {/* Ellipsis + Unread badge (unread nằm sau ellipsis giống Zalo) */}
          <div className="flex items-center gap-1 ml-2 mr-2 shrink-0">
            <button
              ref={refs.setReference}
              {...getReferenceProps({
                onClick(e) {
                  e.stopPropagation();
                },
              })}
              type="button"
              className={`p-1 rounded-full  ${
                open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              } hover:bg-[var(--bg-hover-primary)] transition`}
            >
              <Ellipsis className="w-5 h-5" color="var(--color-text-secondary)" />
            </button>

            {display.unreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1 inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-semibold text-white">
                {display.unreadCount > 99 ? "99+" : display.unreadCount}
              </span>
            )}
          </div>

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
  }
);

export default ConversationItem;
