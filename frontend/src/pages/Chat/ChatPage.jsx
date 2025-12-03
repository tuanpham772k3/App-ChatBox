import React, { useState } from "react";
import Sidebar from "@/shared/components/layout/Sidebar";
import ChatWindow from "@/features/chat/components/ChatWindow";
import ConversationContainer from "@/features/conversations/ConversationsContainer";

const ChatPage = () => {
  const [activeChat, setActiveChat] = useState(null);

  const handleActiveChatId = (chatId) => {
    setActiveChat(chatId);
  };

  const handleBackToList = () => {
    setActiveChat(null);
  };

  return (
    <div className="w-full h-screen p-4 bg-[var(--bg-black)]">
      <div className="w-full h-full flex justify-center gap-4">
        {/* Sidebar */}
        <Sidebar />

        {/* Conversations List */}
        <ConversationContainer
          activeChat={activeChat}
          onActiveChatId={handleActiveChatId}
          onBackToList={handleBackToList}
        />

        {/* Chat Window */}
        <ChatWindow activeChat={activeChat} onBackToList={handleBackToList} />
      </div>
    </div>
  );
};

export default ChatPage;
