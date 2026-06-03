import React from "react";
import { Outlet } from "react-router-dom";
import ConversationContainer from "@/components/messaging/conversation/ConversationsContainer";

const MessagingLayout = () => {
  return (
    <div className="min-h-0 min-w-0 flex flex-1">
      <ConversationContainer />

      <div className="min-h-0 min-w-0 flex flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default MessagingLayout;
