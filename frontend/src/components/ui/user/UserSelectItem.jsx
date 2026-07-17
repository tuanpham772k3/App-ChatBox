import { Checkbox } from "antd";
import UserAvatar from "../avatar/UserAvatar";

const UserSelectItem = ({ user, isSelected, onToggle, disabled }) => {
  return (
    <li
      onClick={() => !disabled && onToggle()}
      className={`min-w-0 flex items-center gap-3 px-2 py-2 rounded transition-all
        ${
          disabled
            ? "opacity-70 cursor-not-allowed"
            : "cursor-pointer hover:bg-[var(--color-hover)]"
        }`}
    >
      <Checkbox
        checked={isSelected}
        disabled={disabled}
        onClick={(e) => e.stopPropagation()}
        onChange={onToggle}
      />

      <div className="min-w-0 flex items-center gap-2">
        <UserAvatar avatarUrl={user?.avatar?.url} name={user.displayName} size={40} />
        <div className="flex flex-col">
          <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
            {user?.displayName}
          </span>

          {disabled && (
            <span className="text-xs text-[var(--color-text-secondary)]">
              Đã tham gia
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

export default UserSelectItem;
