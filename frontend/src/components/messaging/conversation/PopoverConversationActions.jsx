import React, { useState } from "react";
import { Popover } from "antd";
import { BrushCleaning, Ellipsis, MailCheck, Pin, PinOff, Trash } from "lucide-react";
import MenuActions from "../../ui/popover/MenuActions";

const PopoverConversationActions = ({
  isPinned,
  onTogglePin,
  onMarkUnread,
  onClearHistory,
  onRemove,
}) => {
  const [open, setOpen] = useState(false);

  const conversationActions = [
    {
      id: "pin",
      Icon: isPinned ? PinOff : Pin,
      label: isPinned ? "Bỏ ghim hội thoại" : "Ghim hội thoại",
      onClick: () => {
        onTogglePin();
        setOpen(false);
      },
    },
    {
      id: "mark_unread",
      Icon: MailCheck,
      label: "Đánh dấu chưa đọc",
      onClick: () => {
        onMarkUnread();
        setOpen(false);
      },
    },
    {
      id: "clear_history",
      Icon: BrushCleaning,
      label: "Xóa lịch sử trò chuyện",
      onClick: () => {
        onClearHistory();
        setOpen(false);
      },
    },
    {
      id: "delete",
      Icon: Trash,
      label: "Xóa hội thoại",
      danger: true,
      onClick: () => {
        onRemove();
        setOpen(false);
      },
    },
  ];

  return (
    <Popover
      trigger="click"
      placement="bottom"
      open={open}
      onOpenChange={setOpen}
      content={<MenuActions actions={conversationActions} minWidth={160} />}
    >
      <button
        type="button"
        onClick={(e) => e.stopPropagation()}
        aria-label="Open conversation actions"
        className="p-1 bg-transparent text-[var(--color-text-primary)] rounded-sm
        border border-[var(--color-border)] shadow-xs
        hover:bg-[var(--color-hover-elevated)] active:bg-[var(--color-active)] transition-colors"
      >
        <Ellipsis size={18} />
      </button>
    </Popover>
  );
};

export default PopoverConversationActions;
