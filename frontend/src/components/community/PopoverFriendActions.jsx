import React, { useState } from "react";
import { Popover } from "antd";
import { Ellipsis } from "lucide-react";
import MenuActions from "../ui/popover/MenuActions";

const PopoverFriendActions = () => {
  const [open, setOpen] = useState(false);

  const friendActions = [
    {
      id: "information",
      label: "Xem thông tin",
      onClick: () => {
        setOpen(false);
      },
    },
    {
      id: "delete",
      label: "Xóa bạn",
      danger: true,
      onClick: () => {
        setOpen(false);
      },
    },
  ];

  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      open={open}
      onOpenChange={setOpen}
      content={<MenuActions actions={friendActions} minWidth={160} />}
    >
      <button
        type="button"
        onClick={(e) => e.stopPropagation()}
        aria-label="Open friend actions"
        className="p-2 shadow-xs rounded-sm border border-[var(--color-border)]
        bg-transparent text-[var(--color-text-primary)]
        hover:bg-[var(--color-hover-elevated)] active:bg-[var(--color-active)] transition-colors"
      >
        <Ellipsis size={18} />
      </button>
    </Popover>
  );
};

export default PopoverFriendActions;
