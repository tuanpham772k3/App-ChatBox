import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, onCancel, placeholder }) => {
  return (
    <div className="w-full min-w-0 flex gap-2">
      <div className="min-w-0 flex-1 flex items-center px-4 py-2 bg-[var(--color-chat)] hover:bg-slate-200 text-[var(--color-text-secondary)] rounded-full border focus-within:border-[var(--color-primary)]">
        <Search size={20} className="shrink-0" />
        <input
          type="text"
          {...(value !== undefined ? { value } : {})}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 w-full bg-transparent px-2 text-sm placeholder:text-sm"
        />
      </div>
      {onCancel && (
        <button
          onClick={onCancel}
          className="shrink-0 px-3 py-1 rounded-md font-medium bg-[var(--color-chat)] hover:bg-[var(--color-icon-hover-bg)]"
        >
          Đóng
        </button>
      )}
    </div>
  );
};

export default SearchBar;
