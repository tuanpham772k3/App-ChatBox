import React from "react";
import { ArrowLeft, PanelRight, Phone, UserRound, Users, Video } from "lucide-react";
import GroupAvatar from "@/components/ui/avatar/GroupAvatar";

const ChatHeader = ({
  onBack,
  onOpenConversationInfo,
  onOpenAddMembers,
  onOpenMembersInfo,
  displayInfo,
  partnerStatus,
}) => {
  return (
    <div className="flex items-center justify-between px-4 h-24 border-b border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        {/* Back button (only visible on mobile) */}
        <button
          onClick={onBack}
          className="md:hidden mr-2 text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={20} />
        </button>

        {/* ===== AVATAR ===== */}
        <div className="relative">
          {displayInfo.isGroup ? (
            <GroupAvatar users={displayInfo.participants || []} size={48} />
          ) : (
            <>
              <img
                src={displayInfo.displayAvatar}
                alt={displayInfo.displayName}
                className="w-13 h-13 rounded-full border-2 border-[var(--color-border)]"
              />
              {partnerStatus?.status === "online" && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--color-app)] rounded-full" />
              )}
            </>
          )}
        </div>

        {/* ===== INFO ===== */}
        <div className="flex flex-col">
          <h3 className="text-[var(--color-text-primary)] font-semibold">
            {displayInfo.displayName}
          </h3>

          {/* USER STATUS OR NUMBER */}
          {displayInfo.isGroup ? (
            <button
              onClick={onOpenMembersInfo}
              type="button"
              className="flex items-center gap-1 text-[var(--color-text-secondary)]"
            >
              <UserRound size={18} />
              <span className="text-sm">{`${displayInfo.participants.length} thành viên`}</span>
            </button>
          ) : (
            <span className="text-xs text-[var(--color-text-secondary)]">
              {partnerStatus?.status === "online" ? "Đang hoạt động" : "Ngoại tuyến"}
            </span>
          )}
        </div>
      </div>

      {/* ============ ACTION ========== */}
      <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
        {/* --- Add members (GROUP) --- */}
        {displayInfo.isGroup && (
          <button
            onClick={onOpenAddMembers}
            size={20}
            className="p-2 rounded-full hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)]"
          >
            <Users />
          </button>
        )}
        <button className="p-2 rounded-full hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)]">
          <Phone size={20} />
        </button>
        <button className="p-2 rounded-full hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)]">
          <Video size={20} />
        </button>
        <button className="p-2 rounded-full hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)]">
          <PanelRight onClick={onOpenConversationInfo} size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
