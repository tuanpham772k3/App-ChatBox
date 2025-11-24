import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteConversation,
  getConversationById,
  getConversations,
} from "./conversationsSlice";
import { clearMessages, fetchConversationMessages } from "@/features/chat/messagesSlice";

import ConversationHeader from "./components/ConversationHeader";
import ConversationSearch from "./components/ConversationSearch";
import ConversationItem from "./components/ConversationItem";

import useUserSearch from "./hooks/useUserSearch";
import { getDisplayInfo } from "./utils/conversationHelper";

const ConversationContainer = ({ activeChat, onActiveChatId }) => {
  const dispatch = useDispatch();

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

  const { user } = useSelector((state) => state.auth);
  const { conversations = [], draftConversation } = useSelector(
    (state) => state.conversations
  );

  // Xử lý select conversation
  const handleSelectConversation = (conversationId) => {
    dispatch(getConversationById(conversationId));

    dispatch(clearMessages());

    dispatch(fetchConversationMessages({ conversationId }));

    onActiveChatId(conversationId); // giữ logic hiển thị ChatWindow
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
      handleSelectConversation(existingConv._id); // hội thoại đã tồn tại
    }
  };

  // xóa conversation
  const removeConversation = (conversationId) => {
    dispatch(deleteConversation(conversationId));
  };

  return (
    <section
      className={`flex-1 flex flex-col bg-[var(--bg-primary)] rounded-lg
      ${activeChat ? "hidden" : "flex"} md:flex`}
    >
      {/* HEADER */}
      <ConversationHeader />

      {/* SEARCH BAR */}
      <ConversationSearch
        keyword={keyword}
        isFocused={isFocused}
        onSearch={handleSearch}
        onFocus={handleFocus}
        onBack={resetSearch}
      />

      {/* LIST CONVERSATIONS OR SEARCH RESULT */}
      <div className="flex flex-col px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
        {isFocused ? (
          /**------------------------------
           * DISPLAY SEARCH RESULT
           *----------------------------- */
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
            {/* === CONVERSATION LIST === */}
            {conversations.map((conversation) => {
              return (
                /** =========================
                 *     CONVERSATION ITEM
                 ============================*/
                <ConversationItem
                  key={conversation._id}
                  isActive={activeChat === conversation._id}
                  display={getDisplayInfo(conversation, user.id)}
                  onClick={() => handleSelectConversation(conversation._id)}
                  onDeleteConversation={() => removeConversation(conversation._id)}
                />
              );
            })}
          </>
        )}
      </div>
    </section>
  );
};

export default ConversationContainer;
