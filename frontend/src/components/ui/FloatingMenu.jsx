import React from "react";
import { createPortal } from "react-dom";

const FloatingMenu = ({
  open,
  refs,
  floatingStyles,
  getFloatingProps,
  arrowRef,
  arrowStyle,
  actions,
  width = 200,
}) => {
  if (!open) return null;

  const content = (
    <div
      ref={refs.setFloating} // attach menu cho floating
      style={floatingStyles}
      {...getFloatingProps({
        onClick(e) {
          e.stopPropagation();
        },
      })}
      className="p-1 bg-[var(--bg-gray)] rounded-md z-50"
      data-floating-menu
    >
      {/* Arrow – tự động xoay theo placement */}
      <div
        ref={arrowRef}
        className="absolute w-3 h-3 bg-[var(--bg-gray)] rotate-45"
        style={arrowStyle}
      />
      <div style={{ width: `${width}px` }}>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick && action.onClick();
            }}
            className="text-white w-full px-2 py-1 text-start hover:bg-gray-600 rounded"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default FloatingMenu;
