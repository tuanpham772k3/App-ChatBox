import React from "react";
import { Pin } from "lucide-react";
import GroupAvatar from "@/components/ui/avatar/GroupAvatar";
import PopoverConversationAction from "./PopoverConversationActions";
import UserAvatar from "@/components/ui/avatar/UserAvatar";

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
    <li
      className={`group min-w-0 max-w-full flex-1 flex items-center justify-between px-2 py-3 cursor-pointer rounded-lg transition-colors ${
        isActive
          ? "bg-[var(--color-primary)]/10"
          : "hover:bg-[var(--color-hover)] focus:bg-[var(--color-primary)]/10"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex flex-1 items-center gap-3 text-left"
      >
        {/* Avatar */}
        <span className="relative shrink-0">
          {display.isGroup ? (
            <GroupAvatar users={display.participants} size={50} />
          ) : (
            <UserAvatar
              name={display.displayName || "Người dùng"}
              avatarUrl={display.displayAvatar}
              size={50}
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
          <span
            className={`truncate text-sm text-[var(--color-text-primary)] ${
              unreadCount > 0 && "font-medium"
            }`}
          >
            {display.displayName}
          </span>

          <span
            className={`truncate text-xs shrink-0 ${
              unreadCount > 0
                ? "text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)]"
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

      <div onClick={onSelect} className="min-w-7 flex shrink-0 flex-col items-end gap-1">
        {/* Top row */}
        <div className="relative w-full flex items-center justify-end">
          <time className="touch-hide whitespace-nowrap text-[11px] text-[var(--color-text-secondary)] hidden lg:block lg:group-hover:opacity-0 transition-opacity duration-150">
            {display.lastMsgTime}
          </time>

          <div className="touch-always-visible lg:absolute lg:right-0 flex items-center justify-center lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150">
            <PopoverConversationAction
              isPinned={isPinned}
              onTogglePin={onTogglePin}
              onMarkUnread={onMarkUnread}
              onClearHistory={onClearHistory}
              onRemove={onRemove}
            />
          </div>
        </div>

        {/* Bottom row */}
        <div className="min-h-5 flex items-center gap-1">
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
    </li>
  );
};

export default ConversationItem;
