import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MessageSquareText } from "lucide-react";
import {
  deleteConversation,
  getConversationById,
  getConversations,
  markConversationAsRead,
} from "./conversationsSlice";
import { clearMessages, fetchConversationMessages } from "@/features/chat/messagesSlice";
import ConversationHeader from "./components/ConversationHeader";
import ConversationItem from "./components/ConversationItem";
import { getDisplayInfo } from "./utils/conversationHelper";
import { Spin } from "antd";

const ConversationContainer = ({ activeChat, onActiveChatId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    conversations = [],
    typingUsers = {},
    statusUsers = {},
    loading,
    error,
  } = useSelector((state) => state.conversations);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Lấy danh sách hội thoại
  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  // Click chọn hội thoại -> hiển thị ChatWindow
  const handleSelectConversation = (conversationId) => {
    dispatch(getConversationById(conversationId));

    dispatch(clearMessages());

    dispatch(fetchConversationMessages({ conversationId }));

    dispatch(markConversationAsRead({ conversationId, userId: user.id }));

    onActiveChatId(conversationId); // giữ logic hiển thị ChatWindow
  };

  // Xóa hội thoại
  const removeConversation = (conversationId) => {
    dispatch(deleteConversation(conversationId));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Lọc Hội thoại
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;

    const keyword = searchTerm.toLowerCase();

    return conversations.filter((conversation) => {
      const displayInfo = getDisplayInfo(conversation, user.id);

      if (!displayInfo) return;

      return (
        displayInfo.displayName?.toLowerCase().includes(keyword) ||
        displayInfo.lastMsgContent?.toLowerCase().includes(keyword)
      );
    });
  }, [conversations, user.id, searchTerm]);

  return (
    <section
      className={`flex-1 flex flex-col bg-[var(--color-app)] border-r border-[var(--color-border)]
      ${activeChat ? "hidden" : "flex"} md:flex`}
    >
      {/* --- HEADER --- */}
      <ConversationHeader searchValue={searchInput} onSearchChange={setSearchInput} />

      {/* LIST CONVERSATIONS */}
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <Spin />
        </div>
      ) : (
        <div className="px-4 py-8">
          {/* Title */}
          <div className="flex items-center gap-2 px-2 mb-2 text-xs text-[var(--color-text-secondary)]">
            <MessageSquareText className="w-3 h-3" />
            <p>Tất cả tin nhắn</p>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
            {filteredConversations.length === 0 ? (
              <div className="text-center text-[var(--color-text-secondary)] mt-8">
                Không có cuộc trò chuyện nào
              </div>
            ) : (
              <>
                {filteredConversations.map((conversation) => {
                  const typingInThisConversation = typingUsers[conversation._id] || null;

                  const displayInfo = getDisplayInfo(conversation, user.id) || {};
                  const partnerStatus = displayInfo.partnerId
                    ? statusUsers[displayInfo.partnerId]
                    : null;

                  return (
                    // CONVERSATION ITEM
                    <ConversationItem
                      key={conversation._id}
                      isActive={activeChat === conversation._id}
                      display={displayInfo}
                      onClick={() => handleSelectConversation(conversation._id)}
                      onDeleteConversation={() => removeConversation(conversation._id)}
                      typingUsers={typingInThisConversation}
                      currentUserId={user.id}
                      partnerStatus={partnerStatus}
                      conversationId={conversation._id}
                    />
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ConversationContainer;
