import React, { useEffect, useState } from "react";
import { Button, Modal, Spin } from "antd";
import { Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { CloseOutlined } from "@ant-design/icons";
import FriendItem from "@/shared/components/ui/user/FriendItem";
import { searchUsers } from "@/features/user/userSlice";
import { createConversation } from "../../conversationsSlice";
import { useNotification } from "@/shared/hooks/useNotification";

const ModalCreatePrivate = ({ isOpen, onCancel }) => {
  const dispatch = useDispatch();
  const { searchResults = [], loading } = useSelector((state) => state.user);

  const [selectedFriend, setSelectedFriend] = useState("");
  const [searchText, setSearchText] = useState("");

  const notification = useNotification();

  // Lấy danh sách gợi ý ban đầu
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        await dispatch(searchUsers("")).unwrap();
      } catch (error) {
        notification.error({
          message: "Không thể tải danh sách người dùng",
          description: error.message || "Vui lòng thử lại sau",
        });
      }
    };

    fetchUsers();
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

  // Xử lý tạo nhóm chat 1-1
  const handleCreatePrivate = async () => {
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
      setSelectedFriend("");
      setSearchText("");
      onCancel(null);
    } catch (error) {
      notification.error({
        message: "Tạo cuộc hội thoại thất bại",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại",
      });
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      width={400}
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
      <div className="p-4 border-b border-[var(--color-border)]">
        <h2 className="text-[var(--color-text-primary)] text-lg font-semibold">
          Private chat
        </h2>
      </div>
      {/* Body */}
      <div className="flex flex-col px-4">
        {/* Ô tìm kiếm */}
        <div className="py-4 border-b border-[var(--color-border)]">
          <div className="relative flex items-center">
            <Search className="absolute w-4 h-4 left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] z-10" />
            <div className="flex-1 text-[var(--color-text-primary)]">
              <input
                placeholder="Nhập tên"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full bg-[var(--color-chat)] hover:bg-[var(--color-hover-soft)] px-10 py-2 rounded-3xl
                placeholder-[var(--color-text-secondary)] border-2 border-[var(--color-border)] focus-within:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Danh sách bạn bè */}
        <div className="h-[400px] overflow-y-auto custom-scrollbar">
          {loading && (
            <div className="w-full text-center mt-8">
              <Spin />
            </div>
          )}
          {searchResults.length === 0 && !loading ? (
            <div className="text-center mt-8 text-[var(--color-text-secondary)]">
              Không tìm thấy kết quả
            </div>
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
      </div>
      {/* Footer */}
      <div className="p-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
        <Button onClick={onCancel}>Hủy</Button>
        <Button onClick={handleCreatePrivate} type="primary">
          Nhắn tin
        </Button>
      </div>
    </Modal>
  );
};

export default ModalCreatePrivate;
