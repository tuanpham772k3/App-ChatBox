import React from "react";

const MenuActions = ({ actions, minWidth = 160 }) => {
  return (
    <div className="flex flex-col" style={{ minWidth }}>
      {actions.map((action) => (
        <button
          key={action.key}
          onClick={() => action.onClick()}
          className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--color-text-primary)] 
            hover:bg-[var(--color-hover-surface)] rounded ${
              action.danger ? "text-red-600" : ""
            }`}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default MenuActions;
