import React from "react";
import { Outlet } from "react-router-dom";
import ConversationContainer from "@/components/messaging/conversation/ConversationsContainer";

const MessagingLayout = () => {
  return (
    <div className="h-full flex">
      <ConversationContainer />

      <Outlet />
    </div>
  );
};

export default MessagingLayout;
