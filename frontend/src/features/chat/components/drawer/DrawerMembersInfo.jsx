import React from "react";
import { Drawer } from "antd";
import { Key, Search, Users } from "lucide-react";

const DrawerMembersInfo = ({ open, onClose, openModal, members }) => {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={360}
      title={<div style={{ fontSize: "1.25rem", fontWeight: 600 }}>Thành viên</div>}
      placement="right"
      styles={{ body: { padding: 0 }, header: { textAlign: "center" } }}
    >
      <div className="h-full overflow-y-auto custom-scrollbar">
        {/* Nút thêm thành viên */}
        <div className="p-4">
          <button
            onClick={openModal}
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
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center px-4 py-3 hover:bg-[var(--color-hover-soft)] rounded"
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
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {member.name}
                    </p>

                    {member.role === "admin" && (
                      <p className="text-[var(--color-text-secondary)]">Trưởng nhóm</p>
                    )}
                  </div>
                </div>

                <div>
                  <button className="px-4 py-1.5 font-medium bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded">
                    Kết bạn
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Drawer>
  );
};

export default DrawerMembersInfo;
