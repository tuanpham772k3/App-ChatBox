import React, { useState } from "react";
import { Popover } from "antd";
import { EllipsisVertical, Pencil, Trash } from "lucide-react";
import MenuActions from "../ui/popover/MenuActions";

const PopoverMessageActions = ({ msg, onEditClick, onDeleteMessage }) => {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    onDeleteMessage(msg._id);
    setOpen(false);
  };

  const handleEdit = () => {
    onEditClick(msg);
    setOpen(false);
  };

  const messageActions = [
    {
      key: "edit",
      Icon: Pencil,
      label: "Chỉnh sửa tin nhắn",
      onClick: handleEdit,
    },
    {
      key: "delete",
      Icon: Trash,
      label: "Thu hồi tin nhắn",
      danger: true,
      onClick: handleDelete,
    },
  ];

  return (
    <Popover
      trigger="click"
      placement="bottom"
      open={open}
      onOpenChange={setOpen}
      content={<MenuActions actions={messageActions} minWidth={160} />}
    >
      <button
        type="button"
        onClick={(e) => e.stopPropagation()}
        aria-label="Open message actions"
        className="p-1 bg-[var(--color-app)] text-[var(--color-text-primary)] rounded-full border border-[var(--color-border)] shadow-xs hover:bg-[var(--color-hover)] active:bg-[var(--color-active)]"
      >
        <EllipsisVertical size={18} />
      </button>
    </Popover>
  );
};

export default PopoverMessageActions;
