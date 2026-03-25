import React, { useState } from "react";
import { Popover } from "antd";

const PopoverConversationAction = ({ children, onRemove }) => {
  const [open, setOpen] = useState(false);

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
            <button className="flex items-center gap-2 w-full px-3 py-2  hover:bg-[var(--color-hover-surface)] rounded">
              Ghim hội thoại
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[var(--color-hover-surface)] rounded">
              Đánh dấu chưa đọc
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[var(--color-hover-surface)] rounded">
              Phân loại
            </button>
            <button
              onClick={onRemove}
              className="flex items-center gap-2 w-full px-3 py-2 text-red-500 hover:bg-[var(--color-hover-surface)] rounded"
            >
              Xóa hội thoại
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
