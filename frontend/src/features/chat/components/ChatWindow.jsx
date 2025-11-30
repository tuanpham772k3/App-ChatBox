import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ArrowLeft, Ellipsis, Phone, Video } from "lucide-react";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { useMessages } from "../hooks/useMessages";

const ChatWindow = ({ activeChat, onBackToList }) => {
  const {
    currentConversation,
    statusUsers = {},
    typingUsers = {},
  } = useSelector((state) => state.conversations);
  const { user } = useSelector((state) => state.auth);

  //edit state
  const [editMessageId, setEditMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editOriginalContent, setEditOriginalContent] = useState("");

  // Tìm đối tác trong cuộc trò chuyện hiện tại
  const partner = currentConversation?.participants?.find((p) => p._id !== user.id);
  const partnerStatus = statusUsers[partner?._id]; // Lấy trạng thái của đối tác

  // typingUsers: { [conversationId]: { [userId]: username } }
  const currentTypingMap = typingUsers[currentConversation?._id] || {};
  const typingNames = Object.values(currentTypingMap).filter(
    ([userId]) => userId !== user.id
  );

  useMessages(activeChat); // Custom hook để quản lý tin nhắn

  return (
    <main
      className={`flex-[2] bg-[var(--bg-primary)] flex flex-col rounded-lg overflow-hidden
      ${activeChat ? "flex" : "hidden"} md:flex`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
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
              src={partner?.avatarUrl?.url}
              alt={partner?.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            {partnerStatus?.status === "online" && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-primary)] rounded-full"></span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h3 className="text-[var(--color-text-primary)] font-semibold">
              {partner?.username || "Người dùng ẩn danh"}
            </h3>
            {/* Trạng thái người dùng + đang gõ */}
            {typingNames.length > 0 ? (
              <span className="text-xs italic text-[var(--color-primary)]">
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
        <div className="flex items-center gap-3 text-[var(--color-text-primary)]">
          <button className="hover:bg-[var(--bg-hover-primary)] p-2 rounded-full">
            <Phone className=" w-5 h-5" />
          </button>
          <button className="hover:bg-[var(--bg-hover-primary)] p-2 rounded-full">
            <Video className="w-5 h-5" />
          </button>
          <button className="hover:bg-[var(--bg-hover-primary)] p-2 rounded-full">
            <Ellipsis className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ===== Messages ====== */}
      <Messages
        setEditMessageId={setEditMessageId}
        setEditContent={setEditContent}
        setEditOriginalContent={setEditOriginalContent}
      />

      {/* ===== Input Message ====== */}
      <MessageInput
        editMessageId={editMessageId}
        editContent={editContent}
        setEditMessageId={setEditMessageId}
        setEditContent={setEditContent}
        editOriginalContent={editOriginalContent}
      />
    </main>
  );
};

export default ChatWindow;
