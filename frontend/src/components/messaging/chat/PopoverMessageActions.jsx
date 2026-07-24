import React, { useState } from "react";
import { Popover } from "antd";
import { EllipsisVertical, Pencil, Reply, Trash } from "lucide-react";
import MenuActions from "../../ui/popover/MenuActions";

const PopoverMessageActions = ({ onEditMessage, onDeleteMessage, onReplyMessage }) => {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    onDeleteMessage();
    setOpen(false);
  };

  const handleEdit = () => {
    onEditMessage();
    setOpen(false);
  };

  const handleReply = () => {
    onReplyMessage();
    setOpen(false);
  };

  const messageActions = [
    {
      id: "edit",
      Icon: Pencil,
      label: "Chỉnh sửa tin nhắn",
      onClick: handleEdit,
    },
    {
      id: "delete",
      Icon: Trash,
      label: "Thu hồi tin nhắn",
      danger: true,
      onClick: handleDelete,
    },
    {
      id: "reply",
      Icon: Reply,
      label: "Trả lời tin nhắn",
      onClick: handleReply,
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
