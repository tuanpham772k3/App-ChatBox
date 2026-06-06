import React, { useState } from "react";
import { Popover } from "antd";
import { Ellipsis } from "lucide-react";
import MenuActions from "../ui/popover/MenuActions";

const PopoverGroupActions = () => {
  const [open, setOpen] = useState(false);

  const friendActions = [
    {
      id: "classify",
      label: "Phân loại",
      onClick: () => {
        setOpen(false);
      },
    },
    {
      id: "leave",
      label: "Rời nhóm",
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

export default PopoverGroupActions;
