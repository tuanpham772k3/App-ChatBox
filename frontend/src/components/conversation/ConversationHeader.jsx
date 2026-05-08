import React, { useState } from "react";
import { Menu, Search, UserRound, UsersRound } from "lucide-react";
import SearchBar from "@/components/ui/search/SearchBar";

const ConversationHeader = ({
  searchValue,
  onSearchChange,
  onOpenModal,
  onOpenSidebar,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="h-16 sm:h-20 flex items-center justify-between gap-3 px-6 border-b border-[var(--color-border)]">
      {isSearchOpen ? (
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          onCancel={() => {
            setIsSearchOpen(false);
            onSearchChange("");
          }}
          placeholder="Tìm kiếm hội thoại..."
        />
      ) : (
        <>
          <div className="min-w-0 flex items-center gap-3">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={onOpenSidebar}
              className="flex lg:hidden size-10 shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-black/10"
            >
              <Menu size={22} />
            </button>
            <h1 className="min-w-0 truncate font-bold text-2xl text-[var(--color-primary)]">
              Messages
            </h1>
          </div>
          <div className="shrink-0 flex gap-2 sm:gap-3">
            <button
              title="Tạo hội thoại đơn"
              type="button"
              aria-label="Create private conversation"
              onClick={() => onOpenModal("private")}
              className="flex items-center p-2 rounded-full bg-[var(--color-app)] text-[var(--color-text-secondary)] hover:bg-black/10 transition-colors"
            >
              <UserRound size={20} />
            </button>

            <button
              title="Tạo nhóm chat"
              type="button"
              aria-label="Create group conversation"
              onClick={() => onOpenModal("group")}
              className="flex items-center p-2 rounded-full bg-[var(--color-app)] text-[var(--color-text-secondary)] hover:bg-black/10 transition-colors"
            >
              <UsersRound size={20} />
            </button>

            <button
              title="Tìm kiếm hội thoại"
              type="button"
              aria-label="Search conversations"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center p-2 rounded-full bg-[var(--color-app)] text-[var(--color-text-secondary)] hover:bg-black/10 transition-colors"
            >
              <Search size={20} />
            </button>
          </div>
        </>
      )}
    </header>
  );
};

export default ConversationHeader;
