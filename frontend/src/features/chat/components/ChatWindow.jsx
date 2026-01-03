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
  const { currentConversation = {}, statusUsers = {} } = useSelector(
    (state) => state.conversations
  );
  const user = useSelector((state) => state.auth.user) || {};

  const [editingMessage, setEditingMessage] = useState({
    id: null,
    content: "",
    originalContent: "",
  });
  const [openModal, setOpenModal] = useState(false); // "addMembers"
  const [openDrawer, setOpenDrawer] = useState(null); // "conversationInfo" | "membersInfo" | null

  // typingUsers: { [conversationId]: { [userId]: username } }
  // const currentTypingMap = typingUsers[currentConversation?._id] || {};
  // const typingNames = getTypingNames(currentTypingMap, user.id);

  // Message realtime
  useMessages(activeChat);

  const displayInfo = getDisplayInfo(currentConversation, user.id) || {};
  const partnerStatus = displayInfo.partnerId ? statusUsers[displayInfo.partnerId] : null;

  // Open Modal AddMembers
  const openAddMembersModal = () => setOpenModal(true);
  const closeAddMembersModal = () => setOpenModal(false);
  // Open Drawer
  const openDrawerInfo = (type) => setOpenDrawer(type);
  const closeDrawerInfo = () => setOpenDrawer(null);

  return (
    <main
      className={`flex-2 bg-[var(--color-app)] flex flex-col overflow-hidden
      ${activeChat ? "flex" : "hidden"} md:flex`}
    >
      {/* --- Header --- */}
      <ChatHeader
        onBackToList={onBackToList}
        openDrawerInfo={openDrawerInfo}
        openModal={openAddMembersModal}
        displayInfo={displayInfo}
        partnerStatus={partnerStatus}
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
        isOpenModal={openModal}
        onCancel={closeAddMembersModal}
        conversationId={currentConversation?._id}
      />

      {/* Drawer conversation info */}
      <BaseDrawer
        open={openDrawer === "conversationInfo"}
        onClose={closeDrawerInfo}
        title="Thông tin hội thoại"
      >
        <ConversationInfo conversation={currentConversation} currentUser={user} />
      </BaseDrawer>

      {/* Drawer members info */}
      <BaseDrawer
        open={openDrawer === "membersInfo"}
        onClose={closeDrawerInfo}
        title="Thành viên"
      >
        <MembersInfo conversation={currentConversation} />
      </BaseDrawer>
    </main>
  );
};

export default ChatWindow;
