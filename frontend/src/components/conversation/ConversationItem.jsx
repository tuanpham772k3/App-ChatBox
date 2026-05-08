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
      <article
        className={`relative group w-full max-w-full rounded-xl transition ${
          isActive ? "bg-[var(--color-primary)]/10" : "hover:bg-gray-100"
        }`}
        aria-current={isActive ? "true" : undefined}
      >
        <button
          type="button"
          onClick={onSelect}
          className="w-full max-w-full flex items-center gap-2 px-2 py-3 pr-10 sm:pr-14 rounded-xl text-left focus:bg-gray-100"
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
          <span className="flex-1 flex flex-col gap-1 min-w-0">
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

        {/* Popover + Time + UnreadCount + Pin */}
        <div className="absolute right-2 top-2 flex flex-col items-end gap-2 shrink-0 pointer-events-none">
          {/* Row 1: Time (default) ↔ Popover (on hover) */}
          <div className="relative h-5 flex items-center justify-end">
            <time className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap group-hover:opacity-0 transition-opacity duration-150">
              {display.lastMsgTime}
            </time>

            <div className="absolute inset-0 flex items-center justify-end opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150 pointer-events-auto">
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
                  className="p-1 rounded-full hover:bg-slate-200 transition"
                >
                  <Ellipsis size={20} />
                </button>
              </PopoverConversationAction>
            </div>
          </div>

          {/* Row 2: Pin icon + Unread badge */}
          <div className="flex items-center gap-1">
            {isPinned && (
              <span className="text-[var(--color-primary)]" title="Đã ghim">
                <Pin size={14} className="rotate-45" />
              </span>
            )}

            {unreadCount > 0 && (
              <span className="w-4 h-4 flex items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </div>
      </article>
    </li>
  );
};

export default ConversationItem;
