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

const ChatWindow = ({ activeChat, onBackToList }) => {
  const {
    currentConversation,
    statusUsers = {},
    typingUsers = {},
  } = useSelector((state) => state.conversations);
  const { user } = useSelector((state) => state.auth);

  // Edit state
  const [editMessageId, setEditMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editOriginalContent, setEditOriginalContent] = useState("");
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lấy trạng thái của đối tác và thông tin hiển thị
  const displayInfo = getDisplayInfo(currentConversation, user.id) || {};
  const partnerStatus = displayInfo.partnerId
    ? statusUsers[displayInfo.partnerId]
    : null;

  // typingUsers: { [conversationId]: { [userId]: username } }
  // const currentTypingMap = typingUsers[currentConversation?._id] || {};
  // const typingNames = getTypingNames(currentTypingMap, user.id);

  useMessages(activeChat); // Custom hook để quản lý tin nhắn realtime

  // Modal group
  const showModal = () => {
    setIsModalOpen(true);
  };

  const cancelModal = () => {
    setIsModalOpen(false);
  };

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
        showModal={showModal}
      />

      {/* Messages */}
      <Messages
        setEditMessageId={setEditMessageId}
        setEditContent={setEditContent}
        setEditOriginalContent={setEditOriginalContent}
      />

      {/* Input Message */}
      <MessageInput
        editMessageId={editMessageId}
        editContent={editContent}
        setEditMessageId={setEditMessageId}
        setEditContent={setEditContent}
        editOriginalContent={editOriginalContent}
      />

      {/* Modal */}
      <AddMembersModal
        isModalOpen={isModalOpen}
        handleCancel={cancelModal}
        conversationId={currentConversation?._id}
      />
    </main>
  );
};

export default ChatWindow;
