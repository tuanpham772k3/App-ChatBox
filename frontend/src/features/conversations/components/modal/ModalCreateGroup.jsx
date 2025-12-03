import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { Camera, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { searchUsers } from "@/features/user/userSlice";
import { createConversation } from "@/features/conversations/conversationsSlice";
import BaseModal from "@/shared/components/ui/modal/BaseModal";
import FriendItem from "@/shared/components/ui/user/FriendItem";
import { useNotification } from "@/shared/hooks/useNotification";

// Component chính
const ModalCreateGroup = ({ isModalOpen, handleCancel }) => {
  const dispatch = useDispatch();
  const { searchResults = [] } = useSelector((state) => state.user);

  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [groupName, setGroupName] = useState("");

  const notification = useNotification();

  // Lấy danh sách gợi ý ban đầu
  useEffect(() => {
    dispatch(searchUsers(""));
  }, []);

  // Tìm kiếm bạn bè khi searchText thay đổi
  useEffect(() => {
    const query = searchText.trim();

    const handler = setTimeout(() => {
      dispatch(searchUsers(query));
    }, 400);

    return () => clearTimeout(handler);
  }, [searchText, dispatch]);

  // Hàm xử lý chọn/bỏ chọn bạn bè
  const toggleFriend = (friendId) => {
    setSelectedFriends((prev) => {
      if (prev.includes(friendId)) {
        // Nếu đã chọn thì bỏ chọn
        return prev.filter((id) => id !== friendId);
      } else {
        // Nếu chưa chọn thì thêm vào
        return [...prev, friendId];
      }
    });
  };

  // Xử lý khi nhấn nút "Tạo nhóm"
  const handleCreateGroup = async () => {
    try {
      if (selectedFriends.length === 0) {
        notification.warning({
          message: "No members selected",
          description: "Please select at least one member to create a group.",
        });
        return;
      }

      // Create conversation
      await dispatch(createConversation({ selectedFriends })).unwrap();

      const selectedMembers = searchResults.filter((f) => selectedFriends.includes(f.id));

      console.log("Tên nhóm:", groupName || "Nhóm mới");
      console.log("Thành viên:", selectedMembers);

      // Reset state
      setSelectedFriends([]);
      setGroupName("");
      setSearchText("");
    } catch (error) {
      console.log("Error handle create conversation", error);
    }
  };

  return (
    <BaseModal
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={500}
      title="Group chat"
    >
      {/* Input */}
      <div className="px-4 py-4 border-b border-[var(--color-border)]">
        {/* Input tên nhóm */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
            <Camera className="text-gray-400 text-xl" />
          </div>
          <div className="flex-1 pb-2 border-b border-[var(--color-border)] text-white focus-within:border-blue-500">
            <input
              placeholder="Nhập tên nhóm..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full placeholder-[var(--color-text-secondary)]"
            />
          </div>
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative flex items-center">
          <Search className="absolute w-4 h-4 left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] z-10" />
          <div className="flex-1 text-white">
            <input
              placeholder="Nhập tên"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-[var(--bg-black)]  border-[#2c2c2e] px-10 py-2 rounded-3xl  placeholder-[var(--color-text-secondary)]"
            />
          </div>
        </div>
      </div>

      {/* Danh sách bạn bè */}
      <div className="h-[400px] overflow-y-auto custom-scrollbar">
        <div className="px-4 py-1">
          <h2 className="text-white font-medium"> Danh sách bạn bè</h2>
        </div>
        {searchResults.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Không tìm thấy kết quả</div>
        ) : (
          searchResults.map((friend) => (
            <FriendItem
              key={friend._id}
              friend={friend}
              isSelected={selectedFriends.includes(friend._id)}
              onToggle={() => toggleFriend(friend._id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
        <Button
          onClick={handleCancel}
          className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Hủy
        </Button>
        <Button
          onClick={handleCreateGroup}
          type="primary"
          className="bg-blue-600 hover:bg-blue-700 border-none"
        >
          Tạo nhóm
        </Button>
      </div>
    </BaseModal>
  );
};

export default ModalCreateGroup;
