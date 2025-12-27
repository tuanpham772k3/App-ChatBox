import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteConversation,
  getConversationById,
  getConversations,
  markConversationAsRead,
} from "./conversationsSlice";
import { clearMessages, fetchConversationMessages } from "@/features/chat/messagesSlice";

import ConversationHeader from "./components/ConversationHeader";
import ConversationSearch from "./components/ConversationSearch";
import ConversationItem from "./components/ConversationItem";

import { getDisplayInfo } from "./utils/conversationHelper";
import { MessageSquareText } from "lucide-react";

const ConversationContainer = ({ activeChat, onActiveChatId }) => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const {
    conversations = [],
    typingUsers = {},
    statusUsers = {},
  } = useSelector((state) => state.conversations);

  // Lấy danh sách hội thoại
  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  // Xử lý select conversation
  const handleSelectConversation = (conversationId) => {
    dispatch(getConversationById(conversationId));

    dispatch(clearMessages());

    dispatch(fetchConversationMessages({ conversationId }));

    dispatch(markConversationAsRead({ conversationId, userId: user.id }));

    onActiveChatId(conversationId); // giữ logic hiển thị ChatWindow
  };

  // xóa conversation
  const removeConversation = (conversationId) => {
    dispatch(deleteConversation(conversationId));
  };

  return (
    <section
      className={`flex-1 flex flex-col bg-[var(--color-app)] border-r border-[var(--color-border)]
      ${activeChat ? "hidden" : "flex"} md:flex`}
    >
      {/* HEADER */}
      <ConversationHeader />

      {/* SEARCH BAR */}
      {/* <ConversationSearch /> */}

      {/* LIST CONVERSATIONS */}
      <div className="px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-2 px-2 mb-2 text-[var(--color-text-secondary)] text-xs">
          <MessageSquareText className="w-3 h-3" />
          <p className="">All message</p>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
          {conversations.length === 0 ? (
            <div className="text-center text-[var(--color-text-secondary)] mt-8">
              Không có cuộc trò chuyện nào
            </div>
          ) : (
            <>
              {conversations.map((conversation) => {
                const typingInThisConversation = typingUsers[conversation._id] || null;

                const displayInfo = getDisplayInfo(conversation, user.id);
                const partnerId = displayInfo.partner?.user?._id;
                const partnerStatus = partnerId ? statusUsers[partnerId] : null;

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
    </section>
  );
};

export default ConversationContainer;
