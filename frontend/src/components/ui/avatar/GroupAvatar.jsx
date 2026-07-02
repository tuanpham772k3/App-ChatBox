import React from "react";
import UserAvatar from "./UserAvatar";

const POSITIONS = [
  { top: 1, left: 1, zIndex: 3 },
  { top: 1, right: 1, zIndex: 2 },
  { bottom: 1, left: 1 },
  { bottom: 1, right: 1, zIndex: 1 },
];

const GroupAvatar = ({ users, size = 48 }) => {
  const visibleCount = users?.length >= 5 ? 3 : users?.length;
  const visibleUsers = users?.slice(0, visibleCount);
  const membersCount = users?.length;

  const itemSize = size / 1.9;
  return (
    <div
      className="relative shrink-0 rounded-full bg-transparent"
      style={{ width: size, height: size }}
    >
      {visibleUsers.map((user, index) => {
        const pos = POSITIONS[index];

        return (
          <UserAvatar
            key={user.id}
            avatarUrl={user.avatarUrl}
            name={user.displayName}
            className="absolute"
            size={itemSize}
            style={pos}
          />
        );
      })}

      {users?.length >= 5 && (
        <div
          className="absolute bottom-0 right-0 flex items-center justify-center
          bg-[var(--color-chat)] text-[var(--color-text-secondary)] font-semibold
          border-2 border-[var(--color-app)] rounded-full"
          style={{
            width: itemSize,
            height: itemSize,
            fontSize: itemSize / 2,
          }}
        >
          {membersCount}
        </div>
      )}
    </div>
  );
};

export default GroupAvatar;
