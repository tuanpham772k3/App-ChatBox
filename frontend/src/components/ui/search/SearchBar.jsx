import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, onCancel, placeholder }) => {
  return (
    <div className="w-full flex gap-2">
      <div className="w-full flex items-center px-4 py-2 bg-[var(--color-chat)] hover:bg-slate-200 text-[var(--color-text-secondary)] rounded-full border focus-within:border-[var(--color-primary)]">
        <Search size={20} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-2 text-sm placeholder:text-sm"
        />
      </div>
      {onCancel && (
        <button
          onClick={onCancel}
          className="px-3 py-1 rounded-md font-medium bg-[var(--color-chat)] hover:bg-[var(--color-icon-hover-bg)]"
        >
          Đóng
        </button>
      )}
    </div>
  );
};

export default SearchBar;
