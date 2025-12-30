import React, { useState } from "react";
import { Search, User, Users } from "lucide-react";
import ModalCreateGroup from "./modal/ModalCreateGroup";
import ModalCreatePrivate from "./modal/ModalSearchUser";
import SearchBar from "@/shared/components/ui/search/SearchBar";

const ConversationHeader = () => {
  const [modalCreate, setModalCreate] = useState("default"); // "default" | "group" | "private"
  const [searchBar, setSearchBar] = useState("default"); // "default" | "search"

  // Modal group
  const showGroupModal = () => {
    setModalCreate("group");
  };

  // Modal private
  const showPrivateModal = () => {
    setModalCreate("private");
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-24 border-b border-[var(--color-border)]">
        {/* Tiêu đề & Actions */}
        {searchBar === "default" && (
          <>
            <h2 className="font-bold text-2xl text-[var(--color-primary)]">Messages</h2>
            <div className="flex gap-3">
              {/* Private */}
              <button
                onClick={showPrivateModal}
                className="flex items-center p-2 rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)] transition-colors"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Group */}
              <button
                onClick={showGroupModal}
                className="flex items-center p-2 rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)] transition-colors"
              >
                <Users className="w-5 h-5" />
              </button>

              {/* Search */}
              <button
                onClick={() => setSearchBar("search")}
                className="flex items-center p-2 rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {/* Thanh Tìm kiếm */}
        {searchBar === "search" && (
          <SearchBar onCancel={() => setSearchBar("default")} />
        )}
      </div>

      {/* Modal */}
      <ModalCreateGroup
        isModalOpen={modalCreate === "group"}
        onCancel={() => setModalCreate("default")}
      />
      <ModalCreatePrivate
        isModalOpen={modalCreate === "private"}
        onCancel={() => setModalCreate("default")}
      />
    </>
  );
};

export default ConversationHeader;
