import React, { useState } from "react";
import { User, Users } from "lucide-react";
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
      <div className="flex items-center justify-between px-4 py-3 text-[var(--color-text-primary)]">
        <h2 className="font-bold text-2xl">Chat</h2>
        <div className="flex gap-3">
          {/* Search user */}
          <button
            onClick={showSearchUserModal}
            className="flex items-center rounded-full bg-[var(--bg-gray)] p-2 hover:bg-[var(--bg-hover-primary)] transition-colors"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Group */}
          <button
            onClick={showGroupModal}
            className="flex items-center rounded-full bg-[var(--bg-gray)] p-2 hover:bg-[var(--bg-hover-primary)] transition-colors"
          >
            <Users className="w-5 h-5" />
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
