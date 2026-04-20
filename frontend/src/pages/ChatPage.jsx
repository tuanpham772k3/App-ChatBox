import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ConversationContainer from "@/components/conversation/ConversationsContainer";
import ChatWindow from "@/components/chat/ChatWindow";

const ChatPage = () => {
  const [activeChatId, setActiveChatId] = useState(null);

  return (
    <div className="w-full h-screen flex justify-center">
      <Sidebar />

      <ConversationContainer activeChatId={activeChatId} onSelectChat={setActiveChatId} />

      <ChatWindow activeChatId={activeChatId} onBack={() => setActiveChatId(null)} />
    </div>
  );
};

export default ChatPage;
