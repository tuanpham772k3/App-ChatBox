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
      className="p-1 bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-md z-50"
      data-floating-menu
    >
      {/* Arrow – tự động xoay theo placement */}
      <div
        ref={arrowRef}
        className="absolute w-3 h-3 bg-[var(--color-surface)] rotate-45"
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
            className="w-full px-2 py-1 text-start rounded hover:bg-[var(--color-icon-hover-bg)]"
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
