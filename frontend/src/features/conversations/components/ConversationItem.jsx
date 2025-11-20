import React, { useRef, useState } from "react";
import { Ellipsis } from "lucide-react";
import { createPortal } from "react-dom";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  arrow,
  useInteractions,
  useClick,
  useDismiss,
} from "@floating-ui/react";

const ConversationItem = ({ isActive, display, onClick, onDeleteConversation }) => {
  const [open, setOpen] = useState(false);

  const arrowRef = useRef(null); //tham chiếu arrow

  // Xử lý định vị menu
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

  //Xử lý khi click vào cả item
  const handleRowClick = () => {
    onClick?.();
  };

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
    <div
      className={`group flex items-center gap-3 p-2 rounded-md cursor-pointer transition hover:bg-[var(--bg-hover-secondary)] ${
        isActive ? "bg-[var(--bg-hover-secondary)]" : ""
      }`}
      onClick={handleRowClick}
    >
      {/* Avatar */}
      <div className="relative">
        <img
          src={display.displayAvatar}
          alt={display.displayName}
          className="w-12 h-12 rounded-full object-cover"
        />
        {display.partner?.status === "active" && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-black)] rounded-full"></span>
        )}
      </div>

      {/* Nội dung */}
      <div className="flex flex-1 justify-between items-center min-w-0">
        <div className="flex flex-col">
          <h3 className="text-sm text-[var(--color-text-primary)] font-medium truncate">
            {display.displayName}
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
            {display.lastMsgSender && (
              <span className="font-medium text-[var(--color-text-primary)] mr-1">
                {display.lastMsgSender}:
              </span>
            )}
            {display.lastMsgContent}
            <span className="ml-2 text-[var(--color-text-secondary)] whitespace-nowrap">
              {display.lastMsgTime}
            </span>
          </p>
        </div>

        {/* Ellipsis */}
        <button
          ref={refs.setReference}
          {...getReferenceProps({
            onClick(e) {
              e.stopPropagation();
            },
          })}
          type="button"
          className={`p-1 mr-6 rounded-full  ${
            open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          } hover:bg-[var(--bg-hover-primary)] transition`}
        >
          <Ellipsis className="w-5 h-5" color="var(--color-text-secondary)" />
        </button>

        {/* Menu action */}
        {open &&
          createPortal(
            <div
              ref={refs.setFloating} // attach menu cho floating
              style={floatingStyles}
              {...getFloatingProps({
                onClick(e) {
                  e.stopPropagation();
                },
              })}
              className={`w-[344px] p-1 bg-[var(--bg-gray)] rounded-md z-999`}
              data-conversation-menu
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
              <button className="text-white w-full px-2 py-1 text-start hover:bg-gray-600 rounded">
                Đánh dấu chưa đọc
              </button>
              <button
                onClick={onDeleteConversation}
                className="text-white w-full px-2 py-1 text-start hover:bg-gray-600 rounded"
              >
                Xóa đoạn chat
              </button>
              <button className="text-white w-full px-2 py-1 text-start hover:bg-gray-600 rounded">
                Xem trang cá nhân
              </button>
              <button className="text-white w-full px-2 py-1 text-start hover:bg-gray-600 rounded">
                Lưu trữ đoạn chat
              </button>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
};

export default ConversationItem;
