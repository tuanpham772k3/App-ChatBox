import React from "react";
import { Ellipsis, Pin } from "lucide-react";
import GroupAvatar from "@/components/ui/avatar/GroupAvatar";
import PopoverConversationAction from "./PopoverConversationAction";

const ConversationItem = ({
  isActive,
  display,
  onSelect,
  onRemove,
  onTogglePin,
  onMarkUnread,
  onClearHistory,
  isOnline,
}) => {
  const isPinned = Boolean(display.currentUser?.pinnedAt);
  const unreadCount = display.currentUser?.unreadCount || 0;

  return (
    <li className="w-full">
      <div
        className={`group w-full max-w-full flex items-center gap-2 p-2 rounded-xl cursor-pointer transition
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

          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--color-app)] rounded-full"></span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 justify-between items-center min-w-0">
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-medium truncate">{display.displayName}</h3>

            <div className="flex items-center text-xs text-[var(--color-text-secondary)] min-w-0">
              {/* Main Content (Last Message or Typing) */}
              <span className="flex-1 min-w-0 max-w-60 overflow-hidden truncate">
                {display.lastMsgSender && (
                  <>
                    <span className="text-[var(--color-text-secondary)]">
                      {display.lastMsgSender}:{" "}
                    </span>
                    <span>{display.lastMsgContent}</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Ellipsis + Unread badge*/}
          <div className="flex items-center gap-1 ml-2 mr-2 shrink-0">
            <div className="grid">
              <PopoverConversationAction
                isPinned={isPinned}
                onTogglePin={onTogglePin}
                onMarkUnread={onMarkUnread}
                onClearHistory={onClearHistory}
                onRemove={onRemove}
              >
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

              {unreadCount > 0 && (
                <span className="min-w-5 h-5 flex items-center justify-center rounded-full bg-red-600 text-[12px] text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>

            {isPinned && (
              <span className="text-[var(--color-primary)]" title="Đã ghim">
                <Pin size={16} />
              </span>
            )}

            {/* Time */}
            <time className="ml-2 text-[var(--color-text-secondary)] whitespace-nowrap">
              {display.lastMsgTime}
            </time>
          </div>
        </div>
      </div>
    </li>
  );
};

export default ConversationItem;
