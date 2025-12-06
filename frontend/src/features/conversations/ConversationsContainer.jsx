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
import { emitEvent } from "@/shared/lib/socket";

const ConversationContainer = ({ activeChat, onActiveChatId }) => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const {
    conversations = [],
    typingUsers = {},
    statusUsers = {},
  } = useSelector((state) => state.conversations);

  // Xử lý logic gọi api lấy danh sách hội thoại khi giao diện vừa bật lên
  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  // Join tất cả các phòng conversation khi có danh sách conversation
  useEffect(() => {
    if (!conversations.length) return;

    conversations.forEach((conversation) => {
      emitEvent("join_conversation", conversation._id);
    });
  }, [conversations]);

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
      className={`flex-1 flex flex-col bg-[var(--bg-primary)] rounded-lg
      ${activeChat ? "hidden" : "flex"} md:flex`}
    >
      {/* HEADER */}
      <ConversationHeader />

      {/* SEARCH BAR */}
      <ConversationSearch />

      {/* LIST CONVERSATIONS */}
      <div className="flex flex-col px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            Không có cuộc trò chuyện nào
          </div>
        ) : (
          <>
            {conversations.map((conversation) => {
              const typingInThisConversation = typingUsers[conversation._id] || null;

              const displayInfo = getDisplayInfo(conversation, user.id);
              const partnerId = displayInfo.partner?._id;
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
