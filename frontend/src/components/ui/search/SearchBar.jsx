import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, onCancel, placeholder }) => {
  return (
    <form
      className="w-full min-w-0 flex gap-2"
      role="search"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="min-w-0 flex-1 flex items-center px-4 py-2 text-[var(--color-text-secondary)] bg-[var(--color-surface)] hover:bg-[var(--color-hover)] focus-within:bg-[var(--color-hover)] rounded-full border border-[var(--color-border)] focus-within:border-[var(--color-primary)]">
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
          className="shrink-0 px-3 py-1 rounded-md font-medium bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] focus:bg-[var(--color-hover)] active:bg-[var(--color-active)]"
        >
          Đóng
        </button>
      )}
    </form>
  );
};

export default SearchBar;
