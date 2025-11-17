import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/features/chat/components/ChatWindow";
import ConversationList from "@/features/conversations/components/ConversationList";

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
        <ConversationList
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
