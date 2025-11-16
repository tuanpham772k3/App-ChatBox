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
import { getDisplayInfo } from "../utils/conversationHelper";
import ConversationItem from "./ConversationItem";

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
              // Chuẩn hoá dữ liệu hiển thị cho mỗi conversation item
              const {
                partner,
                displayName,
                displayAvatar,
                lastMsgSender,
                lastMsgContent,
                lastMsgTime,
              } = getDisplayInfo(conversation, user.id);

              return (
                /** =========================
                 *     CONVERSATION ITEM
                 ============================*/
                <ConversationItem
                  key={conversation._id}
                  isActive={activeChat === conversation._id}
                  partner={partner}
                  displayName={displayName}
                  displayAvatar={displayAvatar}
                  lastMsgSender={lastMsgSender}
                  lastMsgContent={lastMsgContent}
                  lastMsgTime={lastMsgTime}
                  onClick={() => handleSelectChat(conversation._id)}
                />
              );
            })}
          </>
        )}
      </div>
    </section>
  );
};

export default ConversationList;
