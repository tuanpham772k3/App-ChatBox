import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, onCancel, placeholder }) => {
  return (
    <form
      className="w-full min-w-0 flex gap-2"
      role="search"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="min-w-0 flex-1 flex items-center px-4 py-2 text-[var(--color-text-secondary)] bg-[var(--color-surface)] hover:bg-slate-100 focus-within:bg-slate-100 rounded-full border focus-within:border-[var(--color-primary)]">
        <Search size={20} className="shrink-0" />
        <input
          type="search"
          aria-label={placeholder || "Search"}
          {...(value !== undefined ? { value } : {})}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 w-full bg-transparent px-2 text-sm placeholder:text-sm"
        />
      </div>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 px-3 py-1 rounded-md font-medium bg-slate-50 hover:bg-gray-100 focus:bg-black/5 active:bg-black/10"
        >
          Đóng
        </button>
      )}
    </form>
  );
};

export default SearchBar;
