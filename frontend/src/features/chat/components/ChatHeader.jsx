import React from "react";
import { ArrowLeft, PanelRight, Phone, UserRound, Users, Video } from "lucide-react";
import GroupAvatar from "@/shared/components/ui/avatar/GroupAvatar";

const ChatHeader = ({
  onBackToList,
  openDrawerInfo,
  openModal,
  displayInfo,
  partnerStatus,
}) => {
  return (
    <div className="flex items-center justify-between px-4 h-24 border-b border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        {/* Back button (only visible on mobile) */}
        <button
          onClick={onBackToList}
          className="md:hidden mr-2 text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={20} />
        </button>

        {/* --- Avatar --- */}
        <div className="relative">
          {displayInfo.isGroup ? (
            // Nếu là nhóm thì hiển thị GroupAvatar
            <GroupAvatar users={displayInfo.participants} size={48} />
          ) : (
            // Nếu là cá nhân thì hiển thị avatar người dùng
            <>
              <img
                src={displayInfo.displayAvatar}
                alt={displayInfo.displayName}
                className="w-13 h-13 rounded-full border-2 border-[var(--color-border)]"
              />
              {/* Trạng thái người dùng */}
              {partnerStatus?.status === "online" && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--color-app)] rounded-full" />
              )}
            </>
          )}
        </div>

        {/* --- Info --- */}
        <div className="flex flex-col">
          {/* --- Display Name --- */}
          <h3 className="text-[var(--color-text-primary)] font-semibold">
            {displayInfo.displayName}
          </h3>

          {/* -- User status or number of group members -- */}
          {displayInfo.isGroup ? (
            // Hiển thị số thành viên nếu là nhóm
            <button
              onClick={() => openDrawerInfo("membersInfo")}
              type="button"
              className="flex items-center gap-1 text-[var(--color-text-secondary)]"
            >
              <UserRound size={18} />
              <span className="text-sm">{`${displayInfo.participants.length} thành viên`}</span>
            </button>
          ) : (
            // Hiển thị trạng thái nếu là cuộc trò chuyện cá nhân
            <span className="text-xs text-[var(--color-text-secondary)]">
              {partnerStatus?.status === "online" ? "Đang hoạt động" : "Ngoại tuyến"}
            </span>
          )}
        </div>
      </div>

      {/* --- Action icons --- */}
      <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
        {/* --- Add members (only for group) --- */}
        {displayInfo.isGroup && (
          <button className="p-2 rounded-full hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)]">
            <Users onClick={openModal} size={20} />
          </button>
        )}

        {/* --- Voice call --- */}
        <button className="p-2 rounded-full hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)]">
          <Phone size={20} />
        </button>

        {/* --- Video call --- */}
        <button className="p-2 rounded-full hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)]">
          <Video size={20} />
        </button>

        {/* --- Info panel --- */}
        <button className="p-2 rounded-full hover:bg-[var(--color-icon-hover-bg)] hover:text-[var(--color-icon-hover-text)]">
          <PanelRight onClick={() => openDrawerInfo("conversationInfo")} size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
