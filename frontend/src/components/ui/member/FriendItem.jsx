import { Avatar, Checkbox } from "antd";

const FriendItem = ({ friend, isSelected, onToggle }) => {
  return (
    <li
      onClick={onToggle}
      className="flex items-center gap-3 px-2 py-2 hover:bg-[var(--color-hover-soft)] rounded cursor-pointer transition-all"
    >
      {/* Checkbox tự tạo */}

      <Checkbox checked={isSelected} />

      {/* Avatar và tên */}
      <div className="flex items-center gap-2">
        <Avatar src={friend?.avatarUrl.url} alt={friend.username} size={40} />
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          {friend?.username}
        </span>
      </div>
    </li>
  );
};

export default FriendItem;
