import React from "react";

const MenuActions = ({ actions, minWidth = 160 }) => {
  return (
    <div className="flex flex-col gap-1" style={{ minWidth }}>
      {actions.map((action) => {
        const Icon = action.Icon;

        return (
          <button
            key={action.key}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--color-text-primary)]
            hover:bg-[var(--color-hover)] rounded ${action.danger ? "text-red-600" : ""}`}
          >
            {Icon && <Icon size={18} />}
            {action.label}
          </button>
        );
      })}
    </div>
  );
};

export default MenuActions;
