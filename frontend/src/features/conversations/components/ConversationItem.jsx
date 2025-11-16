import React from "react";

const ConversationItem = ({
  key,
  isActive,
  partner,
  displayName,
  displayAvatar,
  lastMsgSender,
  lastMsgContent,
  lastMsgTime,
  onClick,
}) => {
  return (
    <div
      key={key}
      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition hover:bg-[var(--bg-hover-secondary)] ${
        isActive ? "bg-[var(--bg-hover-secondary)]" : ""
      }`}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative">
        <img
          src={displayAvatar}
          alt={displayName}
          className="w-12 h-12 rounded-full object-cover"
        />
        {partner?.status === "active" && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-black)] rounded-full"></span>
        )}
      </div>

      {/* Nội dung */}
      <div className="flex flex-col flex-1 min-w-0">
        <h3 className="text-sm text-[var(--color-text-primary)] font-medium truncate">
          {displayName}
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
          {lastMsgSender && (
            <span className="font-medium text-[var(--color-text-primary)] mr-1">
              {lastMsgSender}:
            </span>
          )}
          {lastMsgContent}
          <span className="ml-2 text-[var(--color-text-secondary)] whitespace-nowrap">
            {lastMsgTime}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ConversationItem;
