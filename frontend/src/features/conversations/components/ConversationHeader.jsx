import React, { useState } from "react";
import { Search, User, Users } from "lucide-react";
import ModalCreateGroup from "./modal/ModalCreateGroup";
import ModalCreatePrivate from "./modal/ModalSearchUser";
import SearchBar from "@/shared/components/ui/search/SearchBar";

const ConversationHeader = ({ searchValue, onSearchChange }) => {
  const [openModal, setOpenModal] = useState(null); // "group" | "private" | null
  const [openSearch, setOpenSearch] = useState(false);

  // Open Modal group
  const openModalGroup = () => setOpenModal("group");
  const closeModalGroup = () => setOpenModal(null);
  // Open Modal private
  const openModalPrivate = () => setOpenModal("private");
  const closeModalPrivate = () => setOpenModal(null);
  // Open search
  const openSearchBar = () => setOpenSearch(true);
  const closeSearchBar = () => setOpenSearch(false);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-24 border-b border-[var(--color-border)]">
        {openSearch ? (
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            onCancel={closeSearchBar}
          />
        ) : (
          <>
            {/* Title & Actions */}
            <h2 className="font-bold text-2xl text-[var(--color-primary)]">Messages</h2>
            <div className="flex gap-3">
              {/* Private */}
              <button
                onClick={openModalGroup}
                className="flex items-center p-2 rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)] transition-colors"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Group */}
              <button
                onClick={openModalPrivate}
                className="flex items-center p-2 rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)] transition-colors"
              >
                <Users className="w-5 h-5" />
              </button>

              {/* Search */}
              <button
                onClick={openSearchBar}
                className="flex items-center p-2 rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <ModalCreateGroup isOpenModal={openModal === "group"} onCancel={closeModalGroup} />
      <ModalCreatePrivate
        isOpenModal={openModal === "private"}
        onCancel={closeModalPrivate}
      />
    </>
  );
};

export default ConversationHeader;
