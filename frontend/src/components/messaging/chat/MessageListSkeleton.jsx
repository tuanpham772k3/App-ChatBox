import React from "react";
import MessageSkeleton from "./MessageSkeleton";

const MessageListSkeleton = () => {
  return (
    <ul className="flex flex-col gap-4">
      <MessageSkeleton />
      <MessageSkeleton isOwn />
      <MessageSkeleton />
      <MessageSkeleton isOwn />
      <MessageSkeleton />
      <MessageSkeleton isOwn />
      <MessageSkeleton />
    </ul>
  );
};

export default MessageListSkeleton;
