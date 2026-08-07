import React from "react";
import { Skeleton } from "antd";

const ChatHeaderSkeleton = () => {
  return (
    <header className="shrink-0 h-16 sm:h-20 flex items-center justify-between px-3 border-b border-[var(--color-border)] bg-[var(--color-app)]">
      {/* ===== LEFT ===== */}
      <div className="min-w-0 flex items-center gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          <Skeleton.Avatar active size={48} />
        </div>

        {/* Name + status */}
        <div className="flex flex-col gap-1">
          <Skeleton.Input
            active
            size="small"
            style={{
              width: 120,
              height: 18,
            }}
          />

          <Skeleton.Input
            active
            size="small"
            style={{
              width: 90,
              height: 14,
            }}
          />
        </div>
      </div>

      {/* ===== ACTIONS ===== */}
      <div className="shrink-0 flex items-center gap-1 sm:gap-2">
        <Skeleton.Button active shape="circle" size="small" />

        <Skeleton.Button active shape="circle" size="small" />

        <Skeleton.Button active shape="circle" size="small" />
      </div>
    </header>
  );
};

export default ChatHeaderSkeleton;
