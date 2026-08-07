import React from "react";
import { Skeleton } from "antd";

const ConversationSkeleton = () => {
  return (
    <li className="min-w-0 max-w-full flex items-center gap-3 px-2 py-3 rounded-lg">
      <Skeleton.Avatar active size={50} />
      <div className="flex-1 min-w-0">
        <Skeleton active title={{ width: "45%" }} paragraph={{ rows: 1, width: "75%" }} />
      </div>
    </li>
  );
};

const ConversationListSkeleton = () => {
  return (
    <ul className="flex-1 flex flex-col gap-1 px-2 pt-6">
      <ConversationSkeleton />
      <ConversationSkeleton />
      <ConversationSkeleton />
      <ConversationSkeleton />
      <ConversationSkeleton />
      <ConversationSkeleton />
    </ul>
  );
};

export default ConversationListSkeleton;
