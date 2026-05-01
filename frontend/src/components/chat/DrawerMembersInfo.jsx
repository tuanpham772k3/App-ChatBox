import React from "react";
import { Drawer } from "antd";
import { ArrowLeft, Key, Search, Trash, UserPlus, Users } from "lucide-react";

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
          <span className="text-xl font-semibold">Thông tin thành viên</span>
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

        {/* Danh sách thành viên */}
        <div>
          {/* Title */}
          <h3 className="px-4 font-medium text-base text-[var(--color-text-primary)]">{`Danh sách thành viên (${members?.length})`}</h3>

          {/* Search */}
          <div className="px-4 py-3">
            <div
              className="flex items-center gap-2 p-2 bg-[var(--color-chat)] 
        hover:bg-[var(--color-hover-soft)] border border-[var(--color-border)] focus-within:border-[var(--color-primary)] rounded-full"
            >
              <Search size={20} color="var(--color-text-secondary)" />
              <input
                type="text"
                placeholder="Tìm kiếm thành viên"
                className="w-full h-5 me-4 text-[var(--color-text-primary)]"
              />
            </div>
          </div>

          {/* Members List */}
          <ul className="flex flex-col overflow-y-auto">
            {sortedMembers.map((member) => (
              <li
                key={member.id}
                className="flex items-center px-4 py-3 hover:bg-[var(--color-hover-surface)] rounded group"
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
                      <h3 className="text-[var(--color-text-secondary)]">Người tạo</h3>
                    )}

                    {member.role === "admin" && (
                      <h3 className="text-[var(--color-text-secondary)]">
                        Quản trị viên
                      </h3>
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
