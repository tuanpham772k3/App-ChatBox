import React, { useEffect, useState } from "react";
import { Button, Modal, Spin } from "antd";
import { Camera, Search } from "lucide-react";
import { CloseOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { searchUsers } from "@/store/userSlice";
import { createGroupConversation } from "@/store/conversationsSlice";
import FriendItem from "@/components/ui/member/FriendItem";
import { useNotification } from "@/hooks/useNotification";
import SearchBar from "../ui/search/SearchBar";

// Component chính
const ModalCreateGroup = ({ isOpen, onCancel }) => {
  const dispatch = useDispatch();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [groupName, setGroupName] = useState("");

  const notification = useNotification();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await dispatch(searchUsers("")).unwrap();
      setResults(users);
    } catch (error) {
      notification.error({
        message: "Không thể tải danh sách người dùng",
        description: error.message || "Vui lòng thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách user
  useEffect(() => {
    fetchUsers();
  }, [dispatch]);

  // Tìm kiếm bạn bè khi searchText thay đổi
  useEffect(() => {
    const query = searchText.trim();
    if (!query) return;

    const handler = setTimeout(() => {
      fetchUsers(query);
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
      notification.error({
        message: "Tạo nhóm thất bại",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại",
      });
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
            <div className="flex-1 pe-20 p-2 text-[var(--color-text-primary)] border-b-2 border-[var(--color-border)] focus-within:border-blue-500">
              <input
                placeholder="Nhập tên nhóm..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full placeholder-[var(--color-text-secondary)]"
              />
            </div>
          </div>

          {/* Search */}
          <SearchBar placeholder={"Tìm kiếm thành viên..."} />
        </div>

        {/* ====== Friends List ====== */}
        <ul className="h-full max-h-[400px] flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="w-full text-center mt-8">
              <Spin />
            </div>
          ) : (
            results.length === 0 && (
              <div className="text-center py-8 text-[var(--color-text-secondary)]">
                Không tìm thấy kết quả
              </div>
            )
          )}

          {results.map((friend) => (
            <FriendItem
              key={friend._id}
              friend={friend}
              isSelected={selectedFriends.includes(friend._id)}
              onToggle={() => toggleFriend(friend._id)}
            />
          ))}
        </ul>
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
