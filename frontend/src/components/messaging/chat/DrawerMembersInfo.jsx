import React from "react";
import { Drawer } from "antd";
import { Key, Trash, UserPlus } from "lucide-react";
import { SlArrowLeft } from "react-icons/sl";
import UserAvatar from "@/components/ui/avatar/UserAvatar";

const DrawerMembersInfo = ({
  open,
  onClose,
  onOpenAddMembers,
  currentUserId,
  members,
  onRemoveMember,
}) => {
  // Sắp xếp members theo role: owner > admin > member
  const rolePriority = {
    owner: 0,
    admin: 1,
    member: 2,
  };

  const sortedMembers = [...members].sort(
    (a, b) => rolePriority[a.role] - rolePriority[b.role]
  );

  // Logic hiển thị icon xóa thành viên:
  //  -lấy thông tin participant hiện tại
  //  -Logic hiển thị icon xóa:
  const currentUser = members.find((m) => m.id === currentUserId);
  const canShowDeleteIcon = (member) => {
    if (!currentUser) return false;

    // OWNER: xóa tất cả trừ chính mình (owner)
    if (currentUser.role === "owner") {
      return member.id !== currentUserId;
    }

    // ADMIN: chỉ xóa member (không xóa admin, owner)
    if (currentUser.role === "admin") {
      return member.role === "member";
    }

    // MEMBER: không có quyền
    return false;
  };

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
            className="absolute left-0 p-2 rounded-full lg:hidden hover:bg-[var(--color-hover)]"
          >
            <SlArrowLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold">Thành viên</h2>
        </div>
      }
      styles={{ body: { padding: 0 } }}
    >
      <div className="h-full overflow-y-auto custom-scrollbar">
        {/* Nút thêm thành viên */}
        <div className="p-4">
          <button
            onClick={onOpenAddMembers}
            className="w-full flex items-center justify-center gap-2 py-2 font-medium text-base text-[var(--color-text-primary)]
        bg-[var(--color-surface)] hover:bg-[var(--color-hover)] rounded"
          >
            <UserPlus size={16} />
            <p>Thêm thành viên</p>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 ">
          {/* Title */}
          <h3 className="px-4 font-medium text-sm text-[var(--color-text-primary)]">{`Danh sách thành viên (${members?.length})`}</h3>

          {/* Members List */}
          <ul className="flex flex-col gap-1">
            {sortedMembers.map((member) => (
              <li
                key={member?.id}
                className="flex items-center px-4 py-3 hover:bg-[var(--color-hover)] rounded group"
              >
                <div className="min-w-0 flex-1 flex items-center gap-2">
                  {/* Avatar */}
                  <div className="relative">
                    <UserAvatar
                      avatarUrl={member?.avatarUrl}
                      name={member?.name}
                      size={40}
                    />

                    {/* Key */}
                    {member?.role === "owner" && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-zinc-600 rounded-full flex items-center justify-center">
                        <Key size={12} className="text-yellow-300 transform rotate-180" />
                      </div>
                    )}
                  </div>
                  {/* Tên & vai trò */}
                  <div className="min-w-0 flex flex-col justify-center">
                    <h3 className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                      {member?.name}
                    </h3>

                    {member?.role === "owner" && (
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        Trưởng nhóm
                      </span>
                    )}

                    {member?.role === "admin" && (
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        Quản trị viên
                      </span>
                    )}
                  </div>
                </div>

                {/* Chức năng xóa thành viên */}
                {canShowDeleteIcon(member) && (
                  <button
                    onClick={() => onRemoveMember(member?.id)}
                    className="p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition rounded hover:bg-[var(--color-hover)]"
                  >
                    <Trash size={18} color="red" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Drawer>
  );
};

export default DrawerMembersInfo;
