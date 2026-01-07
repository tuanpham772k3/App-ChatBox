import React, { useEffect, useState } from "react";
import { Button, Modal, Spin } from "antd";
import { Camera, Search } from "lucide-react";
import { CloseOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { searchUsers } from "@/features/user/userSlice";
import { createGroupConversation } from "@/features/conversations/conversationsSlice";
import FriendItem from "@/shared/components/ui/user/FriendItem";
import { useNotification } from "@/shared/hooks/useNotification";

// Component chính
const ModalCreateGroup = ({ isOpen, onCancel }) => {
  const dispatch = useDispatch();
  const { searchResults = [], loading } = useSelector((state) => state.user);

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
      if (selectedFriends.length < 2) {
        notification.warning({
          message: "No members selected",
          description: "Please select at least two members to create a group.",
        });
        return;
      }

      if (groupName === "") {
        notification.warning({
          message: "Group name is empty",
          description: "Please enter a group name to create a group",
        });
        return;
      }

      // Create conversation
      await dispatch(
        createGroupConversation({ name: groupName, memberIds: selectedFriends })
      ).unwrap();

      // Reset state
      setSelectedFriends([]);
      setGroupName("");
      setSearchText("");
      onCancel(null);
    } catch (error) {
      console.log("Error handle create conversation", error);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      width={500}
      centered
      closeIcon={<CloseOutlined style={{ color: "var(--color-text-secondary)" }} />}
      styles={{
        content: {
          backgroundColor: "var(--color-app)",
          padding: 0,
        },
      }}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-[var(--color-border)]">
        <h2 className="text-[var(--color-text-primary)] text-lg font-semibold">
          Group chat
        </h2>
      </div>
      {/* Body */}
      <div className="flex flex-col px-4">
        <div className="py-4 border-b border-[var(--color-border)]">
          {/* Input */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 flex items-center justify-center border border-[var(--color-border)] rounded-full cursor-pointer">
              <Camera className="text-[var(--color-text-secondary)] text-xl" />
            </div>
            <div className="flex-1 pe-20 py-2 text-[var(--color-text-primary)] border-b-2 border-[var(--color-border)] focus-within:border-blue-500">
              <input
                placeholder="Nhập tên nhóm..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full placeholder-[var(--color-text-secondary)]"
              />
            </div>
          </div>
          {/* Ô tìm kiếm */}
          <div className="relative flex items-center ">
            <Search className="absolute w-4 h-4 left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] z-10" />
            <div className="flex-1 text-[var(--color-text-primary)]">
              <input
                placeholder="Nhập tên hoặc số điện thoại"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full bg-[var(--color-chat)] hover:bg-[var(--color-hover-soft)]
              px-10 py-2 rounded-3xl  placeholder-[var(--color-text-secondary)] border-2 border-[var(--color-border)] focus-within:border-blue-500"
              />
            </div>
          </div>
        </div>
        {/* Danh sách bạn bè */}
        <div className="h-[400px] overflow-y-auto custom-scrollbar">
          <h2 className="my-2 font-medium text-[var(--color-text-primary)]">
            Trò chuyện gần đây
          </h2>
          {loading && (
            <div className="w-full text-center mt-8">
              <Spin />
            </div>
          )}
          {searchResults.length === 0 && !loading ? (
            <div className="text-center py-8 text-[var(--color-text-secondary)]">
              Không tìm thấy kết quả
            </div>
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
      </div>
      {/* Footer */}
      <div className="p-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
        <Button onClick={onCancel}>Hủy</Button>
        <Button onClick={handleCreateGroup} type="primary">
          Tạo nhóm
        </Button>
      </div>
    </Modal>
  );
};

export default ModalCreateGroup;
