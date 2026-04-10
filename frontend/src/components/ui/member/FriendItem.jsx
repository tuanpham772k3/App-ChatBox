import { Avatar, Checkbox } from "antd";

const FriendItem = ({ friend, isSelected, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      className="flex items-center gap-3 px-2 py-2 hover:bg-[var(--color-hover-soft)] rounded cursor-pointer transition-all"
    >
      {/* Checkbox tự tạo */}
      <Checkbox checked={isSelected} />

      {/* Avatar và tên */}
      <div className="flex items-center gap-2">
        <img
          src={friend?.avatarUrl.url}
          alt={friend.username}
          className="w-11 h-11 border-2 border-[var(--color-border)] rounded-full object-cover"
        />
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          {friend?.username}
        </span>
      </div>
    </div>
  );
};

export default FriendItem;
