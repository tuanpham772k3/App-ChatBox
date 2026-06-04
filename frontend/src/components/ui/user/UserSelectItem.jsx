import { Checkbox } from "antd";
import UserAvatar from "../avatar/UserAvatar";

const UserSelectItem = ({ user, isSelected, onToggle }) => {
  return (
    <li
      onClick={onToggle}
      className="min-w-0 flex items-center gap-3 px-2 py-2 hover:bg-[var(--color-hover)] rounded cursor-pointer transition-all"
    >
      <Checkbox
        checked={isSelected}
        onClick={(e) => e.stopPropagation()}
        onChange={onToggle}
      />

      <div className="min-w-0 flex items-center gap-2">
        <UserAvatar avatarUrl={user?.avatar?.url} name={user.username} size={40} />
        <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
          {user?.username}
        </span>
      </div>
    </li>
  );
};

export default UserSelectItem;
