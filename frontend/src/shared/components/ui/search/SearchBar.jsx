import { Search } from "lucide-react";
import React from "react";

const SearchBar = ({ onCancel }) => {
  return (
    <div className="flex-1 flex items-center gap-2">
      <div className="flex-1 flex items-center gap-1 p-2 bg-[var(--color-chat)] rounded-md border-2 border-[var(--color-border)] focus-within:border-[var(--color-primary)]">
        <Search size={18} />
        <input
          autoFocus
          type="text"
          placeholder="Tìm kiếm..."
          className="flex-1 pe-4 placeholder:text-sm text-sm"
        />
      </div>
      <button
        onClick={onCancel}
        className="px-6 py-2 rounded-md font-medium bg-[var(--color-chat)] hover:bg-[var(--color-icon-hover-bg)]"
      >
        Đóng
      </button>
    </div>
  );
};

export default SearchBar;
