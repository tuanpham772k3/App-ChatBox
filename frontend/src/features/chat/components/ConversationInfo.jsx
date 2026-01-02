import React from "react";
import { Bell, LogOut, Pin, Settings, Trash, TriangleAlert, Users } from "lucide-react";
import GroupAvatar from "@/shared/components/ui/avatar/GroupAvatar";
import { getDisplayInfo } from "@/features/conversations/utils/conversationHelper";

const ConversationInfo = ({ conversation, currentUser }) => {
  const headerActions = [
    { id: 1, icon: <Bell size={20} />, label: "Tắt thông báo" },
    { id: 2, icon: <Pin size={20} />, label: "Ghim hội thoại" },
    { id: 3, icon: <Users size={20} />, label: "Thêm thành viên" },
    { id: 4, icon: <Settings size={20} />, label: "Quản lý nhóm" },
  ];
  // Dummy data for images/videos
  const images = [
    { id: 1, src: "/avatarB.jpg", alt: "Image 1" },
    { id: 2, src: "/avatarB.jpg", alt: "Image 2" },
    { id: 3, src: "/avatarB.jpg", alt: "Image 3" },
    { id: 4, src: "/avatarB.jpg", alt: "Image 4" },
    { id: 5, src: "/avatarC.jpg", alt: "Image 5" },
    { id: 6, src: "/avatarC.jpg", alt: "Image 6" },
    { id: 7, src: "/avatarC.jpg", alt: "Image 7" },
    { id: 8, src: "/avatarC.jpg", alt: "Image 8" },
  ];

  const actions = [
    { id: 1, icon: <TriangleAlert />, label: "Báo xấu" },
    { id: 2, icon: <Trash />, label: "Xóa lịch sử trò chuyện", danger: true },
    { id: 3, icon: <LogOut />, label: "Rời nhóm", danger: true },
  ];

  const displayInfo = getDisplayInfo(conversation, currentUser);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 p-4 border-b-4 border-[var(--color-border)]">
        {/* Group Avatar */}
        <GroupAvatar users={displayInfo?.participants} />

        {/* Name conversation */}
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {displayInfo?.displayName}
        </h2>

        {/* Actions-header */}
        <div className="flex justify-around gap-2">
          {/* Item action */}
          {headerActions.map((action) => (
            <div key={action.id} className="flex flex-col items-center gap-2">
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
        <button className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-hover-soft)] rounded">
          <Users size={18} />
          <span>5 thành viên</span>
        </button>
      </div>

      {/* Ảnh & Video */}
      <div className="px-4 py-3 border-b-4 border-[var(--color-border)]">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          Ảnh/Video
        </h3>
        <div className="grid grid-cols-4 gap-2 py-2">
          {images.map((img) => (
            <img
              key={img.id}
              src={img.src}
              alt={img.alt}
              className="w-20 h-20 object-cover rounded cursor-pointer transform hover:scale-105 transition-all drop-shadow-lg "
            />
          ))}
        </div>
        <button className="w-full py-1 my-1 text-base font-semibold text-[var(--color-text-primary)] bg-[var(--color-chat)] hover:bg-[var(--color-hover-soft)] rounded">
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
      {actions.map((action) => (
        <button
          key={action.id}
          className={`w-full flex items-center gap-2 p-4 text-base hover:bg-[var(--color-hover-soft)] rounded 
              ${action.danger ? "text-red-500" : "text-[var(--color-text-primary)]"}`}
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ConversationInfo;
