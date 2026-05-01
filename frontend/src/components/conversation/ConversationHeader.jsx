import React, { useState } from "react";
import { Search, User, UserRound, Users, UsersRound } from "lucide-react";
import SearchBar from "@/components/ui/search/SearchBar";

const ConversationHeader = ({ searchValue, onSearchChange, onOpenModal }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex items-center justify-between px-6 h-24 border-b border-[var(--color-border)]">
      {isSearchOpen ? (
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          onCancel={() => {
            setIsSearchOpen(false);
            onSearchChange("");
          }}
        />
      ) : (
        <>
          <h2 className="font-bold text-2xl text-[var(--color-primary)]">Messages</h2>
          <div className="flex gap-3">
            <button
              onClick={() => onOpenModal("private")}
              className="flex items-center p-2 rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)] transition-colors"
            >
              <UserRound size={20} />
            </button>

            <button
              onClick={() => onOpenModal("group")}
              className="flex items-center p-2 rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)] transition-colors"
            >
              <UsersRound size={20} />
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center p-2 rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)] transition-colors"
            >
              <Search size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ConversationHeader;
