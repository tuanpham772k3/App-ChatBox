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
    <div className="w-full h-screen">
      <div className="w-full h-full flex justify-center">
        {/* Sidebar */}
        <Sidebar />

        {/* Conversations List */}
        <ConversationContainer
          activeChat={activeChat}
          onActiveChatId={handleActiveChatId}
        />

        {/* Chat Window */}
        <ChatWindow activeChat={activeChat} onBackToList={handleBackToList} />
      </div>
    </div>
  );
};

export default ChatPage;
