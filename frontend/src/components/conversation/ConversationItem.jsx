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
    <li>
      <div
        className={`group w-full min-w-0 max-w-full flex rounded-lg transition-colors ${
          isActive ? "bg-[var(--color-primary)]/5" : "hover:bg-gray-100"
        }`}
      >
        {/* ====== Content ====== */}
        <button
          type="button"
          onClick={onSelect}
          className="min-w-0 flex-1 flex items-center gap-2 px-2 py-3"
        >
          {/* Avatar */}
          <span className="relative shrink-0">
            {display.isGroup ? (
              <GroupAvatar users={display.participants} size={50} />
            ) : (
              <img
                src={display.displayAvatar}
                alt={display.displayName}
                className="w-12 h-12 rounded-full object-cover border-1 border-[var(--color-border)]"
              />
            )}

            {isOnline && (
              <span
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--color-app)] rounded-full"
                aria-label="Online"
              />
            )}
          </span>

          {/* Name + LastMessage */}
          <span className="flex-1 flex flex-col gap-1 min-w-0 text-left">
            <span className={`truncate text-sm ${unreadCount > 0 && "font-medium"}`}>
              {display.displayName}
            </span>

            <span
              className={`truncate text-xs shrink-0 ${
                unreadCount > 0 ? "text-gray-900" : "text-[var(--color-text-secondary)]"
              }`}
            >
              {display.lastMsgSender && (
                <>
                  {display.lastMsgSender}: <span>{display.lastMsgContent}</span>
                </>
              )}
            </span>
          </span>
        </button>

        {/* ====== Metadata ====== */}
        <div className="flex flex-col shrink-0 items-end justify-between gap-2 py-3 pr-2 sm:pr-3">
          {/* Top row */}
          <div className="relative flex h-5 items-center justify-end gap-1">
            <time className="touch-hide whitespace-nowrap text-[11px] text-[var(--color-text-secondary)] transition-opacity duration-150 hidden lg:block lg:group-hover:opacity-0">
              {display.lastMsgTime}
            </time>

            <div className="touch-always-visible lg:absolute lg:right-0 flex items-center justify-center lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150">
              <PopoverConversationAction
                isPinned={isPinned}
                onTogglePin={onTogglePin}
                onMarkUnread={onMarkUnread}
                onClearHistory={onClearHistory}
                onRemove={onRemove}
              >
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Open conversation actions"
                  className="hover:bg-slate-200 transition-colors"
                >
                  <Ellipsis size={20} />
                </button>
              </PopoverConversationAction>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex min-h-5 items-center gap-1">
            {isPinned && (
              <span className="text-[var(--color-primary)] shrink-0" title="Đã ghim">
                <Pin size={14} className="rotate-45" />
              </span>
            )}

            {unreadCount > 0 && (
              <span className="min-w-5 h-5 px-1 text-[10px] flex items-center justify-center rounded-full bg-red-600 text-white font-medium">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default ConversationItem;
