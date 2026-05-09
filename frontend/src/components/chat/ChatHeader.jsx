import React from "react";
import { PanelRight, Search, UserPlus, UsersRound, Video } from "lucide-react";
import { SlArrowLeft } from "react-icons/sl";
import GroupAvatar from "@/components/ui/avatar/GroupAvatar";

const ChatHeader = ({
  onBack,
  onOpenConversationInfo,
  onOpenAddMembers,
  onOpenMembersInfo,
  displayInfo,
  typingNames,
  isOnline,
}) => {
  const typingText =
    typingNames.length > 2
      ? `${typingNames.slice(0, 2).join(", ")} +${typingNames.length - 2}`
      : typingNames.join(", ");

  return (
    <header className="h-16 sm:h-20 transition-all flex items-center justify-between gap-2 px-3 sm:px-4 border-b border-[var(--color-border)]">
      <div className="min-w-0 flex-1 flex items-center gap-4 sm:gap-3">
        {/* Back button (only visible on mobile) */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="md:hidden shrink-0 p-2 rounded-full text-[var(--color-text-primary)] hover:bg-gray-100 focus:bg-black/5 active:bg-black/10"
        >
          <SlArrowLeft size={18} />
        </button>

        {/* ===== AVATAR ===== */}
        <div className="relative hidden sm:flex">
          {displayInfo.isGroup ? (
            <GroupAvatar users={displayInfo.participants} size={48} />
          ) : (
            <>
              <img
                src={displayInfo.displayAvatar}
                alt={displayInfo.displayName}
                className="w-12 h-12 shrink-0 rounded-full border-2 border-[var(--color-border)]"
              />
              {isOnline && (
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--color-app)] rounded-full"
                  aria-label="Online"
                />
              )}
            </>
          )}
        </div>

        {/* ===== INFO ===== */}
        <div className="flex flex-col min-w-0">
          {/* Name */}
          <h2 className="truncate text-sm md:text-base lg:text-lg font-semibold text-[var(--color-text-primary)]">
            {displayInfo.displayName}
          </h2>

          {/* Typing or status */}
          {typingText ? (
            <span className="text-xs md:text-sm text-green-500 italic animate-pulse truncate">
              {typingText} đang nhập...
            </span>
          ) : displayInfo.isGroup ? (
            <button
              onClick={onOpenMembersInfo}
              type="button"
              className="min-w-0 truncate flex items-center gap-1 text-xs md:text-sm text-[var(--color-text-primary)] hover:text-blue-500 transition-colors"
            >
              <UsersRound size={16} className="shrink-0" />
              <span>{`${displayInfo.participants.length} thành viên`}</span>
            </button>
          ) : (
            <span className="text-xs md:text-sm text-[var(--color-text-secondary)]">
              {isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
            </span>
          )}
        </div>
      </div>

      {/* ============ ACTION ========== */}
      <div className="shrink-0 flex items-center gap-1 sm:gap-2 text-[var(--color-text-secondary)]">
        {/* --- Add members (GROUP) --- */}
        {displayInfo.isGroup && (
          <button
            onClick={onOpenAddMembers}
            type="button"
            aria-label="Add members"
            className="hidden lg:flex p-2 rounded-full hover:bg-gray-100 active:bg-black/10"
          >
            <UserPlus size={20} />
          </button>
        )}
        <button
          type="button"
          aria-label="Start video call"
          className="p-2 rounded-full hover:bg-gray-100 focus:bg-black/5 active:bg-black/10"
        >
          <Video size={20} />
        </button>
        <button
          type="button"
          aria-label="Search in conversation"
          className="p-2 rounded-full hover:bg-gray-100 focus:bg-black/5 active:bg-black/10"
        >
          <Search size={20} />
        </button>
        <button
          type="button"
          onClick={onOpenConversationInfo}
          aria-label="Open conversation information"
          className="p-2 rounded-full hover:bg-gray-100 focus:bg-black/5 active:bg-black/10"
        >
          <PanelRight size={20} />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
