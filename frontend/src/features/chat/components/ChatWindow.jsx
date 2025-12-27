import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ArrowLeft, PanelRight, Phone, Users, Video } from "lucide-react";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { useMessages } from "../hooks/useMessages";
import { getDisplayInfo, getTypingNames } from "@/features/conversations/utils/conversationHelper";
import AddMembersModal from "./modal/AddMembersModal";

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

  // Tìm đối tác trong cuộc trò chuyện hiện tại
  const displayInfo = getDisplayInfo(currentConversation, user.id);
  const partnerId = displayInfo?.partner?.user?._id;
  const partnerStatus = partnerId ? statusUsers[partnerId] : null; // Lấy trạng thái của đối tác

  // typingUsers: { [conversationId]: { [userId]: username } }
  const currentTypingMap = typingUsers[currentConversation?._id] || {};
  const typingNames = getTypingNames(currentTypingMap, user.id);

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
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-24 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          {/* Nút Back chỉ hiện trên mobile */}
          <button
            onClick={onBackToList}
            className="md:hidden mr-2 text-[var(--color-text-primary)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <div className="relative">
            <img
              src={displayInfo.displayAvatar}
              alt={displayInfo.displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
            {partnerStatus?.status === "online" && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--color-app)] rounded-full" />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h3 className="text-[var(--color-text-primary)] font-semibold">
              {displayInfo.displayName || "Người dùng ẩn danh"}
            </h3>
            {/* Trạng thái người dùng + đang gõ */}
            {typingNames.length > 0 ? (
              <span className="text-xs italic text-green-500">
                {typingNames.join(", ")} đang gõ...
              </span>
            ) : (
              <span className="text-xs text-[var(--color-text-secondary)]">
                {partnerStatus?.status === "online" ? "Đang hoạt động" : "Ngoại tuyến"}
              </span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          {currentConversation.type === "group" && (
            // Nếu type = group thì add members
            <button className="p-2 rounded-full hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)]">
              <Users onClick={showModal} className=" w-5 h-5" />
            </button>
          )}
          <button className="p-2 rounded-full hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)]">
            <Phone className=" w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)]">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)]">
            <PanelRight className="w-5 h-5" />
          </button>
        </div>
      </div>

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
        conversationId={currentConversation._id}
      />
    </main>
  );
};

export default ChatWindow;
