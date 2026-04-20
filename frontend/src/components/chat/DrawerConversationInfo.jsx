import React from "react";
import { Drawer } from "antd";
import {
  ArrowLeft,
  Bell,
  BrushCleaning,
  Ellipsis,
  Forward,
  LogOut,
  Pin,
  Settings,
  TriangleAlert,
  Users,
} from "lucide-react";
import GroupAvatar from "@/components/ui/avatar/GroupAvatar";

const DrawerConversationInfo = ({
  open,
  onClose,
  displayInfo,
  onOpenMembersInfo,
  onOpenMediaGallery,
  images,
}) => {
  const headerActions = [
    { icon: <Bell size={20} />, label: "Tắt thông báo" },
    { icon: <Pin size={20} />, label: "Ghim hội thoại" },
    { icon: <Users size={20} />, label: "Thêm thành viên" },
    { icon: <Settings size={20} />, label: "Quản lý nhóm" },
  ];

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        closable={false}
        width={360}
        placement="right"
        title={
          <div className="relative flex items-center justify-center">
            <button
              onClick={onClose}
              className="absolute left-0 p-1.5 rounded-full hover:bg-[var(--color-hover-surface)]"
            >
              <ArrowLeft size={22} />
            </button>
            <span className="text-xl font-semibold">Thông tin hội thoại</span>
          </div>
        }
        styles={{ body: { padding: 0 } }}
      >
        <div className="h-full overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 p-4 border-b-4 border-[var(--color-border)]">
            {/* Group Avatar */}
            {displayInfo.isGroup ? (
              <GroupAvatar users={displayInfo.participants || []} size={60} />
            ) : (
              <img
                src={displayInfo.displayAvatar}
                alt={displayInfo.displayName}
                className="w-16 h-16 rounded-full border-2 border-[var(--color-border)]"
              />
            )}

            {/* Name conversation */}
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              {displayInfo?.displayName}
            </h2>

            {/* Actions-header */}
            <div className="flex justify-around gap-2">
              {/* Item action */}
              {headerActions.map((action, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <button
                    aria-label={action.label}
                    className="p-2 bg-[var(--color-chat)] hover:bg-[var(--color-hover-soft)] rounded-full"
                  >
                    {action.icon}
                  </button>
                  <span className="text-center text-xs">{action.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Members */}
          <div className="border-b-4 border-[var(--color-border)]">
            <h3 className="px-4 pt-3 pb-2 text-base font-semibold text-[var(--color-text-primary)]">
              Thành viên nhóm
            </h3>
            <button
              onClick={onOpenMembersInfo}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-hover-soft)] rounded"
            >
              <Users size={18} />
              <span>{`${displayInfo?.participants?.length} thành viên`}</span>
            </button>
          </div>

          {/* Ảnh & Video */}
          <div className="px-4 py-3 border-b-4 border-[var(--color-border)]">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              Ảnh/Video
            </h3>
            <div className="grid grid-cols-4 gap-2 py-2">
              {images.map((img, index) => (
                <div key={index} className="relative w-20 h-20 cursor-pointer group">
                  <img
                    src={img.file.url}
                    alt={img.file.filename}
                    className="w-full h-full aspect-square object-cover rounded"
                  />
                  {/* overlay */}
                  <div className="absolute inset-0 rounded hover:bg-black/5" />
                  <div
                    className="absolute top-1 right-1 flex items-center p-0.5 text-center rounded bg-[var(--color-chat)] 
                opacity-0 group-hover:opacity-100 transition"
                  >
                    <button className="p-1 rounded hover:bg-[var(--color-hover-soft)]">
                      <Forward size={18} color="var(--color-text-primary)" />
                    </button>
                    <button className="p-1 rounded hover:bg-[var(--color-hover-soft)]">
                      <Ellipsis size={18} color="var(--color-text-primary)" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={onOpenMediaGallery}
              className="w-full py-1 my-1 text-base font-semibold text-[var(--color-text-primary)] bg-[var(--color-chat)] hover:bg-[var(--color-hover-soft)] rounded"
            >
              Xem tất cả
            </button>
          </div>

          {/* Files & Links */}
          <div className="px-4 py-3 border-b-4 border-[var(--color-border)]">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              Tệp & Liên kết
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Không có tệp hoặc liên kết nào được chia sẻ trong cuộc trò chuyện này.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col">
            <button className="w-full flex items-center gap-2 p-4 text-base hover:bg-[var(--color-hover-soft)] rounded text-[var(--color-text-primary)]">
              <TriangleAlert />
              <span>Báo xấu</span>
            </button>

            <button className="w-full flex items-center gap-2 p-4 text-base hover:bg-[var(--color-hover-soft)] rounded text-red-500">
              <BrushCleaning />
              <span>Xóa lịch sử trò chuyện</span>
            </button>

            <button
              onClick={() => setOpenLeaveModal(true)}
              className="w-full flex items-center gap-2 p-4 text-base hover:bg-[var(--color-hover-soft)] rounded text-red-500"
            >
              <LogOut />
              <span>Rời nhóm</span>
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default DrawerConversationInfo;
