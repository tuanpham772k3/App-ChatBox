import React, { useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import { createPortal } from "react-dom";
import {
  offset,
  flip,
  shift,
  autoUpdate,
  arrow,
  useFloating,
  useDismiss,
  useClick,
  useInteractions,
} from "@floating-ui/react";

const MessageItem = ({ msg, isMine, showTime, onDeleteMessage, onEditClick }) => {
  const [open, setOpen] = useState(false);

  const arrowRef = useRef(null);

  const { refs, floatingStyles, placement, middlewareData, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom",
    middleware: [
      offset(12),
      flip({ fallbackPlacements: ["top", "bottom"] }),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Dùng dismiss để handle click outside, ESC, blur
  const dismiss = useDismiss(context, {
    outsidePress: true, // click ngoài sẽ đóng
    escapeKey: true,
  });

  // Nếu muốn toggle theo click vào ellipsis
  const click = useClick(context);

  // Combine các behavior
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, click]);

  const handleDelete = () => {
    onDeleteMessage(msg._id);
    setOpen(false);
  };

  const handleEdit = () => {
    onEditClick(msg);
    setOpen(false);
  };

  const avatar = msg.sender.avatarUrl?.url || "/img/default-avatar.png";
  const msgTime = new Date(msg.createdAt); // Date tin hiện tại

  // Định vị arrow
  const arrowData = middlewareData.arrow || {};
  const side = placement.split("-")[0];
  const staticSide = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  }[side];

  return (
    <React.Fragment>
      {/* ===== Display time ===== */}
      {showTime && (
        <div className="flex justify-center">
          <span className="text-xs text-[var(--color-text-secondary)]">
            {msgTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            {msgTime.toLocaleDateString([], {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
            })}
          </span>
        </div>
      )}

      {/* ===== Item Message ===== */}
      <div className={`flex gap-4 ${isMine ? "justify-end" : "items-end gap-2"} group`}>
        {/* --- Avatar ---*/}
        {!isMine && (
          <img
            src={avatar}
            alt={msg.sender.username}
            className="w-8 h-8 rounded-full object-cover cursor-pointer"
          />
        )}

        {/* --- Ellipsis + Menu ---*/}
        {isMine && !msg.isDeleted && (
          <div className="flex items-center">
            {/* Ellipsis */}
            <button
              ref={refs.setReference}
              {...getReferenceProps()}
              type="button"
              className={`p-1 rounded-full transition-opacity ${
                open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              } hover:bg-gray-700`}
            >
              <EllipsisVertical className="w-5 h-5" color="var(--color-text-secondary)" />
            </button>

            {/* Menu */}
            {open &&
              createPortal(
                <div
                  ref={refs.setFloating} // attach menu cho floating
                  style={floatingStyles}
                  {...getFloatingProps({})}
                  className="w-[150px] p-1 bg-[var(--bg-gray)] rounded-md z-[999] shadow-lg"
                  data-message-menu
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Arrow – tự động xoay theo placement */}
                  <div
                    ref={arrowRef}
                    className="absolute w-3 h-3 bg-[var(--bg-gray)] rotate-45"
                    style={{
                      left: arrowData.x != null ? `${arrowData.x}px` : "",
                      top: arrowData.y != null ? `${arrowData.y}px` : "",
                      [staticSide]: "-6px",
                    }}
                  />
                  <button
                    onClick={handleDelete}
                    className="text-white w-full px-2 py-1 text-start hover:bg-gray-600 rounded"
                  >
                    Thu hồi
                  </button>
                  <button
                    onClick={handleEdit}
                    className="text-white w-full px-2 py-1 text-start hover:bg-gray-600 rounded"
                  >
                    Chỉnh sửa
                  </button>
                </div>,
                document.body
              )}
          </div>
        )}

        {/* --- Bubble --- */}
        <div
          className={`px-3 py-2 rounded-2xl max-w-prose break-words ${
            isMine
              ? "bg-blue-600 text-[var(--color-text-primary)] rounded-tr-none"
              : "bg-[var(--bg-gray)] text-[var(--color-text-primary)] rounded-tl-none"
          }`}
        >
          <span className={msg.isDeleted ? "opacity-70" : ""}>{msg.content}</span>
          {msg.isEdited && (
            <span className="ml-1 text-[10px] opacity-70">(đã chỉnh sửa)</span>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default MessageItem;
