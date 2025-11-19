import React, { useRef } from "react";
import { Ellipsis } from "lucide-react";
import { createPortal } from "react-dom";
import { useFloating, offset, flip, shift, autoUpdate, arrow } from "@floating-ui/react";

const ConversationItem = ({ isActive, display, onClick, onMoreClick, isMenuOpen }) => {
  const arrowRef = useRef(null); //tham chiếu arrow

  // Xử lý định vị menu
  const { refs, floatingStyles, placement, middlewareData } = useFloating({
    placement: "bottom",
    middleware: [
      offset(12),
      flip({ fallbackPlacements: ["top", "bottom"] }),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  });

  //Xử lý khi click vào cả item
  const handleRowClick = () => {
    onClick?.();
  };

  //Xử lý click vào ellipsis
  const handleMoreClick = (e) => {
    e.stopPropagation(); // Không cho click ở ellip bubble lên row
    onMoreClick?.();
  };

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
          type="button"
          onClick={handleMoreClick}
          className={`p-1 mr-6 rounded-full  ${
            isMenuOpen
              ? "opacity-100 bg-[var(--bg-hover-primary)]"
              : "opacity-0 group-hover:opacity-100"
          } hover:bg-[var(--bg-hover-primary)] transition`}
        >
          <Ellipsis className="w-5 h-5" color="var(--color-text-secondary)" />
        </button>

        {/* Menu action */}
        {isMenuOpen &&
          createPortal(
            <div
              ref={refs.setFloating} // attach menu cho floating
              style={floatingStyles}
              onClick={(e) => e.stopPropagation()}
              className={`w-[150px] p-1 bg-[var(--bg-gray)] rounded-md z-999`}
              data-conversation-menu
            >
              {/* Arrow – tự động xoay theo placement */}
              <div
                ref={arrowRef}
                className="absolute w-3 h-3 bg-[var(--bg-gray)]"
                style={{
                  left: middlewareData.arrow?.x ?? undefined,
                  top: middlewareData.arrow?.y ?? undefined,
                  ...(placement.startsWith("top") && {
                    bottom: -6,
                    transform: "rotate(45deg)",
                    borderTop: "none",
                    borderLeft: "none",
                  }),
                  ...(placement.startsWith("bottom") && {
                    top: -6,
                    transform: "rotate(45deg)",
                    borderBottom: "none",
                    borderRight: "none",
                  }),
                }}
              />
              <button className="text-white w-full px-2 py-1 text-start hover:bg-gray-600 rounded">
                Thu hồi
              </button>
              <button className="text-white w-full px-2 py-1 text-start hover:bg-gray-600 rounded">
                Chỉnh sửa
              </button>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
};

export default ConversationItem;
