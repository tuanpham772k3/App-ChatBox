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
            type="button"
            onClick={() => {
              onTogglePin(), setOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[var(--color-hover)] rounded"
          >
            {isPinned ? <PinOff size={20} /> : <Pin size={20} />}
            <span>{isPinned ? "Bỏ ghim hội thoại" : "Ghim hội thoại"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onMarkUnread(), setOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[var(--color-hover)] rounded"
          >
            <MailCheck size={20} />
            <span>Đánh dấu chưa đọc</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClearHistory(), setOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-red-500 hover:bg-[var(--color-hover)] rounded"
          >
            <BrushCleaning size={20} />
            <span>Xóa lịch sử trò chuyện</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onRemove(), setOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-red-500 hover:bg-[var(--color-hover)] rounded"
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
