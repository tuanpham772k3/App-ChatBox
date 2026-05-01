import React from "react";
import { Drawer } from "antd";
import { ArrowLeft, Key, Trash, UserPlus } from "lucide-react";
import SearchBar from "../ui/search/SearchBar";

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
          <h2 className="text-xl font-semibold">Thông tin thành viên</h2>
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
        bg-[var(--color-chat)] hover:bg-[var(--color-hover-soft)] rounded"
          >
            <UserPlus size={20} />
            <p>Thêm thành viên</p>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4 ">
          {/* Title */}
          <h3 className="font-medium text-base text-[var(--color-text-primary)]">{`Danh sách thành viên (${members?.length})`}</h3>

          {/* Search */}
          <SearchBar placeholder="Tìm kiếm thành viên..." />

          {/* Members List */}
          <ul className="flex flex-col gap-1">
            {sortedMembers.map((member) => (
              <li
                key={member.id}
                className="flex items-center px-2 py-3 hover:bg-[var(--color-hover-surface)] rounded group"
              >
                <div className="flex-1 flex items-center gap-2">
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-[var(--color-border)]"
                    />

                    {/* Key */}
                    {member.role === "owner" && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-zinc-600 rounded-full flex items-center justify-center">
                        <Key size={12} className="text-yellow-300 transform rotate-180" />
                      </div>
                    )}
                  </div>
                  {/* Tên & vai trò */}
                  <div className="flex flex-col justify-center">
                    <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                      {member.name}
                    </h3>

                    {member.role === "owner" && (
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        Người tạo
                      </span>
                    )}

                    {member.role === "admin" && (
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        Quản trị viên
                      </span>
                    )}
                  </div>
                </div>

                {/* Chức năng xóa thành viên */}
                {canShowDeleteIcon(member) && (
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 transition rounded hover:bg-[var(--color-hover-soft)]"
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
