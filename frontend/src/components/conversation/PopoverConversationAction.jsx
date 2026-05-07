import React, { useState } from "react";
import { Popover } from "antd";
import { BrushCleaning, MailCheck, Pin, PinOff, Trash } from "lucide-react";

const PopoverConversationAction = ({
  children,
  isPinned,
  onTogglePin,
  onMarkUnread,
  onClearHistory,
  onRemove,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      trigger="click"
      placement="bottom"
      open={open}
      onOpenChange={setOpen}
      content={
        <div
          onClick={(e) => e.stopPropagation()}
          className="space-y-1 text-[var(--color-text-primary)]"
        >
          <button
            onClick={onTogglePin}
            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-black/10 rounded"
          >
            {isPinned ? <PinOff size={20} /> : <Pin size={20} />}
            <span>{isPinned ? "Bỏ ghim hội thoại" : "Ghim hội thoại"}</span>
          </button>
          <button
            onClick={onMarkUnread}
            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-black/10 rounded"
          >
            <MailCheck size={20} />
            <span>Đánh dấu chưa đọc</span>
          </button>
          <button
            onClick={onClearHistory}
            className="flex items-center gap-2 w-full px-3 py-2 text-red-500 hover:bg-black/10 rounded"
          >
            <BrushCleaning size={20} />
            <span>Xóa lịch sử trò chuyện</span>
          </button>
          <button
            onClick={onRemove}
            className="flex items-center gap-2 w-full px-3 py-2 text-red-500 hover:bg-black/10 rounded"
          >
            <Trash size={20} />
            <span>Xóa hội thoại</span>
          </button>
        </div>
      }
    >
      {children}
    </Popover>
  );
};

export default PopoverConversationAction;
