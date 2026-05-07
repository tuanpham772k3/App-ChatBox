import React, { useEffect, useState } from "react";
import { Drawer, Grid } from "antd";
import Sidebar from "@/components/layout/Sidebar";
import ConversationContainer from "@/components/conversation/ConversationsContainer";
import ChatWindow from "@/components/chat/ChatWindow";

const { useBreakpoint } = Grid;

const ChatPage = () => {
  const screens = useBreakpoint();

  const [activeChatId, setActiveChatId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (screens.md) {
      setIsSidebarOpen(false);
    }
  }, [screens.md]);

  return (
    <div className="min-h-screen h-dvh flex overflow-hidden">
      <div className="shrink-0">
        <Sidebar />
      </div>

      <Drawer
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        placement="left"
        width={224}
        closable={false}
        styles={{ body: { padding: 0 } }}
        rootClassName="lg:hidden"
        destroyOnHidden
      >
        <Sidebar mode="mobile" onClose={() => setIsSidebarOpen(false)} />
      </Drawer>

      <div
        className={`min-w-0 flex-1 ${
          activeChatId ? "hidden md:flex" : "flex"
        } md:flex-none md:w-[min(42vw,22.5rem)] lg:w-[22.5rem]`}
      >
        <ConversationContainer
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      </div>

      <div className={`min-w-0 flex-1 ${activeChatId ? "flex" : "hidden md:flex"}`}>
        <ChatWindow activeChatId={activeChatId} onBack={() => setActiveChatId(null)} />
      </div>
    </div>
  );
};

export default ChatPage;
