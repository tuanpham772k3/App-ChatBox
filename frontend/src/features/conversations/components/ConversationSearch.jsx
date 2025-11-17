import React from "react";
import { CornerUpLeft, Search } from "lucide-react";

const ConversationSearch = ({
  keyword,
  isFocused,
  onSearch,
  onFocus,
  onBack,
}) => {
  return (
    <>
      {/* Search bar */}
      <div className="px-4 pb-3 flex items-center gap-2">
        {isFocused && (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-9 h-9 rounded-full 
            bg-[var(--bg-gray)] hover:bg-[var(--bg-hover-primary)] 
            text-[var(--color-text-primary)] transition-colors"
          >
            <CornerUpLeft className="w-5 h-5" />
          </button>
        )}

        <div
          className="flex-1 flex items-center gap-2 
          text-[var(--color-text-secondary)] 
          rounded-3xl bg-[var(--bg-gray)] px-4 py-1 transition-all duration-200"
        >
          <Search className="w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm trên Messenger"
            className="placeholder:text-[var(--color-text-secondary)] focus:outline-none bg-transparent flex-1"
            value={keyword}
            onFocus={onFocus}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default ConversationSearch;
