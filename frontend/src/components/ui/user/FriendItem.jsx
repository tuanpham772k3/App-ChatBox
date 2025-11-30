import { Avatar } from "antd";
import { Check } from "lucide-react";

const FriendItem = ({ friend, isSelected, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors"
    >
      {/* Checkbox tự tạo */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          isSelected ? "bg-blue-500 border-blue-500" : "border-gray-500 bg-transparent"
        }`}
      >
        {isSelected && <Check className="w-3 h-3 text-white" />}
      </div>

      {/* Avatar và tên */}
      <Avatar src={friend?.avatarUrl?.url} size={40} />
      <span className="text-white text-sm">{friend?.username}</span>
    </div>
  );
};

export default FriendItem;
