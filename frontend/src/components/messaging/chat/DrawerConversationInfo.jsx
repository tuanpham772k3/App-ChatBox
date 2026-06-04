import React from "react";
import { Drawer } from "antd";
import { SlArrowLeft } from "react-icons/sl";
import {
  Bell,
  Ellipsis,
  Forward,
  LogOut,
  Pin,
  PinOff,
  Settings,
  Trash,
  TriangleAlert,
  UserPlus,
  UsersRound,
} from "lucide-react";
import GroupAvatar from "@/components/ui/avatar/GroupAvatar";
import UserAvatar from "@/components/ui/avatar/UserAvatar";

const DrawerConversationInfo = ({
  open,
  onClose,
  displayInfo,
  onTogglePin,
  onClearHistory,
  onOpenLeaveGroup,
  onOpenMembersInfo,
  onOpenMediaGallery,
  images,
}) => {
  const isPinned = Boolean(displayInfo.currentUser?.pinnedAt);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      closable={false}
      width="min(100vw, 26.875rem)"
      placement="right"
      title={
        <div className="relative flex items-center justify-center">
          <button
            onClick={onClose}
            className="absolute left-0 p-2 lg:hidden rounded-full hover:bg-[var(--color-hover)]"
          >
            <SlArrowLeft size={18} />
          </button>
          <span className="text-lg font-semibold">Thông tin nhóm</span>
        </div>
      }
      styles={{ body: { padding: 0 } }}
    >
      <div className="h-full overflow-y-auto custom-scrollbar">
        {/* ====== Header ====== */}
        <div className="flex flex-col items-center gap-2 p-4 border-b-4 border-[var(--color-border)]">
          {/* Avatar || Group avatar */}
          {displayInfo.isGroup ? (
            <GroupAvatar users={displayInfo.participants || []} size={60} />
          ) : (
            <UserAvatar
              name={displayInfo.displayName}
              avatarUrl={displayInfo.displayAvatar}
              size={60}
            />
          )}

          {/* ====== Name Conversation ====== */}
          <h2 className="max-w-full truncate text-lg font-semibold text-[var(--color-text-primary)]">
            {displayInfo?.displayName}
          </h2>

          {/* ====== Actions-Header ====== */}
          <div className="w-full grid grid-cols-4 place-items-center gap-1">
            {/* Action Item */}
            <div className="w-full max-w-[75px] flex flex-col items-center gap-2">
              <button
                aria-label="Tắt thông báo"
                className="p-2 bg-[var(--color-surface)] hover:bg-[var(--color-hover)] rounded-full"
              >
                <Bell size={20} />
              </button>
              <span className="text-center text-xs">Tắt thông báo</span>
            </div>
            {/* Action Item */}
            <div className="w-full max-w-[75px] flex flex-col items-center gap-2">
              <button
                aria-label="Gim"
                onClick={onTogglePin}
                className={`rotate-45 p-2 bg-[var(--color-surface)]  rounded-full ${
                  isPinned
                    ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
                    : "hover:bg-[var(--color-hover)]"
                }`}
              >
                {isPinned ? <PinOff size={20} /> : <Pin size={20} />}
              </button>
              <span className="text-center text-xs">
                {isPinned ? "Bỏ ghim hội thoại" : "Ghim hội thoại"}
              </span>
            </div>
            {/* Action Item */}
            <div className="w-full max-w-[75px] flex flex-col items-center gap-2">
              <button
                aria-label="Thêm thành viên"
                className="p-2 bg-[var(--color-surface)] hover:bg-[var(--color-hover)] rounded-full"
              >
                <UserPlus size={20} />
              </button>
              <span className="text-center text-xs">Thêm thành viên</span>
            </div>
            {/* Action Item */}
            <div className="w-full max-w-[75px] flex flex-col items-center gap-2">
              <button
                aria-label="Quản lý nhóm"
                className="p-2 bg-[var(--color-surface)] hover:bg-[var(--color-hover)] rounded-full"
              >
                <Settings size={20} />
              </button>
              <span className="text-center text-xs">Quản lý nhóm</span>
            </div>
          </div>
        </div>

        {/* ====== Members Info ====== */}
        <div className="border-b-4 border-[var(--color-border)]">
          <h3 className="px-4 pt-3 pb-2 text-base font-semibold text-[var(--color-text-primary)]">
            Thành viên nhóm
          </h3>
          <button
            onClick={onOpenMembersInfo}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] rounded"
          >
            <UsersRound size={20} />
            <span>{`${displayInfo?.participants?.length} thành viên`}</span>
          </button>
        </div>

        {/* ====== Gallery ====== */}
        <div className="px-4 py-3 border-b-4 border-[var(--color-border)]">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            Ảnh/Video
          </h3>
          <div className="grid grid-cols-4 gap-2 py-2">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative group aspect-square min-w-0 cursor-pointer"
              >
                <img
                  src={img.file.url}
                  alt={img.file.filename}
                  className="w-full h-full object-cover rounded"
                />
                {/* Overlay */}
                <div className="absolute inset-0 rounded hover:bg-black/20" />

                <div
                  className="absolute top-1 right-1 flex items-center p-0.5 text-center rounded bg-[var(--color-surface)]
                    opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                >
                  <button className="p-1 rounded hover:bg-[var(--color-hover)]">
                    <Forward size={18} color="var(--color-text-primary)" />
                  </button>
                  <button className="p-1 rounded hover:bg-[var(--color-hover)]">
                    <Ellipsis size={18} color="var(--color-text-primary)" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={onOpenMediaGallery}
            className="w-full py-1 my-1 text-base font-semibold text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:bg-[var(--color-hover)] rounded"
          >
            Xem tất cả
          </button>
        </div>

        {/* ====== Files & Links ====== */}
        <div className="px-4 py-3 border-b-4 border-[var(--color-border)]">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            Tệp & Liên kết
          </h3>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Không có tệp hoặc liên kết nào được chia sẻ trong cuộc trò chuyện này.
          </p>
        </div>

        {/* ====== Actions ====== */}
        <div className="flex flex-col">
          <button className="w-full flex items-center gap-2 p-4 text-sm hover:bg-[var(--color-hover)] rounded text-[var(--color-text-primary)]">
            <TriangleAlert size={20} />
            <span>Báo xấu</span>
          </button>

          <button
            onClick={onClearHistory}
            className="w-full flex items-center gap-2 p-4 text-sm hover:bg-[var(--color-hover)] rounded text-red-500"
          >
            <Trash size={20} />
            <span>Xóa lịch sử trò chuyện</span>
          </button>

          <button
            onClick={onOpenLeaveGroup}
            className="w-full flex items-center gap-2 p-4 text-sm hover:bg-[var(--color-hover)] rounded text-red-500"
          >
            <LogOut size={20} />
            <span>Rời nhóm</span>
          </button>
        </div>
      </div>
    </Drawer>
  );
};

export default DrawerConversationInfo;
