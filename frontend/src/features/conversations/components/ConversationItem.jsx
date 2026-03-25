import React, { useEffect, useState } from "react";
import { Ellipsis } from "lucide-react";
import { getTypingNames } from "../utils/conversationHelper";
import { emitEvent } from "@/shared/lib/socket";
import GroupAvatar from "@/shared/components/ui/avatar/GroupAvatar";
import PopoverConversationAction from "./popover/PopoverConversationAction";

const ConversationItem = ({
  isActive,
  display,
  onSelect,
  onRemoveConversationForMe,
  typingUsers,
  currentUserId,
  partnerStatus,
}) => {
  const typingNames = getTypingNames(typingUsers, currentUserId);

  return (
    <div
      className={`group flex items-center gap-4 px-2 py-3 rounded-xl cursor-pointer transition w-full max-w-full
        ${
          isActive
            ? "bg-[var(--color-primary)]/5"
            : "hover:bg-[var(--color-hover-surface)]"
        }
      `}
      onClick={onSelect}
    >
      {/* Avatar */}
      <div className="relative">
        {display.isGroup ? (
          <GroupAvatar users={display.participants} size={48} />
        ) : (
          <img
            src={display.displayAvatar}
            alt={display.displayName}
            className="w-13 h-13 rounded-full object-cover border-2 border-[var(--color-border)]"
          />
        )}

        {partnerStatus?.status === "online" && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--color-app)] rounded-full"></span>
        )}
      </div>

      {/* Nội dung */}
      <div className="flex flex-1 justify-between items-center min-w-0">
        <div className="flex flex-col min-w-0">
          <h3 className="text-sm font-medium truncate">{display.displayName}</h3>

          <div className="flex items-center text-xs text-[var(--color-text-secondary)] min-w-0">
            {/* Phần nội dung chính (last message hoặc đang gõ) */}
            <span className="flex-1 min-w-0 max-w-60 overflow-hidden truncate">
              {typingNames.length > 0 ? (
                <span className="text-xs italic text-green-500">
                  {typingNames.join(", ")} đang gõ...
                </span>
              ) : (
                <>
                  {display.lastMsgSender && (
                    <span className="text-[var(--color-text-secondary)]">
                      {display.lastMsgSender}:{" "}
                    </span>
                  )}
                  <span>{display.lastMsgContent}</span>
                </>
              )}
            </span>

            {/* Thời gian */}
            <span className="ml-2 text-[var(--color-text-secondary)] whitespace-nowrap">
              {display.lastMsgTime}
            </span>
          </div>
        </div>

        {/* Ellipsis + Unread badge*/}
        <div className="flex items-center gap-1 ml-2 mr-2 shrink-0">
          <PopoverConversationAction onRemove={onRemoveConversationForMe}>
            {({ open }) => (
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className={`p-1 rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)] transition 
              ${
                open
                  ? "opacity-100 focus:bg-[var(--color-icon-hover-bg)] focus:text-[var(--color-icon-hover-text)]"
                  : "opacity-0 group-hover:opacity-100"
              } `}
              >
                <Ellipsis size={20} />
              </button>
            )}
          </PopoverConversationAction>

          {display.unreadCount > 0 && (
            <span className="min-w-[20px] h-5 px-1 inline-flex items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white">
              {display.unreadCount > 99 ? "99+" : display.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
