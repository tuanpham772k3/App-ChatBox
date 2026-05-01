import React, { useState } from "react";
import { Popover } from "antd";
import { BrushCleaning, MailCheck, Pin, Trash } from "lucide-react";

const PopoverConversationAction = ({
  children,
  isPinned,
  onTogglePin,
  onMarkUnread,
  onClearHistory,
  onRemove,
}) => {
  const [open, setOpen] = useState(false);

  const handleAction = (callback) => (e) => {
    e.stopPropagation();
    callback?.();
    setOpen(false);
  };

  return (
    <Popover
      trigger="click"
      placement="bottom"
      open={open}
      onOpenChange={setOpen}
      content={
        <>
          <div
            onClick={(e) => e.stopPropagation()}
            className="space-y-1 text-[var(--color-text-primary)]"
          >
            <button
              onClick={handleAction(onTogglePin)}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[var(--color-hover-surface)] rounded"
            >
              <Pin size={20} />
              <span>{isPinned ? "Bỏ ghim hội thoại" : "Ghim hội thoại"}</span>
            </button>
            <button
              onClick={handleAction(onMarkUnread)}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[var(--color-hover-surface)] rounded"
            >
              <MailCheck size={20} />
              <span>Đánh dấu chưa đọc</span>
            </button>
            <button
              onClick={handleAction(onClearHistory)}
              className="flex items-center gap-2 w-full px-3 py-2 text-red-500 hover:bg-[var(--color-hover-surface)] rounded"
            >
              <BrushCleaning size={20} />
              <span>Xóa lịch sử trò chuyện</span>
            </button>
            <button
              onClick={handleAction(onRemove)}
              className="flex items-center gap-2 w-full px-3 py-2 text-red-500 hover:bg-[var(--color-hover-surface)] rounded"
            >
              <Trash size={20} />
              <span>Xóa hội thoại</span>
            </button>
          </div>
        </>
      }
      className="self-center"
    >
      {children({ open })}
    </Popover>
  );
};

export default PopoverConversationAction;
