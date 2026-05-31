import React, { useState } from "react";
import ConversationContainer from "@/components/messaging/conversation/ConversationsContainer";
import ChatWindow from "@/components/messaging/chat/ChatWindow";

const ChatPage = () => {
  const [activeChatId, setActiveChatId] = useState(null);

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <section
        aria-label="Conversations"
        className={`min-w-0 flex-1 ${
          activeChatId ? "hidden md:flex" : "flex"
        } md:flex-none md:w-[min(42vw,22.5rem)] lg:w-[22.5rem]`}
      >
        <ConversationContainer
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
        />
      </section>

      <section
        aria-label="Active conversation"
        className={`min-w-0 flex-1 ${activeChatId ? "flex" : "hidden md:flex"}`}
      >
        <ChatWindow activeChatId={activeChatId} onBack={() => setActiveChatId(null)} />
      </section>
    </div>
  );
};

export default ChatPage;
