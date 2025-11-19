import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearDraftConversation,
  getConversationById,
  getConversations,
  setDraftConversation,
} from "./conversationsSlice";
import { clearMessages, fetchConversationMessages } from "@/features/chat/messagesSlice";

import ConversationHeader from "./components/ConversationHeader";
import ConversationSearch from "./components/ConversationSearch";
import DraftConversation from "./components/DraftConversation";
import ConversationItem from "./components/ConversationItem";

import useUserSearch from "./hooks/useUserSearch";
import { getDisplayInfo } from "./utils/conversationHelper";

const ConversationContainer = ({ activeChat, onActiveChatId }) => {
  const dispatch = useDispatch();
  const [openMenuId, setOpenMenuId] = useState(null);

  const menuRef = useRef(null);

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
    } else {
      dispatch(setDraftConversation(user)); // tạo hội thoại giả
      onActiveChatId("draft"); // để hiển thị ChatWindow
    }
  };

  // Mở menu
  const openMoreMenu = (conversationId) => {
    setOpenMenuId(conversationId);
  };

  // Click ngoài → đóng menu (chỉ 1 listener cho toàn app)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.closest("[data-conversation-menu]")
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            {/* === DRAFT CONVERSATION LIST  === */}
            {draftConversation && (
              <DraftConversation
                isActive={activeChat === "draft"}
                avatar={draftConversation.avatarUrl?.url}
                username={draftConversation.username}
                onSelectDraft={() => onActiveChatId("draft")}
                onDeleteDraft={() => dispatch(clearDraftConversation())}
              />
            )}

            {/* === REAL CONVERSATION LIST === */}
            {conversations.map((conversation) => {
              return (
                /** =========================
                 *     CONVERSATION ITEM
                 ============================*/
                <div
                  key={conversation._id}
                  ref={openMenuId === conversation._id ? menuRef : null}
                >
                  <ConversationItem
                    isActive={activeChat === conversation._id}
                    display={getDisplayInfo(conversation, user.id)}
                    onClick={() => handleSelectConversation(conversation._id)}
                    onMoreClick={() => openMoreMenu(conversation._id)}
                    isMenuOpen={openMenuId === conversation._id}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>
    </section>
  );
};

export default ConversationContainer;
