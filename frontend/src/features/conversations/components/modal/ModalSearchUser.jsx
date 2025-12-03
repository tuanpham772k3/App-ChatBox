import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import BaseModal from "@/shared/components/ui/modal/BaseModal";
import FriendItem from "@/shared/components/ui/user/FriendItem";
import { searchUsers } from "@/features/user/userSlice";
import { createConversation } from "../../conversationsSlice";
import { useNotification } from "@/shared/hooks/useNotification";
// import { useNotification } from "@/hooks/useNotification";

const ModalSearchUser = ({ isModalOpen, handleCancel }) => {
  const dispatch = useDispatch();
  const { searchResults = [] } = useSelector((state) => state.user);

  const [selectedFriend, setSelectedFriend] = useState("");
  const [searchText, setSearchText] = useState("");

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
    // Nếu click lại người đã chọn => bỏ chọn
    setSelectedFriend((prev) => (prev === friendId ? "" : friendId));
  };

  // Xử lý khi nhấn nút "Tạo nhóm"
  const handleCreateGroup = async () => {
    try {
      if (selectedFriend.length === 0) {
        notification.warning({
          message: "No members selected",
          description: "Please select one member to create a private chat.",
        });
        return;
      }

      // Create conversation
      await dispatch(createConversation(selectedFriend)).unwrap();

      // Reset state
      setSelectedFriend([]);
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
      width={400}
      title="Private chat"
    >
      {/* Ô tìm kiếm */}
      <div className="px-4 py-4 border-b border-[var(--color-border)]">
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
        {searchResults.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Không tìm thấy kết quả</div>
        ) : (
          searchResults.map((friend) => (
            <FriendItem
              key={friend._id}
              friend={friend}
              isSelected={selectedFriend === friend._id}
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
          Nhắn tin
        </Button>
      </div>
    </BaseModal>
  );
};

export default ModalSearchUser;
