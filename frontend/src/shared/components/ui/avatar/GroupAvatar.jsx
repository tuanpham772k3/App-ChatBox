import React from "react";

const GroupAvatar = ({ users, size = 48 }) => {
  const visibleCount = users.length >= 5 ? 3 : users.length;
  const visibleUsers = users.slice(0, visibleCount);
  const membersCount = users.length;

  const itemSize = size/2;
  return (
    <div
      className="relative rounded-full bg-[var(--color-app)]"
      style={{ width: size, height: size }}
    >
      {visibleUsers.map((user, index) => {
        const positions = [
          { top: 1, left: 1, zIndex: 3 },
          { top: 1, right: 1, zIndex: 2 },
          { bottom: 1, left: 1 },
          { bottom: 1, right: 1, zIndex: 1 },
        ];

        const pos = positions[index];

        return (
          <img
            key={user.id}
            src={user.avatarUrl}
            alt={user.name}
            className="absolute rounded-full object-cover border-1 border-[var(--color-border)]"
            style={{
              width: itemSize,
              height: itemSize,
              ...pos,
            }}
          />
        );
      })}

      {users.length >= 5 && (
        <div
          className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-[var(--color-chat)] text-[10px] font-semibold border-2 border-[var(--color-app)]"
          style={{ width: itemSize, height: itemSize }}
        >
          {membersCount}
        </div>
      )}
    </div>
  );
};

export default GroupAvatar;
