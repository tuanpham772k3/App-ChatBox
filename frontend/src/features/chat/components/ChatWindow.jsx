import React, { useState } from "react";
import { useSelector } from "react-redux";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { useMessages } from "../hooks/useMessages";
import {
  getDisplayInfo,
  getTypingNames,
} from "@/features/conversations/utils/conversationHelper";
import AddMembersModal from "./modal/AddMembersModal";
import ChatHeader from "./ChatHeader";
import BaseDrawer from "@/shared/components/ui/drawer/BaseDrawer";
import ConversationInfo from "./ConversationInfo";
import MembersInfo from "./MembersInfo";

const ChatWindow = ({ activeChat, onBackToList }) => {
  const {
    currentConversation,
    statusUsers = {},
    typingUsers = {},
  } = useSelector((state) => state.conversations);
  const { user } = useSelector((state) => state.auth);

  // Edit message state
  const [editingMessage, setEditingMessage] = useState({
    id: null,
    content: "",
    originalContent: "",
  });
  // Show modal, drawer state
  const [showAddMembersModal, setShowAddMembersModal] = useState(false); // "addMembers"
  const [activeDrawer, setActiveDrawer] = useState(null); // "conversationInfo" | "membersInfo" | null

  // Lấy trạng thái của đối tác và thông tin hiển thị
  const displayInfo = getDisplayInfo(currentConversation, user.id) || {};
  const partnerStatus = displayInfo.partnerId ? statusUsers[displayInfo.partnerId] : null;

  // typingUsers: { [conversationId]: { [userId]: username } }
  // const currentTypingMap = typingUsers[currentConversation?._id] || {};
  // const typingNames = getTypingNames(currentTypingMap, user.id);

  useMessages(activeChat); // Custom hook để quản lý tin nhắn realtime

  // Modal AddMembers
  const openAddMembersModal = () => setShowAddMembersModal(true);
  const closeAddMembersModal = () => setShowAddMembersModal(false);

  // Drawer handlers
  const openDrawer = (type) => setActiveDrawer(type);
  const closeDrawer = () => setActiveDrawer(null);

  return (
    <main
      className={`flex-2 bg-[var(--color-app)] flex flex-col overflow-hidden
      ${activeChat ? "flex" : "hidden"} md:flex`}
    >
      {/* --- Header --- */}
      <ChatHeader
        onBackToList={onBackToList}
        displayInfo={displayInfo}
        partnerStatus={partnerStatus}
        showModal={openAddMembersModal}
        showDrawer={openDrawer}
      />

      {/* Messages */}
      <Messages setEditingMessage={setEditingMessage} />

      {/* Input Message */}
      <MessageInput
        editingMessage={editingMessage}
        setEditingMessage={setEditingMessage}
      />

      {/* Modal */}
      <AddMembersModal
        isModalOpen={showAddMembersModal}
        handleCancel={closeAddMembersModal}
        conversationId={currentConversation?._id}
      />

      {/* Drawer */}
      <BaseDrawer
        open={activeDrawer === "ConversationInfo"}
        onClose={closeDrawer}
        title="Thông tin hội thoại"
      >
        <ConversationInfo conversation={currentConversation} currentUser={user} />
      </BaseDrawer>

      <BaseDrawer
        open={activeDrawer === "membersInfo"}
        onClose={closeDrawer}
        title="Thành viên"
      >
        <MembersInfo conversation={currentConversation} />
      </BaseDrawer>
    </main>
  );
};

export default ChatWindow;
