import React from "react";
import { Outlet } from "react-router-dom";
import ConversationContainer from "@/components/messaging/conversation/ConversationsContainer";

const MessagingLayout = () => {
  return (
    <div className="flex flex-1">
      <ConversationContainer />

      <Outlet />
    </div>
  );
};

export default MessagingLayout;
