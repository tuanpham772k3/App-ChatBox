import React from "react";
import { Drawer } from "antd";
import { ArrowLeft, Key, Search, Trash, Users } from "lucide-react";

const DrawerMembersInfo = ({ open, onClose, openModal, members, onRemoveMember }) => {
  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (a.role !== "admin" && b.role === "admin") return 1;
    return 0;
  });

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
            onClick={() => openModal("addMembers")}
            className="w-full flex items-center justify-center gap-2 py-2 font-medium text-base text-[var(--color-text-primary)] 
        bg-[var(--color-chat)] hover:bg-[var(--color-hover-soft)] rounded"
          >
            <Users size={16} />
            <p>Thêm thành viên</p>
          </button>
        </div>

        {/* Danh sách thành viên */}
        <div>
          {/* Title */}
          <h3 className="px-4 font-medium text-sm text-[var(--color-text-primary)]">{`Danh sách thành viên (${members?.length})`}</h3>

          {/* Search */}
          <div className="px-4 py-3">
            <div
              className="flex items-center gap-2 p-1 bg-[var(--color-chat)] 
        hover:bg-[var(--color-hover-soft)] border border-[var(--color-border)] focus-within:border-[var(--color-primary)] rounded-full"
            >
              <Search size={18} color="var(--color-text-secondary)" />
              <input
                type="text"
                placeholder="Tìm kiếm thành viên"
                className="flex-1 pe-2 text-[var(--color-text-primary)]"
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

                    {member.role === "admin" && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-zinc-600 rounded-full flex items-center justify-center">
                        <Key size={12} className="text-yellow-300 transform rotate-180" />
                      </div>
                    )}
                  </div>
                  {/* Name & role */}
                  <div className="flex flex-col justify-center">
                    <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                      {member.name}
                    </h3>

                    {member.role === "admin" && (
                      <h3 className="text-[var(--color-text-secondary)]">Trưởng nhóm</h3>
                    )}
                  </div>
                </div>

                {/* Chức năng admin */}
                {member.role === "member" && (
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
