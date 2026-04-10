import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ConversationContainer from "@/components/conversation/ConversationsContainer";
import ChatWindow from "@/components/chat/ChatWindow";

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
        <Sidebar />

        <ConversationContainer
          activeChat={activeChat}
          onActiveChatId={handleActiveChatId}
        />

        <ChatWindow activeChat={activeChat} onBackToList={handleBackToList} />
      </div>
    </div>
  );
};

export default ChatPage;
