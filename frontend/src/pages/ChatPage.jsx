import React, { useState } from "react";
import ConversationContainer from "@/components/messaging/conversation/ConversationsContainer";
import ChatWindow from "@/components/messaging/chat/ChatWindow";

const ChatPage = () => {
  const [activeChatId, setActiveChatId] = useState(null);

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <ConversationContainer activeChatId={activeChatId} onSelectChat={setActiveChatId} />

      <ChatWindow activeChatId={activeChatId} onBack={() => setActiveChatId(null)} />
    </div>
  );
};

export default ChatPage;
