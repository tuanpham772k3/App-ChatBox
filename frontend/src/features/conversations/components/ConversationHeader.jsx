import React, { useState } from "react";
import { Search, User, Users } from "lucide-react";
import ModalCreateGroup from "./modal/ModalCreateGroup";
import ModalSearchUser from "./modal/ModalSearchUser";

const ConversationHeader = () => {
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [searchUserModalOpen, setSearchUserModalOpen] = useState(false);

  // Modal group
  const showGroupModal = () => {
    setGroupModalOpen(true);
  };

  const cancelGroupModal = () => {
    setGroupModalOpen(false);
  };

  // Modal search user
  const showSearchUserModal = () => {
    setSearchUserModalOpen(true);
  };

  const cancelSearchUserModal = () => {
    setSearchUserModalOpen(false);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-24 border-b border-[var(--color-border)]">
        <h2 className="font-bold text-2xl text-[var(--color-primary)]">Messages</h2>
        <div className="flex gap-3">
          {/* Private */}
          <button
            onClick={showSearchUserModal}
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
          <button className="flex items-center p-2 rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)] transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal */}
      <ModalCreateGroup isModalOpen={groupModalOpen} handleCancel={cancelGroupModal} />
      <ModalSearchUser
        isModalOpen={searchUserModalOpen}
        handleCancel={cancelSearchUserModal}
      />
    </>
  );
};

export default ConversationHeader;
