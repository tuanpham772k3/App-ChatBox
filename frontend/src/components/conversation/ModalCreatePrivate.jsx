import React, { useEffect, useState } from "react";
import { Button, Modal, Spin } from "antd";
import { useDispatch } from "react-redux";
import { CloseOutlined } from "@ant-design/icons";
import FriendItem from "@/components/ui/member/FriendItem";
import { searchUsers } from "@/store/userSlice";
import { createConversation } from "../../store/conversationsSlice";
import { useNotification } from "@/hooks/useNotification";
import SearchBar from "../ui/search/SearchBar";

const ModalCreatePrivate = ({ isOpen, onCancel }) => {
  const dispatch = useDispatch();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState("");
  const [searchText, setSearchText] = useState("");

  const notification = useNotification();

  const fetchUsers = async (query = "") => {
    try {
      setLoading(true);
      const users = await dispatch(searchUsers(query)).unwrap();
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

    const handler = setTimeout(() => {
      fetchUsers(query);
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
      width="min(calc(100vw - 2rem), 25rem)"
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
      <div className="flex flex-col gap-2 p-4">
        {/* Search */}
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Tìm kiếm thành viên..."
        />

        {/* ====== Friends List ====== */}
        <ul className="max-h-[min(60vh,25rem)] flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="w-full text-center mt-8">
              <Spin />
            </div>
          ) : (
            results.length === 0 && (
              <div className="text-center mt-8 text-[var(--color-text-secondary)]">
                Không có người dùng nào
              </div>
            )
          )}

          {results.map((friend) => (
            <FriendItem
              key={friend._id}
              friend={friend}
              isSelected={selectedFriend === friend._id}
              onToggle={() => toggleFriend(friend._id)}
            />
          ))}
        </ul>
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
