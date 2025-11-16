import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaFacebook } from "react-icons/fa";
import { SlNote } from "react-icons/sl";
import {
  clearDraftConversation,
  getConversationById,
  getConversations,
  setDraftConversation,
} from "../conversationsSlice";
import { clearMessages, fetchConversationMessages } from "@/features/chat/messagesSlice";
import ConversationSearch from "./ConversationSearch";
import useUserSearch from "../hooks/useUserSearch";
import ConversationHeader from "./ConversationHeader";

const ConversationList = ({ activeChat, onSelectChat, onBackToList }) => {
  const {
    keyword,
    isFocused,
    loading,
    searchResults,
    setIsFocused,
    handleSearch,
    handleFocus,
    resetSearch,
  } = useUserSearch();

  const dispatch = useDispatch();

  /** Conversations */
  const { user } = useSelector((state) => state.auth);
  const { conversations = [], draftConversation } = useSelector(
    (state) => state.conversations
  );

  // Xử lý select conversation
  const handleSelectChat = (conversationId) => {
    dispatch(getConversationById(conversationId));

    dispatch(clearMessages());

    dispatch(fetchConversationMessages({ conversationId }));

    onSelectChat(conversationId); // giữ logic hiển thị ChatWindow
  };

  // Xử lý logic gọi api lấy danh sách hội thoại khi giao diện vừa bật lên
  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  // Khi click user trong search
  const handleSelectUserFromSearch = (user) => {
    setIsFocused(false);
    const existingConv = conversations.find((conv) =>
      conv.participants.some((p) => p._id === user._id)
    );

    if (existingConv) {
      handleSelectChat(existingConv._id); // hội thoại đã tồn tại
    } else {
      dispatch(setDraftConversation(user)); // tạo hội thoại giả
      onSelectChat("draft"); // để hiển thị ChatWindow
    }
  };

  // Xử lý xóa draftConversation
  const handleDeleteDraft = (e) => {
    e.stopPropagation();
    dispatch(clearDraftConversation());
    onBackToList(); // quay về danh sách => activeChat = null
  };

  return (
    <section
      className={`flex-1 flex flex-col bg-[var(--bg-primary)] rounded-lg
      ${activeChat ? "hidden" : "flex"} md:flex`}
    >
      {/* Header */}
      <ConversationHeader />
      
      {/* Search bar */}
      <ConversationSearch
        keyword={keyword}
        isFocused={isFocused}
        handleSearch={handleSearch}
        handleFocus={handleFocus}
        resetSearch={resetSearch}
      />

      {/* List conversations or users */}
      <div className="flex flex-col px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
        {isFocused ? (
          <div className="text-[var(--color-text-secondary)]">
            <p className="text-sm mb-2">Gợi ý liên hệ</p>
            {loading && <p>Kết quả tìm kiếm cho {keyword}</p>}
            {searchResults.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-[var(--bg-hover-secondary)] transition"
                onClick={() => handleSelectUserFromSearch(user)}
              >
                <img
                  src={user.avatarUrl?.url || "/img/default-avatar.png"}
                  alt={user.username}
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-[var(--color-text-primary)] font-medium">
                  {user.username}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* === HIỂN THỊ HỘI THOẠI TẠM TRƯỚC === */}
            {draftConversation && (
              <div
                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-[var(--bg-hover-secondary)] transition  ${
                  activeChat === "draft" ? "bg-[var(--bg-hover-secondary)]" : ""
                }`}
                onClick={() => onSelectChat("draft")} // mở ChatWindow
              >
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={draftConversation.avatarUrl?.url || "/img/default-avatar.png"}
                    alt={draftConversation.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>

                {/* Nội dung */}
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-sm text-[var(--color-text-primary)] font-medium">
                    Tin nhắn mới đến {draftConversation.username}
                  </p>
                </div>

                {/* Nút hủy */}
                <button
                  onClick={(e) => handleDeleteDraft(e)}
                  className="text-[var(--color-text-secondary)] hover:text-red-500 transition"
                >
                  &#10005;
                </button>
              </div>
            )}

            {/* === DANH SÁCH HỘI THOẠI THẬT === */}
            {conversations.map((conversation) => {
              // Lấy ra người đối diện (với private chat)
              const partner = conversation.participants.find((p) => p._id !== user.id);

              // Nếu là group thì hiển thị khác
              const isGroup = conversation.type === "group";
              const displayName = isGroup
                ? conversation.name
                : partner?.username || "Người dùng";
              const displayAvatar = isGroup
                ? conversation.avatar?.url || "/img/group-default.png"
                : partner?.avatarUrl?.url || "/img/default-avatar.png";

              // Thông tin tin nhắn cuối
              const lastMsg = conversation.lastMessage;
              const lastMsgSender = lastMsg?.sender?.username || "";
              const lastMsgContent = lastMsg?.content || "Chưa có tin nhắn";
              const lastMsgTime = lastMsg?.createdAt
                ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <div
                  key={conversation._id}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition hover:bg-[var(--bg-hover-secondary)] ${
                    activeChat === conversation._id
                      ? "bg-[var(--bg-hover-secondary)]"
                      : ""
                  }`}
                  onClick={() => handleSelectChat(conversation._id)}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {partner?.status === "active" && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-black)] rounded-full"></span>
                    )}
                  </div>

                  {/* Nội dung */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-sm text-[var(--color-text-primary)] font-medium truncate">
                      {displayName}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
                      {lastMsgSender && (
                        <span className="font-medium text-[var(--color-text-primary)] mr-1">
                          {lastMsgSender}:
                        </span>
                      )}
                      {lastMsgContent}
                      <span className="ml-2 text-[var(--color-text-secondary)] whitespace-nowrap">
                        {lastMsgTime}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </section>
  );
};

export default ConversationList;
