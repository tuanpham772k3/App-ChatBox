import React from "react";
import { Skeleton } from "antd";

const MessageSkeleton = ({ isOwn = false }) => {
  return (
    <li className={`flex w-full mb-3 ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className="flex items-start gap-3 max-w-[75%]">
        {!isOwn && <Skeleton.Avatar active size={40} />}

        <div className="flex flex-col gap-1">
          <Skeleton.Input
            active
            size="small"
            style={{
              width: isOwn ? 180 : 220,
              height: 50,
              borderRadius: 12,
            }}
          />
        </div>
      </div>
    </li>
  );
};

export default MessageSkeleton;
