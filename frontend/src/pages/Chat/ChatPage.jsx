import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ConversationList from "@/features/conversations/components/ConversationList";
import ChatWindow from "@/features/chat/components/ChatWindow";

const ChatPage = () => {
  const [activeChat, setActiveChat] = useState(null);

  const handleSelectChat = (chatId) => {
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
        <ConversationList
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onBackToList={handleBackToList}
        />

        {/* Chat Window */}
        <ChatWindow activeChat={activeChat} onBackToList={handleBackToList} />
      </div>
    </div>
  );
};

export default ChatPage;
